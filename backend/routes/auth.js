const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const router = express.Router();
const { AppError } = require('../middleware/errorHandler');
// Google OAuth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
// In auth.routes.js
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Using absolute URL for frontend
    res.redirect('http://localhost:3001/auth/google/success');
  }
);
router.get('/me', (req, res) => {
  if (req.user) {
    res.json({
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        profilePicture: req.user.profilePicture
      }
    });
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});


// Manual Login Routes\

router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return next(new AppError('Invalid credentials', 401));
    }

    // Generate and send JWT token or session
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
});

// Logout Route
router.get('/logout', async (req, res) => {
  try {
    // Clear session
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: 'Error logging out' });
      }
      
      // Clear session
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destruction error:', err);
        }
      });

      // Clear all cookies including OAuth cookies
      const cookies = req.cookies;
      for (let cookie in cookies) {
        res.clearCookie(cookie, {
          path: '/',
          domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : undefined
        });
      }
      
      res.status(200).json({ message: 'Logout successful' });
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Error logging out' });
  }
});


router.post('/register', async (req, res, next) => {
  const { username, password, email } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return next(new AppError('Email already in use', 400));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      password: hashedPassword,
      email
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;