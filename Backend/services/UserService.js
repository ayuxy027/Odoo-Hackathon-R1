const db = require('../config/database');
const logger = require('../utils/logger');

class UserService {
  // Get all users (for admin or public listing)
  static getAllUsers(pagination = {}) {
    try {
      logger.logDBOperation('SELECT', 'users', { pagination });
      
      const { limit = 10, offset = 0 } = pagination;
      
      const users = db.prepare(`
        SELECT 
          id, 
          username, 
          role, 
          created_at,
          (SELECT COUNT(*) FROM questions WHERE user_id = users.id) as question_count,
          (SELECT COUNT(*) FROM answers WHERE user_id = users.id) as answer_count
        FROM users 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `).all(limit, offset);

      const totalCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;

      return {
        success: true,
        users,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount
        }
      };
    } catch (error) {
      logger.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }
  }

  // Get user by ID
  static getUserById(userId) {
    try {
      logger.logDBOperation('SELECT', 'users', { userId });
      
      const user = db.prepare(`
        SELECT 
          id, 
          username, 
          role, 
          created_at,
          (SELECT COUNT(*) FROM questions WHERE user_id = ?) as question_count,
          (SELECT COUNT(*) FROM answers WHERE user_id = ?) as answer_count,
          (SELECT COUNT(*) FROM votes WHERE user_id = ?) as vote_count
        FROM users 
        WHERE id = ?
      `).get(userId, userId, userId, userId);

      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      return {
        success: true,
        user
      };
    } catch (error) {
      logger.error('Error fetching user by ID:', error);
      throw new Error('Failed to fetch user');
    }
  }

  // Get user by username
  static getUserByUsername(username) {
    try {
      logger.logDBOperation('SELECT', 'users', { username });
      
      const user = db.prepare(`
        SELECT 
          id, 
          username, 
          role, 
          created_at,
          (SELECT COUNT(*) FROM questions WHERE user_id = users.id) as question_count,
          (SELECT COUNT(*) FROM answers WHERE user_id = users.id) as answer_count
        FROM users 
        WHERE username = ?
      `).get(username);

      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      return {
        success: true,
        user
      };
    } catch (error) {
      logger.error('Error fetching user by username:', error);
      throw new Error('Failed to fetch user');
    }
  }

  // Create new user (if needed for registration)
  static createUser(userData) {
    try {
      const { username, password, role = 'user' } = userData;
      
      // Check if user already exists
      const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
      if (existingUser) {
        return {
          success: false,
          message: 'Username already exists'
        };
      }

      logger.logDBOperation('INSERT', 'users', { username, role });
      
      const stmt = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');
      const result = stmt.run(username, password, role);

      return {
        success: true,
        message: 'User created successfully',
        userId: result.lastInsertRowid
      };
    } catch (error) {
      logger.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  // Update user role (admin only)
  static updateUserRole(userId, newRole) {
    try {
      if (!['guest', 'user', 'admin'].includes(newRole)) {
        return {
          success: false,
          message: 'Invalid role'
        };
      }

      logger.logDBOperation('UPDATE', 'users', { userId, newRole });
      
      const stmt = db.prepare('UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
      const result = stmt.run(newRole, userId);

      if (result.changes === 0) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      return {
        success: true,
        message: 'User role updated successfully'
      };
    } catch (error) {
      logger.error('Error updating user role:', error);
      throw new Error('Failed to update user role');
    }
  }

  // Get user statistics
  static getUserStats(userId) {
    try {
      logger.logDBOperation('SELECT', 'users', { userId });
      
      const stats = db.prepare(`
        SELECT 
          (SELECT COUNT(*) FROM questions WHERE user_id = ?) as questions_asked,
          (SELECT COUNT(*) FROM answers WHERE user_id = ?) as answers_provided,
          (SELECT COUNT(*) FROM votes WHERE user_id = ?) as votes_cast,
          (SELECT COUNT(*) FROM answers WHERE user_id = ? AND is_accepted = 1) as accepted_answers,
          (SELECT SUM(votes) FROM questions WHERE user_id = ?) as question_votes,
          (SELECT SUM(votes) FROM answers WHERE user_id = ?) as answer_votes
      `).get(userId, userId, userId, userId, userId, userId);

      return {
        success: true,
        stats
      };
    } catch (error) {
      logger.error('Error fetching user stats:', error);
      throw new Error('Failed to fetch user statistics');
    }
  }

  // Authenticate user (used by auth middleware)
  static authenticate(username, password) {
    try {
      logger.logDBOperation('SELECT', 'users', { username });
      
      const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password);
      
      if (!user) {
        return {
          success: false,
          message: 'Invalid credentials'
        };
      }

      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      };
    } catch (error) {
      logger.error('Error authenticating user:', error);
      throw new Error('Authentication failed');
    }
  }
}

module.exports = UserService; 