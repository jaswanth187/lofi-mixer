class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
  
    if (process.env.NODE_ENV === 'development') {
      res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
      });
    } else {
      if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(el => el.message);
        return res.status(400).json({
          status: 'fail',
          message: `Invalid input: ${errors.join('. ')}`
        });
      }
      if (err.code === 11000) {
        return res.status(400).json({
          status: 'fail',
          message: 'Duplicate field value. Please use another value'
        });
      }
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }
  };
  
  module.exports = { AppError, errorHandler };