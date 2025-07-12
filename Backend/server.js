const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Add question API
app.post('/ask', (req, res) => {
  const { title, description, tags, userId } = req.body;
  const stmt = db.prepare(
    'INSERT INTO questions (title, description, tags, user_id) VALUES (?, ?, ?, ?)'
  );
  const info = stmt.run(title, description, tags, userId);
  res.json({ success: true, questionId: info.lastInsertRowid });
});

// Get all questions with user information
app.get('/questions', (req, res) => {
  const rows = db.prepare(`
    SELECT 
      q.id,
      q.title,
      q.description,
      q.tags,
      q.user_id,
      u.username
    FROM questions q
    LEFT JOIN users u ON q.user_id = u.id
    ORDER BY q.id DESC
  `).all();
  
  res.json({
    success: true,
    count: rows.length,
    questions: rows
  });
});

// Get users (for testing)
app.get('/users', (req, res) => {
  const rows = db.prepare('SELECT id, username FROM users').all();
  res.json({
    success: true,
    users: rows
  });
});

app.listen(3000, () => {
  console.log('🚀 Team Rookies API Server started!');
  console.log('📍 Server running at http://localhost:3000');
  console.log('🔗 Test routes:');
  console.log('   GET  /questions - View all questions');
  console.log('   GET  /users - View all users');
  console.log('   POST /ask - Create new question');
});
