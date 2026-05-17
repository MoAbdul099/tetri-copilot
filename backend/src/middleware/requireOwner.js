const requireOwner = (req, res, next) => {
  if (req.role !== 'owner') {
    return res.status(403).json({ success: false, error: 'Owner permission required', details: [] });
  }
  next();
};

module.exports = requireOwner;
