// Response utility functions

const sendResponse = (res, statusCode, status, message, data = null) => {
  const response = {
    status,
    message
  };

  if (data) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

const sendSuccess = (res, message, data = null, statusCode = 200) => {
  return sendResponse(res, statusCode, 'success', message, data);
};

const sendError = (res, message, statusCode = 500, data = null) => {
  return sendResponse(res, statusCode, 'error', message, data);
};

const sendCreated = (res, message, data = null) => {
  return sendResponse(res, 201, 'success', message, data);
};

const sendNotFound = (res, message = 'Resource not found') => {
  return sendResponse(res, 404, 'error', message);
};

const sendUnauthorized = (res, message = 'Access denied') => {
  return sendResponse(res, 401, 'error', message);
};

const sendForbidden = (res, message = 'Insufficient permissions') => {
  return sendResponse(res, 403, 'error', message);
};

const sendBadRequest = (res, message = 'Bad request', errors = null) => {
  const data = errors ? { errors } : null;
  return sendResponse(res, 400, 'error', message, data);
};

module.exports = {
  sendResponse,
  sendSuccess,
  sendError,
  sendCreated,
  sendNotFound,
  sendUnauthorized,
  sendForbidden,
  sendBadRequest
};
