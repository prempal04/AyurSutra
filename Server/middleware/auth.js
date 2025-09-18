const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - authenticate user
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'Token is valid but user no longer exists'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          status: 'error',
          message: 'User account has been deactivated'
        });
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        status: 'error',
        message: 'Token is not valid'
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Server error in authentication middleware'
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `Access denied. Role '${req.user.role}' is not authorized to access this resource.`
      });
    }
    next();
  };
};

// Check if user is admin or accessing own data
const authorizeOwnerOrAdmin = (req, res, next) => {
  const userId = req.params.id || req.params.userId;
  
  if (req.user.role === 'admin' || req.user.id === userId) {
    return next();
  }
  
  return res.status(403).json({
    status: 'error',
    message: 'Access denied. You can only access your own data.'
  });
};

// Check if user is doctor or admin
const authorizeDoctorOrAdmin = (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'doctor') {
    return next();
  }
  
  return res.status(403).json({
    status: 'error',
    message: 'Access denied. Only doctors and admins can access this resource.'
  });
};

module.exports = {
  protect,
  authorize,
  authorizeOwnerOrAdmin,
  authorizeDoctorOrAdmin
};
