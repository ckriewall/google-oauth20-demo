require('dotenv').config()
const express = require('express')
const ejs = require('ejs')
const mongoose = require('mongoose')
const session = require('express-session')
const passport = require('passport')

const GoogleStrategy = require('passport-google-oauth20').Strategy

const User = require('./userModel.js')
const app = express()

app.use(express.static('public'))
app.set('view engine', 'ejs')

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
)

app.use(passport.initialize())
app.use(passport.session())

mongoose.connect('mongodb://localhost:27017/userDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
})

passport.use(User.createStrategy())

passport.serializeUser(function (user, done) {
  done(null, user.id)
})

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user)
  })
})

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/secrets',
      userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
    },
    function (accessToken, refreshToken, profile, cb) {
      // console.log(profile)

      User.findOrCreate({ googleId: profile.id }, function (err, user) {
        return cb(err, user)
      })
    }
  )
)

app.get('/', function (req, res) {
  res.render('home')
})

app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }))

app.get(
  '/auth/google/secrets',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function (req, res) {
    // Successful authentication, redirect to private.
    res.redirect('/private-info')
  }
)

app.get('/public-info', function (req, res) {
  User.find({ secret: { $ne: null } }, function (err, foundUsers) {
    if (err) {
      console.log(err)
    } else {
      if (foundUsers) {
        res.render('public-info', { usersWithSecrets: foundUsers })
      }
    }
  })
})

app.get('/private-info', function (req, res) {
  if (req.isAuthenticated()) {
    res.render('private-info', {
      fname: 'Charlie',
      email: 'charlie@kriewall.com',
    })
  } else {
    res.redirect('/')
  }
})

app.get('/logout', function (req, res) {
  req.logout()
  res.redirect('/')
})

app.listen(3000, function () {
  console.log('Server started on port 3000.')
})
