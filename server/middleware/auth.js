const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT token verification middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};

// Role-based access control middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: roles,
        current: req.user.role
      });
    }

    next();
  };
};

// API token authentication middleware
const authenticateApiToken = async (req, res, next) => {
  try {
    const token = req.headers['x-api-token'] || req.headers['authorization']?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'API token required' });
    }

    const user = await User.findOne({
      'apiTokens.token': token,
      'apiTokens.isActive': true
    }).select('-password');

    if (!user) {
      return res.status(401).json({ error: 'Invalid API token' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Update last used timestamp
    await User.updateOne(
      { 'apiTokens.token': token },
      { $set: { 'apiTokens.$.lastUsed': new Date() } }
    );

    req.user = user;
    req.apiToken = token;
    next();
  } catch (error) {
    console.error('API token auth error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};

// Rate limiting for specific endpoints
const createRateLimiter = (windowMs, max, message) => {
  const rateLimit = require('express-rate-limit');
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Login rate limiter
const loginRateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts
  'Too many login attempts, please try again later'
);

// API rate limiter
const apiRateLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  100, // 100 requests
  'Too many API requests, please slow down'
);

// Threat logging rate limiter
const threatLogRateLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  50, // 50 threat logs
  'Too many threat logs, please slow down'
);

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// Verify JWT token without middleware
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Check if user has permission for specific action
const hasPermission = (user, action) => {
  const permissions = {
    admin: ['read', 'write', 'delete', 'manage_users', 'manage_threats', 'manage_system'],
    security_analyst: ['read', 'write', 'manage_threats'],
    viewer: ['read']
  };

  return permissions[user.role]?.includes(action) || false;
};

// Permission-based middleware
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!hasPermission(req.user, permission)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: permission,
        current: req.user.role
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authenticateApiToken,
  requireRole,
  requirePermission,
  loginRateLimiter,
  apiRateLimiter,
  threatLogRateLimiter,
  generateToken,
  verifyToken,
  hasPermission
}; 