const success = (res, data = {}, message = '', statusCode = 200) => {
  return res.status(statusCode).json({ success: true, data, message });
};

const error = (res, errorMessage = 'An error occurred', statusCode = 500, details = []) => {
  return res.status(statusCode).json({ success: false, error: errorMessage, details });
};

module.exports = { success, error };
