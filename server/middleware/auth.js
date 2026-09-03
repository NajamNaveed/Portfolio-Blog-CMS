const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const { getJwtSecret } = require('../utils/generateToken');

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    const error = new Error('Not authorized, no token provided');
    error.statusCode = 401;
    throw error;
  }

  const bearerMatch = typeof authHeader === 'string' && authHeader.match(/^Bearer ([^\s]+)$/);
  if (!bearerMatch) {
    const error = new Error('Not authorized, invalid authorization header');
    error.statusCode = 401;
    throw error;
  }

  const token = bearerMatch[1];

  let decoded;
  try {
    decoded = jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] });
  } catch (err) {
    if (err.statusCode) throw err;
    const error = new Error('Not authorized, invalid or expired token');
    error.statusCode = 401;
    throw error;
  }

  if (!decoded || typeof decoded.id !== 'string') {
    const error = new Error('Not authorized, invalid or expired token');
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findById(decoded.id).select('name email role');

  if (!user) {
    const error = new Error('Not authorized, invalid or expired token');
    error.statusCode = 401;
    throw error;
  }

  req.user = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  next();
});

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    const error = new Error('Not authorized as admin');
    error.statusCode = 403;
    return next(error);
  }
  next();
};

module.exports = { protect, requireAdmin };
