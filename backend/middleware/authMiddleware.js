
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Not authorized, no token provided.',
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      message: 'Not authorized, no token provided.',
    });
  }

  try {
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured.');
      return res.status(500).json({
        message: 'Authentication is not configured on the server.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        message: 'Not authorized. User account not found.',
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({
      message: 'Not authorized. Token is invalid or expired.',
    });
  }
};

module.exports = { protect };
