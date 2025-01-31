const ensureAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ 
      status: 'error',
      message: 'Session expired. Please login again.'
    });
  }

  // Check session expiration
  if (req.session && req.session.cookie && req.session.cookie.expires) {
    if (new Date() > new Date(req.session.cookie.expires)) {
      req.logout((err) => {
        if (err) console.error('Logout error:', err);
      });
      return res.status(401).json({
        status: 'error',
        message: 'Session expired. Please login again.'
      });
    }
  }

  next();
};

module.exports = { ensureAuthenticated };