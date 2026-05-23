const { ZodError } = require('zod');
const { logger } = require('./requestLogger');

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    });
  }

  logger.error(err.message, {
    url: req.originalUrl,
    method: req.method,
    stack: err.stack,
  });

  const statusCode = err.statusCode || err.status || 500;
  const isDev = process.env.NODE_ENV !== 'production';
  const message = statusCode === 500 && !isDev ? 'Internal server error' : err.message;

  return res.status(statusCode).json({
    success: false,
    error: message,
    details: err.details || [],
  });
};

module.exports = errorHandler;
