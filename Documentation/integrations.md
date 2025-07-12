# 🔗 StackIt Backend Integration Guide

## Overview
This guide provides complete instructions for integrating with the StackIt backend API. The backend is a RESTful API built with Express.js and SQLite, featuring header-based authentication and role-based access control.

---

## 🚀 Getting Started

### Backend Setup
```bash
cd Backend
npm install
npm start
# Server runs on http://localhost:3000
```

### Environment Variables
The backend reads from `Backend/.env`:
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=<generated-secret>
SESSION_SECRET=<generated-secret>
CLIENT_URL=http://localhost:5173
```

---

## 🔐 Authentication

### Authentication Method
The API uses **header-based authentication**. Include credentials in request headers:

```javascript
const headers = {
  'username': 'guest',
  'password': 'guest123',
  'Content-Type': 'application/json'
};
```

### User Roles & Credentials
```javascript
const credentials = {
  guest: { username: 'guest', password: 'guest123', role: 'guest' },
  user:  { username: 'user',  password: 'user123',  role: 'user' },
  admin: { username: 'admin', password: 'admin123', role: 'admin' }
};
```

### Authentication Levels
- **Public**: No auth required (reading questions/answers)
- **Optional**: Works with or without auth (returns more data when authenticated)
- **Required**: Must provide valid credentials
- **Role-based**: Requires specific role (admin only for tags management)

---

## 📡 API Endpoints

### Base URL
```
http://localhost:3000/api
```

### CORS Configuration
- Allowed Origin: `http://localhost:5173`
- Credentials: Supported
- Headers: `username`, `password`, `Content-Type`

---

## 📋 Questions API

### List Questions
```http
GET /api/questions?page=1&limit=10&sortBy=created_at&sortOrder=DESC&tag=javascript&search=react
```

**Authentication**: Optional  
**Query Parameters**:
- `page` (int): Page number (default: 1)
- `limit` (int): Items per page (1-100, default: 10)
- `sortBy` (string): `created_at`, `votes`, `view_count`, `title`
- `sortOrder` (string): `ASC` or `DESC`
- `tag` (string): Filter by tag name
- `search` (string): Search in title/description
- `userId` (int): Filter by author

**Response**:
```json
{
  "success": true,
  "questions": [
    {
      "id": 1,
      "title": "How to use React hooks?",
      "description": "I need help with useState...",
      "votes": 5,
      "view_count": 42,
      "created_at": "2025-07-12 09:37:08",
      "updated_at": "2025-07-12 09:37:08",
      "accepted_answer_id": 3,
      "author": "user",
      "author_role": "user",
      "answer_count": 2,
      "tags": "react,hooks,javascript",
      "userVote": "upvote" // only if authenticated
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 10,
    "offset": 0,
    "hasMore": false
  }
}
```

### Get Question by ID
```http
GET /api/questions/1
```

**Authentication**: Optional  
**Response**: Single question object with `userVote` if authenticated

### Create Question
```http
POST /api/questions
Content-Type: application/json
username: user
password: user123

{
  "title": "How to implement authentication?",
  "description": "I need help with user login...",
  "tags": ["authentication", "security", "nodejs"]
}
```

**Authentication**: Required  
**Validation**:
- `title`: Required, max 200 chars
- `description`: Required, max 5000 chars
- `tags`: Optional array, max 10 tags, each max 50 chars

**Response**:
```json
{
  "success": true,
  "message": "Question created successfully",
  "questionId": 2
}
```

### Update Question
```http
PUT /api/questions/1
Content-Type: application/json
username: user
password: user123

{
  "title": "Updated title",
  "description": "Updated description",
  "tags": ["updated", "tags"]
}
```

**Authentication**: Required + Ownership  
**Note**: Only question author or admin can update

### Delete Question
```http
DELETE /api/questions/1
username: user
password: user123
```

**Authentication**: Required + Ownership

### Accept Answer
```http
POST /api/questions/1/accept
Content-Type: application/json
username: user
password: user123

{
  "answerId": 3
}
```

**Authentication**: Required + Question ownership

---

## 💬 Answers API

### List Answers for Question
```http
GET /api/answers/question/1?page=1&limit=10&sortBy=votes&sortOrder=DESC
```

**Authentication**: Optional  
**Response**: Array of answers sorted by acceptance status first, then by specified field

### Get Answer by ID
```http
GET /api/answers/1
```

**Authentication**: Optional

### Create Answer
```http
POST /api/answers
Content-Type: application/json
username: user
password: user123

{
  "questionId": 1,
  "content": "Here's how you can solve this problem..."
}
```

**Authentication**: Required  
**Validation**:
- `questionId`: Required, must exist
- `content`: Required, max 10000 chars

### Update Answer
```http
PUT /api/answers/1
Content-Type: application/json
username: user
password: user123

{
  "content": "Updated answer content..."
}
```

**Authentication**: Required + Ownership

### Delete Answer
```http
DELETE /api/answers/1
username: user
password: user123
```

**Authentication**: Required + Ownership

---

## 👍 Voting API

### Cast Vote
```http
POST /api/votes
Content-Type: application/json
username: guest
password: guest123

{
  "targetId": 1,
  "targetType": "question",
  "voteType": "upvote"
}
```

**Authentication**: Required  
**Validation**:
- `targetType`: "question" or "answer"
- `voteType`: "upvote" or "downvote"
- Cannot vote on own content
- Voting same type twice removes vote (toggle)

**Response**:
```json
{
  "success": true,
  "message": "Vote added successfully",
  "voteChange": 1,
  "action": "added"
}
```

