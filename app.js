require('dotenv').config()
const express = require('express')
const ejs = require('ejs')

const session = require('express-session')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy

const User = require('./userModel.js')
const connectDB = require('./db.js')
connectDB()

// EXPRESS CONFIGURATION
const app = express()
const port = 3000

app.use(express.static('public'))
app.set('view engine', 'ejs')

// If Passport authentication succeeds, a session will be established and maintained via a cookie set in the user's browser.
// Subsequent requests will not contain credentials, but rather the unique cookie that identifies the session.
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
)

app.use(passport.initialize())
app.use(passport.session())

passport.use(User.createStrategy())

// To support login sessions, passport serializes user instances to and from the session.
passport.serializeUser(function (user, done) {
  // Set user information in a cookie
  done(null, user.id)
})

passport.deserializeUser(function (id, done) {
  // Get user information from a cookie
  User.findById(id, function (err, user) {
    done(err, user)
  })
})

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    function (accessToken, refreshToken, profile, cb) {
      console.log(profile)
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

// When a user clicks 'Sign in with Google'
// Passport redirects all auth activities to Google
app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile'] })
)

// After authentication, users are directed to this CALLBACK_URL
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
    console.log(req.user)
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
