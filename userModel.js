const mongoose = require('mongoose')
const findOrCreate = require('mongoose-findorcreate')
const userSchema = new mongoose.Schema(
  {
    email: String,
    googleId: String,
    googleProfile: Object,
  },
  { timestamps: true }
)

userSchema.plugin(findOrCreate)

const User = new mongoose.model('User', userSchema)

module.exports = User
