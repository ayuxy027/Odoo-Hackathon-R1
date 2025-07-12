const Database = require('better-sqlite3');
const path = require('path');

class DatabaseManager {
  constructor() {
    this.db = null;
    this.init();
  }

  init() {
    try {
      console.log('📦 Initializing SQLite database...');
      
      const dbPath = path.join(__dirname, '..', 'stackit.db');
      this.db = new Database(dbPath);
      
      // Enable foreign keys
      this.db.pragma('foreign_keys = ON');
      
      console.log('✅ Database connected successfully');
      this.createTables();
      this.seedData();
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      process.exit(1);
    }
  }

  createTables() {
    try {
      console.log('🔨 Creating database tables...');

      // Users table
      this.db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT DEFAULT 'user' CHECK (role IN ('guest', 'user', 'admin')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `).run();

      // Ensure role column exists for legacy DBs
      const userCols = this.db.prepare("PRAGMA table_info(users)").all();
      const hasRole = userCols.some(c => c.name === 'role');
      if (!hasRole) {
        console.log('🔄 Migrating users table: adding role column');
        this.db.prepare("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'").run();
      }

      // Questions table
      this.db.prepare(`
        CREATE TABLE IF NOT EXISTS questions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          user_id INTEGER NOT NULL,
          accepted_answer_id INTEGER,
          votes INTEGER DEFAULT 0,
          view_count INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (accepted_answer_id) REFERENCES answers(id) ON DELETE SET NULL
        )
      `).run();

      // Answers table
      this.db.prepare(`
        CREATE TABLE IF NOT EXISTS answers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          question_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          content TEXT NOT NULL,
          votes INTEGER DEFAULT 0,
          is_accepted BOOLEAN DEFAULT FALSE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `).run();

      // Tags table
      this.db.prepare(`
        CREATE TABLE IF NOT EXISTS tags (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          description TEXT,
          usage_count INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `).run();

      // Question tags junction table
      this.db.prepare(`
        CREATE TABLE IF NOT EXISTS question_tags (
          question_id INTEGER NOT NULL,
          tag_id INTEGER NOT NULL,
          PRIMARY KEY (question_id, tag_id),
          FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
          FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
        )
      `).run();

      // Votes table
      this.db.prepare(`
        CREATE TABLE IF NOT EXISTS votes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          target_id INTEGER NOT NULL,
          target_type TEXT NOT NULL CHECK (target_type IN ('question', 'answer')),
          vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE (user_id, target_id, target_type),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `).run();

      // Notifications table
      this.db.prepare(`
        CREATE TABLE IF NOT EXISTS notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('answer', 'comment', 'mention', 'vote')),
          message TEXT NOT NULL,
          is_read BOOLEAN DEFAULT FALSE,
          related_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `).run();

      console.log('✅ Database tables created successfully');
    } catch (error) {
      console.error('❌ Table creation failed:', error);
      throw error;
    }
  }

  seedData() {
    try {
      console.log('🌱 Seeding initial data...');

      // Insert / ensure default users (guest, user, admin)
      const defaults = [
        { u: 'guest', p: 'guest123', r: 'guest' },
        { u: 'user', p: 'user123', r: 'user' },
        { u: 'admin', p: 'admin123', r: 'admin' },
      ];
      const getUser = this.db.prepare('SELECT id FROM users WHERE username = ?');
      const insertUserStmt = this.db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');
      defaults.forEach(({ u, p, r }) => {
        const found = getUser.get(u);
        if (!found) {
          insertUserStmt.run(u, p, r);
        }
      });

      // Add some sample tags
      const tagCount = this.db.prepare('SELECT COUNT(*) as count FROM tags').get().count;
      if (tagCount === 0) {
        const insertTag = this.db.prepare('INSERT INTO tags (name, description) VALUES (?, ?)');
        
        insertTag.run('javascript', 'JavaScript programming language');
        insertTag.run('node.js', 'Node.js runtime environment');
        insertTag.run('react', 'React JavaScript library');
        insertTag.run('express', 'Express.js web framework');
        insertTag.run('database', 'Database related questions');
        insertTag.run('api', 'API development and integration');
        
        console.log('✅ Sample tags created');
      }

      console.log('✅ Data seeding completed');
    } catch (error) {
      console.error('❌ Data seeding failed:', error);
      throw error;
    }
  }

  getConnection() {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  close() {
    if (this.db) {
      this.db.close();
      console.log('📦 Database connection closed');
    }
  }
}

// Create singleton instance
const databaseManager = new DatabaseManager();

module.exports = databaseManager.getConnection(); 