### Get User Vote Stats
```http
GET /api/votes/stats
username: user
password: user123
```

**Authentication**: Required

---

## 🏷️ Tags API

### List Tags
```http
GET /api/tags?page=1&limit=20&sortBy=usage_count&sortOrder=DESC&search=javascript
```

**Authentication**: Optional

### Get Tag by ID
```http
GET /api/tags/1
```

**Authentication**: Optional

### Create Tag (Admin Only)
```http
POST /api/tags
Content-Type: application/json
username: admin
password: admin123

{
  "name": "machine-learning",
  "description": "Machine learning and AI topics"
}
```

**Authentication**: Admin required

---

## 🔔 Notifications API

### List User Notifications
```http
GET /api/notifications?page=1&limit=20&unreadOnly=true&type=answer
username: user
password: user123
```

**Authentication**: Required  
**Query Parameters**:
- `unreadOnly` (boolean): Filter unread notifications
- `type` (string): "answer", "comment", "mention", "vote"

### Get Unread Count
```http
GET /api/notifications/unread-count
username: user
password: user123
```

### Mark as Read
```http
POST /api/notifications/1/read
username: user
password: user123
```

### Mark All as Read
```http
POST /api/notifications/read-all
username: user
password: user123
```

---

## 👥 Users API

### List Users
```http
GET /api/users?page=1&limit=10
```

**Authentication**: Optional

### Get User by ID
```http
GET /api/users/1
```

**Authentication**: Optional

### Get User Stats
```http
GET /api/users/1/stats
username: user
password: user123
```

**Authentication**: Required

---

## 🔧 Frontend Integration Examples

### Axios Setup
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: false,
});

// Auth interceptor
api.interceptors.request.use((config) => {
  const auth = getCurrentUser(); // Your auth state
  if (auth) {
    config.headers.username = auth.username;
    config.headers.password = auth.password;
  }
  return config;
});

export default api;
```

### Fetch Example
```javascript
// With authentication
const response = await fetch('http://localhost:3000/api/questions', {
  headers: {
    'username': 'user',
    'password': 'user123',
    'Content-Type': 'application/json'
  }
});

// Create question
const response = await fetch('http://localhost:3000/api/questions', {
  method: 'POST',
  headers: {
    'username': 'user',
    'password': 'user123',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'My Question',
    description: 'Question description',
    tags: ['javascript', 'react']
  })
});
```

### React Hook Example
```javascript
import { useState, useEffect } from 'react';
import api from './api';

const useQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await api.get('/questions');
        setQuestions(response.data.questions);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch questions');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  return { questions, loading, error };
};
```

---

## ⚠️ Error Handling

### Common Error Responses
```javascript
// 401 Unauthorized
{
  "success": false,
  "message": "Authentication required. Please provide username and password in headers."
}

// 401 Invalid credentials
{
  "success": false,
  "message": "Invalid username or password"
}

// 403 Forbidden
{
  "success": false,
  "message": "Access denied. Required role: admin"
}

// 400 Validation Error
{
  "success": false,
  "message": "Question validation failed",
  "errors": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}

// 404 Not Found
{
  "success": false,
  "message": "Question not found"
}
```

### Frontend Error Handling
```javascript
try {
  const response = await api.post('/questions', questionData);
  // Handle success
} catch (error) {
  if (error.response?.status === 401) {
    // Redirect to login
    redirectToLogin();
  } else if (error.response?.status === 400) {
    // Show validation errors
    const errors = error.response.data.errors;
    showValidationErrors(errors);
  } else {
    // Show generic error
    showError(error.response?.data?.message || 'Something went wrong');
  }
}
```

---

## 🧪 Testing

### Test with curl
```bash
# Test authentication
curl -H "username: guest" -H "password: guest123" http://localhost:3000/api/users/1/stats

# Create question
curl -X POST -H "Content-Type: application/json" \
  -H "username: user" -H "password: user123" \
  -d '{"title":"Test Question","description":"Test description","tags":["test"]}' \
  http://localhost:3000/api/questions

# Vote on question
curl -X POST -H "Content-Type: application/json" \
  -H "username: guest" -H "password: guest123" \
  -d '{"targetId":1,"targetType":"question","voteType":"upvote"}' \
  http://localhost:3000/api/votes
```

---

## 📊 Rate Limits & Performance

- No rate limiting implemented (hackathon simplicity)
- Pagination recommended for large datasets
- Maximum 100 items per page
- Database is SQLite (local file) - suitable for development

---

## 🔒 Security Features

✅ **Header-based authentication** (no credentials in URLs)  
✅ **Role-based access control** (guest/user/admin)  
✅ **Input validation** on all endpoints  
✅ **SQL injection protection** via prepared statements  
✅ **CORS configured** for frontend origin  
✅ **Ownership checks** for user content  
✅ **No self-voting** protection  

---

## 📝 Notes

- This is a **hackathon project** - optimized for simplicity and rapid development
- Authentication is header-based (not JWT) for simplicity
- All passwords are stored in plain text (development only)
- SQLite database is committed to repo for easy setup
- Real-time features use polling (no WebSockets)

---

## 🆘 Troubleshooting

### Backend not starting
```bash
cd Backend
rm stackit.db  # Reset database
npm start
```

### CORS errors
- Ensure frontend runs on `http://localhost:5173`
- Check `CLIENT_URL` in `.env`

### Authentication not working
- Verify credentials: guest/guest123, user/user123, admin/admin123
- Check headers are set correctly
- Use browser dev tools to inspect requests

### 404 errors
- Ensure backend is running on port 3000
- Check API base URL: `http://localhost:3000/api`

---

**Happy coding! 🚀**