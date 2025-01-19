// routes/upload.js
const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');
const upload = require('../config/storage');
const Track = require('../models/Track');
const mongoose = require('mongoose');

let gfs;
let gridfsBucket;

mongoose.connection.once('open', () => {
  gridfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'tracks'
  });
});

// Update the track streaming endpoint
router.get('/track/:filename', async (req, res) => {
  try {
    // Find the file metadata
    const files = await gridfsBucket.find({ filename: req.params.filename }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    const file = files[0];

    // Set proper headers for audio streaming
    res.set({
      'Content-Type': file.contentType,
      'Content-Length': file.length,
      'Accept-Ranges': 'bytes'
    });

    // Handle range requests
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : file.length - 1;
      const chunksize = (end - start) + 1;

      res.status(206).set({
        'Content-Range': `bytes ${start}-${end}/${file.length}`,
        'Content-Length': chunksize
      });

      const downloadStream = gridfsBucket.openDownloadStreamByName(file.filename, {
        start,
        end: end + 1
      });
      downloadStream.pipe(res);
    } else {
      // Stream the entire file
      const downloadStream = gridfsBucket.openDownloadStreamByName(file.filename);
      downloadStream.pipe(res);
    }

  } catch (error) {
    console.error('Streaming error:', error);
    res.status(500).json({ message: 'Error streaming file' });
  }
});

// Update the tracks fetch endpoint
router.get('/tracks', ensureAuthenticated, async (req, res) => {
  try {
    const tracks = await Track.find({ uploadedBy: req.user._id })
      .sort({ createdAt: -1 });

    const tracksWithFileInfo = await Promise.all(tracks.map(async (track) => {
      try {
        const files = await gridfsBucket.find({ filename: track.filename }).toArray();
        if (files.length === 0) return null;

        return {
          _id: track._id,
          name: track.name,
          artist: track.artist,
          filename: track.filename,
          coverArt: track.coverArt,
          createdAt: track.createdAt,
          volume: 50,
          isPlaying: false,
          audioUrl: `${process.env.BACKEND_URL || 'http://localhost:3000'}/upload/track/${track.filename}`
        };
      } catch (error) {
        console.error(`Error checking file for track ${track._id}:`, error);
        return null;
      }
    }));

    const validTracks = tracksWithFileInfo.filter(track => track !== null);
    res.json(validTracks);

  } catch (error) {
    console.error('Error fetching tracks:', error);
    res.status(500).json({ message: 'Error fetching tracks' });
  }
});

// Update the track upload endpoint
router.post('/track', ensureAuthenticated, (req, res) => {
  upload.single('audio')(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ message: 'Error uploading file' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
      const newTrack = new Track({
        name: req.body.name || 'Untitled',
        artist: req.body.artist || 'Unknown Artist',
        uploadedBy: req.user._id,
        filename: req.file.filename,
        fileId: req.file.id,
        coverArt: req.body.coverArt || '/default-cover.jpg'
      });

      const savedTrack = await newTrack.save();
      
      res.status(201).json({
        message: 'Track uploaded successfully',
        track: {
          ...savedTrack.toObject(),
          audioUrl: `${process.env.BACKEND_URL || 'http://localhost:3000'}/upload/track/${savedTrack.filename}`
        }
      });
    } catch (error) {
      console.error('Save error:', error);
      if (req.file && req.file.id) {
        try {
          await gridfsBucket.delete(new mongoose.Types.ObjectId(req.file.id));
        } catch (deleteError) {
          console.error('Cleanup error:', deleteError);
        }
      }
      res.status(500).json({ message: 'Error saving track information' });
    }
  });
});

module.exports = router;