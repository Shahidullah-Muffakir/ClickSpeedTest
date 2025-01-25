const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: String,         
  score: Number,        
  date: {               
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Player', playerSchema);
