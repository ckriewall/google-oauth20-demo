import mongoose from 'mongoose'
const userSchema = new mongoose.Schema(
  {
    email: String,
    googleId: String,
    googleProfile: Object,
  },
  { timestamps: true }
)

const User = new mongoose.model('User', userSchema)

export default User
