import dotenv from 'dotenv'
import express from 'express'
import ejs from 'ejs'
import session from 'express-session'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import User from './userModel.js'
import connectDB from './db.js'

dotenv.config()

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
passport.serializeUser((user, cb) => {
  cb(null, user.id)
})

// Deserialize user data by searching for the googleID in Mongo.
passport.deserializeUser((id, cb) => {
  User.findById(id, (err, user) => {
    cb(err, user)
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
    (accessToken, refreshToken, profile, cb) => {
      // Search for the current user in Mongo
      User.findOne(
        {
          googleId: profile.id,
        },
        (err, user) => {
          if (err) {
            return cb(err)
          }
          if (!user) {
            // User wasn't found in Mongo.
            // Create and save a new User document.
            user = new User({
              email: profile.email,
              googleId: profile.id,
              googleProfile: profile._json,
            })
            user.save((err) => {
              if (err) console.log(err)
              return cb(err, user)
            })
          } else {
            // User was found in Mongo. Return the user.
            return cb(err, user)
          }
        }
      )
    }
  )
)

app.get('/', (req, res) => {
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
  (req, res) => {
    // Successful authentication, redirect to private.
    res.redirect('/private-route')
  }
)

app.get('/public-route', (req, res) => {
  res.render('public-route')
})

app.get('/private-route', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('private-route', {
      fname: req.user.googleProfile.name,
      email: req.user.googleProfile.email,
    })
  } else {
    res.redirect('/')
  }
})

app.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})

app.listen(port, () => {
  console.log('Express listening on port ' + port + '...')
})
