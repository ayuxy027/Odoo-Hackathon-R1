const db = require('../config/database');
const logger = require('../utils/logger');

class AuthMiddleware {
  // Simple session-based authentication (no JWT for simplicity)
  static authenticate(req, res, next) {
    try {
      const { username, password } = req.headers;
      
      if (!username || !password) {
        logger.warn('Authentication failed: Missing credentials');
        return res.status(401).json({
          success: false,
          message: 'Authentication required. Please provide username and password in headers.'
        });
      }

      // Check user credentials
      const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?')
        .get(username, password);

      if (!user) {
        logger.warn('Authentication failed: Invalid credentials', { username });
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        });
      }

      // Add user to request object
      req.user = {
        id: user.id,
        username: user.username,
        role: user.role
      };

      logger.logAuth('login', username, { role: user.role });
      next();
    } catch (error) {
      logger.error('Authentication middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authentication error'
      });
    }
  }

  // Optional authentication (for endpoints that work for both authenticated and non-authenticated users)
  static optionalAuth(req, res, next) {
    try {
      const { username, password } = req.headers;
      
      if (username && password) {
        // Try to authenticate
        const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?')
          .get(username, password);

        if (user) {
          req.user = {
            id: user.id,
            username: user.username,
            role: user.role
          };
          logger.logAuth('optional_login', username, { role: user.role });
        } else {
          // If credentials provided but wrong, reject with 401
          logger.warn('Optional auth failed: Invalid credentials', { username });
          return res.status(401).json({
            success: false,
            message: 'Invalid username or password'
          });
        }
      }
      // If no credentials provided, continue as anonymous user
      
      next();
    } catch (error) {
      logger.error('Optional authentication middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authentication error'
      });
    }
  }

  // Role-based authorization
  static requireRole(roles) {
    return (req, res, next) => {
      try {
        if (!req.user) {
          logger.warn('Authorization failed: No user in request');
          return res.status(401).json({
            success: false,
            message: 'Authentication required'
          });
        }

        const userRole = req.user.role;
        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        if (!allowedRoles.includes(userRole)) {
          logger.warn('Authorization failed: Insufficient role', { 
            userRole, 
            allowedRoles, 
            username: req.user.username 
          });
          return res.status(403).json({
            success: false,
            message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
          });
        }

        next();
      } catch (error) {
        logger.error('Role authorization middleware error:', error);
        return res.status(500).json({
          success: false,
          message: 'Authorization error'
        });
      }
    };
  }

  // Check if user owns the resource
  static checkOwnership(resourceType) {
    return (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            success: false,
            message: 'Authentication required'
          });
        }

        const resourceId = req.params.id;
        if (!resourceId) {
          return res.status(400).json({
            success: false,
            message: 'Resource ID is required'
          });
        }

        let query;
        switch (resourceType) {
          case 'question':
            query = 'SELECT user_id FROM questions WHERE id = ?';
            break;
          case 'answer':
            query = 'SELECT user_id FROM answers WHERE id = ?';
            break;
          default:
            return res.status(400).json({
              success: false,
              message: 'Invalid resource type'
            });
        }

        const resource = db.prepare(query).get(resourceId);
        if (!resource) {
          return res.status(404).json({
            success: false,
            message: `${resourceType} not found`
          });
        }

        // Admin can access everything, otherwise check ownership
        if (req.user.role === 'admin' || resource.user_id === req.user.id) {
          next();
        } else {
          logger.warn('Ownership check failed', { 
            userId: req.user.id, 
            resourceId, 
            resourceType 
          });
          return res.status(403).json({
            success: false,
            message: 'Access denied. You can only modify your own content.'
          });
        }
      } catch (error) {
        logger.error('Ownership check middleware error:', error);
        return res.status(500).json({
          success: false,
          message: 'Ownership check error'
        });
      }
    };
  }
}

module.exports = AuthMiddleware; 