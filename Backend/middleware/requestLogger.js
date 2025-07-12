const logger = require('../utils/logger');

class RequestLogger {
  static logRequests(req, res, next) {
    const startTime = Date.now();

    // Log request start
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`, {
      method: req.method,
      url: req.originalUrl,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      timestamp: new Date().toISOString()
    });

    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
      const duration = Date.now() - startTime;
      
      // Log response
      logger.logRequest(req, res, duration);
      
      // Call original end
      originalEnd.call(this, chunk, encoding);
    };

    next();
  }

  static logErrors(err, req, res, next) {
    logger.error(`Error in ${req.method} ${req.originalUrl}:`, {
      error: err.message,
      stack: err.stack,
      method: req.method,
      url: req.originalUrl,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      timestamp: new Date().toISOString()
    });

    // Send error response
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
  }
}

module.exports = RequestLogger; 