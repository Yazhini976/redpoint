const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'redpoint_jwt_super_secret_college_key_2026';

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

function isAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
  }
  next();
}

function isParticipant(req, res, next) {
  if (!req.user || req.user.role !== 'PARTICIPANT') {
    return res.status(403).json({ success: false, message: 'Access denied. Participant role required.' });
  }
  next();
}

module.exports = {
  verifyToken,
  isAdmin,
  isParticipant
};
