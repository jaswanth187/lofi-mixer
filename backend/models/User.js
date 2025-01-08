const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: String,
  username: String,
  password: String, // hashed password for manual login
  email: String,
  // other fields as needed
});

module.exports = mongoose.model('User', userSchema);