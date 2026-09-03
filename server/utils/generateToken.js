const jwt = require('jsonwebtoken');

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (typeof secret !== 'string' || !secret.trim()) {
    const error = new Error('JWT_SECRET must be configured');
    error.statusCode = 500;
    throw error;
  }

  return secret;
}

function generateToken(user) {
  return jwt.sign(
    { id: user._id },
    getJwtSecret(),
    { algorithm: 'HS256', expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

module.exports = generateToken;
module.exports.getJwtSecret = getJwtSecret;
