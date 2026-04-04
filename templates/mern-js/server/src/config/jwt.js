const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET ?? 'fallback-secret';

/** @param {object} payload @param {string} [expiresIn='7d'] @returns {string} */
function signToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, SECRET, { expiresIn });
}

/** @param {string} token @returns {object|string} */
function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

module.exports = { signToken, verifyToken };
