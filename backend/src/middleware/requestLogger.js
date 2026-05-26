const winston = require('winston');
const { randomUUID } = require('crypto');
const env = require('../config/env');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format:
        env.NODE_ENV === 'development'
          ? winston.format.combine(
              winston.format.colorize(),
              winston.format.printf(({ timestamp, level, message, requestId, workspaceId, durationMs, statusCode }) => {
                const extra = [
                  requestId ? `rid=${requestId.slice(0, 8)}` : null,
                  workspaceId ? `ws=${workspaceId.slice(0, 8)}` : null,
                  durationMs != null ? `${durationMs}ms` : null,
                  statusCode ? `[${statusCode}]` : null,
                ].filter(Boolean).join(' ');
                return `${timestamp} [${level}] ${message}${extra ? ' — ' + extra : ''}`;
              })
            )
          : winston.format.json(),
    }),
  ],
});

// Attach a unique request ID to every incoming request
const requestId = (req, res, next) => {
  req.id = req.headers['x-request-id'] || randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
};

const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    const workspaceId = req.headers['x-workspace-id'] || req.workspaceMember?.workspaceId || null;
    const userId = req.auth?.userId || null;

    const entry = {
      message: `${req.method} ${req.originalUrl}`,
      requestId: req.id,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
      workspaceId,
      userId,
      ip: req.ip || req.connection?.remoteAddress,
    };

    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    logger[level](entry.message, entry);
  });

  next();
};

module.exports = { requestLogger, requestId, logger };
