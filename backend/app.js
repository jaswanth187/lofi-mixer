require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const authRoutes = require("./routes/auth");
const uploadRoutes = require("./routes/upload");
require("./config/passport");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const multer = require("multer");
const app = express();

// Middleware order is crucial
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS setup
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET is required in environment variables");
}

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.DB_CONNECTION_STRING,
      ttl: 24 * 60 * 60,
      autoRemove: "native",
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Debug middleware
// app.use((req, res, next) => {
//   console.log('Session:', req.session);
//   console.log('User:', req.user);
//   console.log('Is Authenticated:', req.isAuthenticated());
//   next();
// });
// Routes
app.use("/auth", authRoutes);
app.use("/upload", uploadRoutes);

// Update MongoDB connection URI to use IPv4 explicitly
const mongoURI = process.env.DB_CONNECTION_STRING;

// Improved MongoDB connection with error handling
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB Atlas connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB Atlas connection error:", err);
    process.exit(1);
  });

// Handle MongoDB connection events
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

app.get("/", (req, res) => {
  res.send("Home Page");
});

app.get("/dashboard", (req, res) => {
  res.send("Dashboard - User is logged in");
});

// After your routes, before app.listen()
app.use((err, req, res, next) => {
  console.error("Error:", err);

  // Handle Multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "File is too large. Maximum size is 10MB",
      });
    }
    return res.status(400).json({
      message: `Upload error: ${err.message}`,
    });
  }

  // Handle GridFS errors
  if (err.message && err.message.includes("GridFS")) {
    return res.status(500).json({
      message: "File storage error",
    });
  }

  // Handle other errors
  res.status(500).json({
    message: "An unexpected error occurred",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
