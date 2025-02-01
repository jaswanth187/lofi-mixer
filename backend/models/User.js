const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: String,
  username: {
    type: String,
    required: true
  },
  password: String,
  email: {
    type: String,
    required: true
  },
  firstName: String,
  lastName: String,
  profilePicture: String,
  provider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpires: Date
});

module.exports = mongoose.model('User', userSchema);