// BigInt can't be serialized by JSON.stringify by default; convert to Number.
// File sizes are well within Number's safe integer range.
BigInt.prototype.toJSON = function () { return Number(this); };

const app = require('./app');
const env = require('./config/env');
const { logger } = require('./middleware/requestLogger');
const prisma = require('./lib/prisma');

const server = app.listen(env.PORT, () => {
  logger.info(`Tetri Copilot API running on port ${env.PORT} [${env.NODE_ENV}]`);
});

const shutdown = async (signal) => {
  logger.info(`${signal} received — shutting down gracefully`);
  server.close(async () => {
    await prisma.$disconnect();
    logger.info('HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
