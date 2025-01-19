const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  console.log('Session:', req.session);
  console.log('Cookies:', req.cookies);
  res.status(401).json({ message: 'Please login to continue' });
};

module.exports = { ensureAuthenticated };