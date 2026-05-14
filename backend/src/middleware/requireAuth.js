const { createClerkClient } = require('@clerk/backend');
const env = require('../config/env');

const clerkClient = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized', details: [] });
  }

  const token = authHeader.slice(7);

  try {
    const payload = await clerkClient.verifyToken(token);
    req.auth = { userId: payload.sub };
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Unauthorized', details: [] });
  }
};

const getAuth = (req) => req.auth || {};

module.exports = { protect, getAuth, clerkClient };
