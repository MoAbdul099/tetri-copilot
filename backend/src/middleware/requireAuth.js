const { createClerkClient, verifyToken } = require('@clerk/backend');
const env = require('../config/env');

const clerkClient = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized', details: [] });
  }

  const token = authHeader.slice(7);

  try {
    // verifyToken is a standalone export in @clerk/backend v3.x — not a method on clerkClient
    const payload = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY,
      publishableKey: env.CLERK_PUBLISHABLE_KEY,
    });
    req.auth = { userId: payload.sub };
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Unauthorized', details: [] });
  }
};

const getAuth = (req) => req.auth || {};

module.exports = { protect, getAuth, clerkClient };
