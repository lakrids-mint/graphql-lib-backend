const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    minlength: 2
  },
  published: {
    type: Number,
  },
  author: {
    //type: mongoose.Schema.Types.ObjectId,
   // ref: 'Author'
   //just using string for now
   type:String
  },
  genres: [
    { type: String}
  ]
})

module.exports = mongoose.model('Book', schema)