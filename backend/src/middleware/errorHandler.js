const { logger } = require('./requestLogger');

const errorHandler = (err, req, res, next) => {
  logger.error(err.message, {
    url: req.originalUrl,
    method: req.method,
    stack: err.stack,
  });

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  return res.status(statusCode).json({
    success: false,
    error: message,
    details: err.details || [],
  });
};

module.exports = errorHandler;
