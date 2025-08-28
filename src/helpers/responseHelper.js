const successResponse = (res, message, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const errorResponse = (res, message, error = null, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error ? error.toString() : undefined
  });
};

const warningResponse = (res, message, data = {}, statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    warning: true,
    message,
    data
  });
};

module.exports = {
  successResponse,
  errorResponse,
  warningResponse
};
