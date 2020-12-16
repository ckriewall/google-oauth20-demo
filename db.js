const mongoose = require('mongoose')

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
}

const connectDB = () => {
  mongoose.connect(process.env.MONGO_URI, options, (err) => {
    if (!err) {
      console.log('Mongo connected')
    } else {
      console.log(err)
    }
  })
}

module.exports = connectDB
