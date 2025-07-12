const Database = require('better-sqlite3');
const db = new Database('stackit.db');

// Create users table
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password TEXT
  )
`).run();

// Create questions table
db.prepare(`
  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    tags TEXT,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`).run();

// Add sample users if they don't exist
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
if (userCount === 0) {
  const insertUser = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
  insertUser.run('ayush_yadav', 'password123');
  insertUser.run('dnyanesh_mulay', 'password123');
  insertUser.run('snehal_patil', 'password123');
  insertUser.run('dibyatanu_ghosh', 'password123');
}

// Add sample questions if they don't exist
const questionCount = db.prepare('SELECT COUNT(*) as count FROM questions').get().count;
if (questionCount === 0) {
  const insertQuestion = db.prepare('INSERT INTO questions (title, description, tags, user_id) VALUES (?, ?, ?, ?)');
  
  insertQuestion.run(
    'How to implement user authentication in Odoo?',
    'I need to create a custom authentication system for my Odoo module. What are the best practices?',
    'odoo,authentication,security',
    1
  );
  
  insertQuestion.run(
    'Best practices for Odoo module development?',
    'What are the coding standards and best practices when developing custom modules for Odoo?',
    'odoo,development,best-practices',
    2
  );
  
  insertQuestion.run(
    'How to deploy Odoo application with CI/CD?',
    'Looking for guidance on setting up continuous integration and deployment for Odoo applications.',
    'odoo,deployment,ci-cd,devops',
    3
  );
  
  insertQuestion.run(
    'UI/UX design patterns for Odoo frontend?',
    'What are the recommended design patterns and UI frameworks for creating modern Odoo interfaces?',
    'odoo,ui-ux,design,frontend',
    4
  );
  
  insertQuestion.run(
    'Database optimization techniques in Odoo?',
    'How can I optimize database queries and improve performance in Odoo applications?',
    'odoo,database,optimization,performance',
    1
  );
}

module.exports = db;
