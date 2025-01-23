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

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
    
    if (!user) {
      return res.status(401).json({ message: info.message || 'Invalid credentials' });
    }

    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error logging in' });
      }
      
      // Set session
      req.session.user = user;
      
      return res.status(200).json({
        message: 'Login successful',
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      });
    });
  })(req, res, next);
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


// POST route for registration
router.post('/register', async (req, res,next) => {

  try {
    const { username, password, email } = req.body;
      if (!username || !password || !email) {
      throw new AppError('Please provide username, password and email', 400);
    }

    if (password.length < 6) {
      throw new AppError('Password must be at least 6 characters long', 400);
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      throw new AppError('Username or email already exists', 400);
    }

    // Check if user already exists
    // const existingUser = await User.findOne({ 
    //   $or: [{ username }, { email }] 
    // });
    
    // if (existingUser) {
    //   return res.status(400).json({ 
    //     message: 'Username or email already exists' 
    //   });
    // }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = new User({
      username,
      password: hashedPassword,
      email
    });

    await newUser.save();
    res.status(201).json({ 
      message: 'User registered successfully' 
    });
  } catch (error) {
   next(error);
  }
});

module.exports = router;