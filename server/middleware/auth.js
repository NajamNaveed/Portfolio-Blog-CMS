const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const error = new Error('Not authorized, no token provided');
    error.statusCode = 401;
    throw error;
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    const error = new Error('Not authorized, invalid or expired token');
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    const error = new Error('Not authorized, user no longer exists');
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