function notFound(req, res, next) {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

function getErrorResponse(err) {
  if (err && err.type === 'entity.parse.failed') {
    return { statusCode: 400, message: 'Malformed JSON request', exposeStack: false };
  }

  if (err && err.code === 11000) {
    return { statusCode: 409, message: 'A post with that slug already exists', exposeStack: false };
  }

  if (err && err.name === 'ValidationError') {
    return { statusCode: 400, message: 'Validation failed', exposeStack: false };
  }

  if (err && err.name === 'CastError') {
    return { statusCode: 400, message: 'Invalid request data', exposeStack: false };
  }

  const statusCode = err && err.statusCode && err.statusCode !== 200 ? err.statusCode : 500;
  const isProduction = process.env.NODE_ENV === 'production';
  const message = isProduction && statusCode >= 500 ? 'Server error' : err?.message || 'Server error';

  return { statusCode, message, exposeStack: statusCode >= 500 && !isProduction };
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  const { statusCode, message, exposeStack } = getErrorResponse(err);
  const isProduction = process.env.NODE_ENV === 'production';

  if (statusCode >= 500) {
    console.error('Unhandled request error:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(exposeStack && err?.stack ? { stack: err.stack } : {}),
  });
}

module.exports = { notFound, errorHandler };