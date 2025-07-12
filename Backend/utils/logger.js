const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '..', 'logs');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  formatMessage(level, message, metadata = {}) {
    const timestamp = new Date().toISOString();
    const metaString = Object.keys(metadata).length > 0 ? JSON.stringify(metadata) : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message} ${metaString}`;
  }

  writeToFile(level, message, metadata = {}) {
    try {
      const logFile = path.join(this.logDir, `${level}.log`);
      const formattedMessage = this.formatMessage(level, message, metadata);
      fs.appendFileSync(logFile, formattedMessage + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  info(message, metadata = {}) {
    const formattedMessage = this.formatMessage('info', message, metadata);
    console.log(`ℹ️  ${formattedMessage}`);
    this.writeToFile('info', message, metadata);
  }

  error(message, metadata = {}) {
    const formattedMessage = this.formatMessage('error', message, metadata);
    console.error(`❌ ${formattedMessage}`);
    this.writeToFile('error', message, metadata);
  }

  warn(message, metadata = {}) {
    const formattedMessage = this.formatMessage('warn', message, metadata);
    console.warn(`⚠️  ${formattedMessage}`);
    this.writeToFile('warn', message, metadata);
  }

  debug(message, metadata = {}) {
    const formattedMessage = this.formatMessage('debug', message, metadata);
    console.debug(`🐛 ${formattedMessage}`);
    this.writeToFile('debug', message, metadata);
  }

  success(message, metadata = {}) {
    const formattedMessage = this.formatMessage('success', message, metadata);
    console.log(`✅ ${formattedMessage}`);
    this.writeToFile('info', message, metadata);
  }

  // Log API requests
  logRequest(req, res, duration) {
    const logData = {
      method: req.method,
      url: req.originalUrl,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    };

    if (res.statusCode >= 400) {
      this.error(`HTTP ${req.method} ${req.originalUrl}`, logData);
    } else {
      this.info(`HTTP ${req.method} ${req.originalUrl}`, logData);
    }
  }

  // Log database operations
  logDBOperation(operation, table, data = {}) {
    this.info(`DB Operation: ${operation} on ${table}`, data);
  }

  // Log authentication events
  logAuth(event, username, details = {}) {
    this.info(`Auth Event: ${event} for user ${username}`, details);
  }
}

// Create singleton instance
const logger = new Logger();

module.exports = logger; 