const express = require('express');
const multer = require('multer');
const { ensureAuthenticated } = require('../middleware/auth');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', ensureAuthenticated, upload.single('song'), (req, res) => {
  // Save file metadata to MongoDB
  // Example: { filename: req.file.filename, userId: req.user.id, ... }
  res.send('File uploaded successfully');
});

module.exports = router;