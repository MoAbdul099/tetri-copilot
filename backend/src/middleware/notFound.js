const notFound = (req, res) => {
  return res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
    details: [],
  });
};

module.exports = notFound;
