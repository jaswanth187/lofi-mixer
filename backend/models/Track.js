const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  artist: { type: String, required: true },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: { type: String, required: true },
  fileId: { type: mongoose.Schema.Types.ObjectId, required: true },
  coverArt: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Track', trackSchema);
