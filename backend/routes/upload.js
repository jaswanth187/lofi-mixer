// routes/upload.js
const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../middleware/auth");
const upload = require("../config/storage");
const Track = require("../models/Track");
const mongoose = require("mongoose");

let gfs;
let gridfsBucket;

mongoose.connection.once("open", () => {
  gridfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "tracks",
  });
});

// Update the track streaming endpoint
router.get("/track/:filename", async (req, res) => {
  try {
    // Find the file metadata
    const files = await gridfsBucket
      .find({ filename: req.params.filename })
      .toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ message: "File not found" });
    }

    const file = files[0];

    // Set proper headers for audio streaming
    res.set({
      "Content-Type": file.contentType,
      "Content-Length": file.length,
      "Accept-Ranges": "bytes",
    });

    // Handle range requests
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : file.length - 1;
      const chunksize = end - start + 1;

      res.status(206).set({
        "Content-Range": `bytes ${start}-${end}/${file.length}`,
        "Content-Length": chunksize,
      });

      const downloadStream = gridfsBucket.openDownloadStreamByName(
        file.filename,
        {
          start,
          end: end + 1,
        }
      );
      downloadStream.pipe(res);
    } else {
      // Stream the entire file
      const downloadStream = gridfsBucket.openDownloadStreamByName(
        file.filename
      );
      downloadStream.pipe(res);
    }
  } catch (error) {
    console.error("Streaming error:", error);
    res.status(500).json({ message: "Error streaming file" });
  }
});

// Update the tracks fetch endpoint
router.get("/tracks", ensureAuthenticated, async (req, res) => {
  try {
    const tracks = await Track.find({ uploadedBy: req.user._id }).sort({
      createdAt: -1,
    });

    const tracksWithFileInfo = await Promise.all(
      tracks.map(async (track) => {
        try {
          const files = await gridfsBucket
            .find({ filename: track.filename })
            .toArray();
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
            audioUrl: `${
              process.env.BACKEND_URL || "http://localhost:5000"
            }/upload/track/${track.filename}`,
          };
        } catch (error) {
          console.error(`Error checking file for track ${track._id}:`, error);
          return null;
        }
      })
    );

    const validTracks = tracksWithFileInfo.filter((track) => track !== null);
    res.json(validTracks);
  } catch (error) {
    console.error("Error fetching tracks:", error);
    res.status(500).json({ message: "Error fetching tracks" });
  }
});

// Update the track upload endpoint
const UPLOAD_LIMIT = 4;
router.post("/track", ensureAuthenticated, async (req, res, next) => {
  let uploadedFile = null;

  try {
    // Check user's existing track count
    const trackCount = await Track.countDocuments({ uploadedBy: req.user._id });
    if (trackCount >= UPLOAD_LIMIT) {
      return res.status(400).json({
        status: "error",
        message: `Upload limit reached. Maximum ${UPLOAD_LIMIT} tracks allowed.`,
      });
    }

    // Wrap multer upload in a promise
    const handleUpload = () => {
      return new Promise((resolve, reject) => {
        upload.single("audio")(req, res, (err) => {
          if (err) {
            if (err.code === "LIMIT_FILE_SIZE") {
              reject(new Error("File size exceeds 10MB limit"));
            } else {
              reject(new Error(err.message || "Error uploading file"));
            }
          }
          resolve(req.file);
        });
      });
    };

    // Handle file upload
    uploadedFile = await handleUpload();

    // Validate file was uploaded
    if (!uploadedFile) {
      throw new Error("No audio file uploaded");
    }

    // Validate file type
    const allowedTypes = ["audio/mpeg", "audio/wav", "audio/mp3"];
    if (!allowedTypes.includes(uploadedFile.mimetype)) {
      throw new Error("Invalid file type. Only MP3 and WAV files are allowed");
    }

    // Validate metadata
    if (!req.body.name?.trim() || !req.body.artist?.trim()) {
      throw new Error("Track name and artist are required");
    }

    // Create and save new track
    const newTrack = new Track({
      name: req.body.name.trim(),
      artist: req.body.artist.trim(),
      uploadedBy: req.user._id,
      filename: uploadedFile.filename,
      fileId: uploadedFile.id,
      coverArt: req.body.coverArt || "/default-cover.jpg",
    });

    const savedTrack = await newTrack.save();

    return res.status(201).json({
      status: "success",
      message: "Track uploaded successfully",
      track: savedTrack,
    });
  } catch (error) {
    // Clean up uploaded file if exists
    if (uploadedFile?.id) {
      try {
        await gridfsBucket.delete(uploadedFile.id);
      } catch (deleteError) {
        console.error("File cleanup error:", deleteError);
      }
    }

    // Log the error
    console.error("Upload error:", error);

    // Send error response
    return res.status(error.statusCode || 400).json({
      status: "error",
      message: error.message || "Upload failed",
    });
  }
});

// Add delete endpoint
router.delete("/track/:id", ensureAuthenticated, async (req, res) => {
  try {
    const track = await Track.findOne({
      _id: req.params.id,
      uploadedBy: req.user._id,
    });

    if (!track) {
      return res.status(404).json({
        status: "error",
        message: "Track not found",
      });
    }

    // Delete file from GridFS
    await gridfsBucket.delete(track.fileId);

    // Delete track document
    await Track.deleteOne({ _id: req.params.id });

    res.json({
      status: "success",
      message: "Track deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      status: "error",
      message: "Error deleting track",
    });
  }
});

module.exports = router;
