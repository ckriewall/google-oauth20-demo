const mongoose = require('mongoose')

const connectDB = () => {
  try {
    mongoose.connect('mongodb://localhost:27017/userDB', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })
    console.log('Connected to Mongo')
  } catch (error) {
    console.log(error.message)
  }
}

module.exports = connectDB
