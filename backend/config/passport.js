const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/User');
require('dotenv').config();

// Serialization
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
  passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    let existingUser = await User.findOne({ googleId: profile.id });
    
    if (existingUser) {
      // Update user info
      existingUser.lastLogin = new Date();
      await existingUser.save();
      return done(null, existingUser);
    }
    
    // Create new user
    const newUser = new User({
      googleId: profile.id,
      username: profile.displayName,
      email: profile.emails[0].value,
      firstName: profile.name?.givenName,
      lastName: profile.name?.familyName,
      profilePicture: profile.photos?.[0]?.value,
      provider: 'google',
      lastLogin: new Date()
    });
    
    await newUser.save();
    return done(null, newUser);
  } catch (error) {
    return done(error, null);
  }
}));

// Local Strategy
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return done(null, false, { message: 'Incorrect username.' });
    }
    
    // Only check password if it's a local user
    if (user.provider === 'google') {
      return done(null, false, { message: 'Please use Google to login.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return done(null, false, { message: 'Incorrect password.' });
    }
    
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

module.exports = passport;