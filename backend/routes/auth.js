const express = require("express");
const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const router = express.Router();
const { AppError } = require("../middleware/errorHandler");
const crypto = require("node:crypto");
const {
  sendVerificationEmail,
  emailLimiter,
} = require("../services/emailService");

const ensureAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};
router.get("/google", (req, res, next) => {
  console.log("Starting Google OAuth"); // Debug log
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })(req, res, next);
});

router.get("/google/callback", (req, res, next) => {
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
    successRedirect: `${process.env.FRONTEND_URL}/auth/google/success`,
    failureMessage: true,
  })(req, res, next);
});

// Auth check endpoint
router.get("/me", ensureAuthenticated, (req, res) => {
  res.json({
    status: "success",
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
    },
  });
});

// Manual Login Routes
// router.post("/login", async (req, res, next) => {
//   try {
//     const { username, password } = req.body;

//     // Input validation
//     if (!username || !password) {
//       return res.status(400).json({
//         status: "error",
//         message: "Username and password are required",
//       });
//     }

//     // Find user first
//     const user = await User.findOne({ username });
//     if (!user) {
//       return res.status(400).json({
//         status: "error",
//         message: "Invalid username or password",
//       });
//     }

//     // Check email verification
//     if (!user.emailVerified) {
//       throw new AppError("Please verify your email before logging in", 401);
//     }

//     // Check password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({
//         status: "error",
//         message: "Invalid username or password",
//       });
//     }

//     // Login user
//     await new Promise((resolve, reject) => {
//       req.login(user, (err) => {
//         if (err) reject(err);
//         else resolve();
//       });
//     });

//     // Send success response
//     return res.status(200).json({
//       status: "success",
//       message: "Login successful",
//       user: {
//         id: user._id,
//         username: user.username,
//         email: user.email,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// });
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: info.message || "Invalid credentials",
      });
    }

    if (!user.emailVerified) {
      return res.status(401).json({
        status: "error",
        message: "Please verify your email first",
      });
    }

    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }

      return res.status(200).json({
        status: "success",
        message: "Login successful",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      });
    });
  })(req, res, next);
});
// Logout Route
router.get("/logout", async (req, res) => {
  try {
    // Clear session
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Error logging out" });
      }

      // Clear session
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destruction error:", err);
        }
      });

      // Clear all cookies including OAuth cookies
      const cookies = req.cookies;
      for (let cookie in cookies) {
        res.clearCookie(cookie, {
          path: "/",
          domain:
            process.env.NODE_ENV === "production"
              ? ".yourdomain.com"
              : undefined,
        });
      }

      res.status(200).json({ message: "Logout successful" });
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Error logging out" });
  }
});

// POST route for registration
router.post("/register", async (req, res, next) => {
  try {
    const { username, password, email } = req.body;

    // Enhanced validation
    if (!username || !password || !email) {
      throw new AppError("Please provide username, password and email", 400);
    }

    // Username validation
    if (username.length < 3) {
      throw new AppError("Username must be at least 3 characters long", 400);
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError("Please provide a valid email address", 400);
    }

    // Password validation
    if (password.length < 6) {
      throw new AppError("Password must be at least 6 characters long", 400);
    }

    if (!/(?=.*[0-9])/.test(password)) {
      throw new AppError("Password must contain at least one number", 400);
    }

    // Check for existing user
    const existingUser = await User.findOne({
      $or: [
        { username: { $regex: new RegExp(`^${username}$`, "i") } }, // Case-insensitive username check
        { email: { $regex: new RegExp(`^${email}$`, "i") } }, // Case-insensitive email check
      ],
    });

    if (existingUser) {
      throw new AppError(
        existingUser.username.toLowerCase() === username.toLowerCase()
          ? "Username already exists"
          : "Email already exists",
        400
      );
    }

    // Hash password
    const verificationToken = crypto.randomBytes(48).toString("hex");
    const hashedPassword = await bcrypt.hash(password, 12); // Increased from 10 to 12 rounds

    // Create new user
    const newUser = new User({
      username: username.trim(),
      password: hashedPassword,
      email: email.toLowerCase().trim(),
      created: Date.now(),
      verificationToken,
      verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      emailVerified: false,
    });

    await newUser.save();
    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      // Delete the user if email fails
      await User.deleteOne({ _id: newUser._id });
      throw new AppError(
        `Error sending verification email: ${emailError.message}`,
        500
      );
    }
    // Remove password from response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      status: "success",
      message:
        "Registration successful. Please check your email for verification link.",
      requiresVerification: true,
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/verify-email/:token", async (req, res, next) => {
  try {
    const user = await User.findOne({
      verificationToken: req.params.token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new AppError("Invalid or expired verification token", 400);
    }

    // Update user
    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.json({
      status: "success",
      message: "Email verified successfully",
    });
  } catch (error) {
    next(error);
  }
});

// Add resend verification endpoint
router.post("/resend-verification", async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.emailVerified) {
      throw new AppError("Email already verified", 400);
    }

    const verificationToken = crypto.randomBytes(48).toString("hex");
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    await sendVerificationEmail(email, verificationToken);

    res.json({
      status: "success",
      message: "Verification email resent successfully",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
