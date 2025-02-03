const { GridFsStorage } = require("multer-gridfs-storage");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const mongoURI = process.env.DB_CONNECTION_STRING;

const storage = new GridFsStorage({
  url: mongoURI,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "tracks",
        };
        resolve(fileInfo);
      });
    });
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

module.exports = upload;
