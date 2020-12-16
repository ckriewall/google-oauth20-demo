require('dotenv').config()
const express = require('express')
const ejs = require('ejs')
const session = require('express-session')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const User = require('./userModel.js')
const connectDB = require('./db.js')

// Connect to MongoDB
connectDB()

// Configure Express
const app = express()
const port = 3000
app.use(express.static('public'))

// Specify a Templating Engine
app.set('view engine', 'ejs')

/*
  When Passport authentication succeeds, a session will be 
  established and maintained via a cookie set in the user's browser.
  Subsequent requests will not contain credentials, but rather 
  the unique cookie that identifies the session.
  http://expressjs.com/en/resources/middleware/session.html
*/
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
)

// Initialize passport and persist session data
app.use(passport.initialize())
app.use(passport.session())

// Serialize user data in a cookie to support login sessions.
passport.serializeUser(function (user, done) {
  done(null, user.id)
})

// Deserialize user data by searching for the googleID in Mongo.
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user)
  })
})

// Configure the Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    function (accessToken, refreshToken, profile, cb) {
      // Save Google profile data to Mongo
      User.findOrCreate(
        {
          email: profile.email,
          googleId: profile.id,
          googleProfile: profile._json,
        },
        function (err, user) {
          return cb(err, user)
        }
      )
    }
  )
)

app.get('/', function (req, res) {
  res.render('home')
})

// AUTHENTICATE USERS.
// Users click 'Sign in with Google'.
// Passport redirects all auth activities to Google.
const googleScope = { scope: ['email', 'profile'] }
app.get('/auth/google', passport.authenticate('google', googleScope))

// After authentication, users are directed to this CALLBACK_URL.
// Passport confirms the user is authenticated before displaying
// protected content.
app.get(
  '/auth/google/redirect',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function (req, res) {
    // Successful authentication, redirect to private.
    res.redirect('/private-route')
  }
)

app.get('/public-route', function (req, res) {
  res.render('public-route')
})

app.get('/private-route', function (req, res) {
  if (req.isAuthenticated()) {
    res.render('private-route', {
      fname: req.user.googleProfile.name,
      email: req.user.googleProfile.email,
    })
  } else {
    res.redirect('/')
  }
})

app.get('/logout', function (req, res) {
  req.logout()
  res.redirect('/')
})

app.listen(port, function () {
  console.log('Express listening on port ' + port + '...')
})
