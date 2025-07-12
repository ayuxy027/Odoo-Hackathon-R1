const fs = require('fs');
const path = require('path');

class AppConfig {
  constructor() {
    this.config = {};
    this.loadConfig();
  }

  loadConfig() {
    try {
      console.log('⚙️  Loading application configuration...');
      
      // Read from env.md file since we can't modify it
      const envPath = path.join(__dirname, '..', 'env.md');
      
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        this.parseEnvFile(envContent);
      }

      // Set defaults (using PORT=3000 as per env.md)
      this.config = {
        port: this.config.PORT || 3000,
        nodeEnv: this.config.NODE_ENV || 'development',
        clientUrl: this.config.CLIENT_URL || 'http://localhost:5173',
        jwtSecret: this.config.JWT_SECRET || 'fallback-secret-key',
        sessionSecret: this.config.SESSION_SECRET || 'fallback-session-secret',
        googleClientId: this.config.GOOGLE_CLIENT_ID || null,
        googleClientSecret: this.config.GOOGLE_CLIENT_SECRET || null,
        ...this.config
      };

      // Log warning about MongoDB URI since we're using SQLite per PRD
      if (this.config.MONGODB_URI) {
        console.log('⚠️  MongoDB URI found in env.md but using SQLite per PRD requirements');
      }

      console.log('✅ Configuration loaded successfully');
      console.log(`📍 Port: ${this.config.port}`);
      console.log(`🌍 Environment: ${this.config.nodeEnv}`);
      console.log(`🔗 Client URL: ${this.config.clientUrl}`);
      
    } catch (error) {
      console.error('❌ Configuration loading failed:', error);
      // Use fallback configuration
      this.config = {
        port: 3000,
        nodeEnv: 'development',
        clientUrl: 'http://localhost:5173',
        jwtSecret: 'fallback-secret-key',
        sessionSecret: 'fallback-session-secret'
      };
    }
  }

  parseEnvFile(content) {
    try {
      const lines = content.split('\n');
      lines.forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('#') && line.includes('=')) {
          const [key, ...valueParts] = line.split('=');
          const value = valueParts.join('=').trim();
          this.config[key.trim()] = value;
        }
      });
      console.log('✅ Environment variables parsed from env.md');
    } catch (error) {
      console.error('❌ Failed to parse env.md:', error);
    }
  }

  get(key) {
    return this.config[key];
  }

  isDevelopment() {
    return this.config.nodeEnv === 'development';
  }

  isProduction() {
    return this.config.nodeEnv === 'production';
  }
}

// Create singleton instance
const appConfig = new AppConfig();

module.exports = appConfig; 