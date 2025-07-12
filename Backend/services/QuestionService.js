const db = require('../config/database');
const logger = require('../utils/logger');

class QuestionService {
  // Get all questions with pagination, filtering, and sorting
  static getAllQuestions(options = {}) {
    try {
      const { 
        limit = 10, 
        offset = 0, 
        sortBy = 'created_at', 
        sortOrder = 'DESC',
        tagFilter = null,
        search = null,
        userId = null 
      } = options;

      logger.logDBOperation('SELECT', 'questions', { options });

      let query = `
        SELECT 
          q.id,
          q.title,
          q.description,
          q.votes,
          q.view_count,
          q.created_at,
          q.updated_at,
          q.accepted_answer_id,
          u.username as author,
          u.role as author_role,
          (SELECT COUNT(*) FROM answers WHERE question_id = q.id) as answer_count,
          (SELECT GROUP_CONCAT(t.name) FROM tags t 
           JOIN question_tags qt ON t.id = qt.tag_id 
           WHERE qt.question_id = q.id) as tags
        FROM questions q
        JOIN users u ON q.user_id = u.id
      `;

      const params = [];
      const conditions = [];

      // Add search filter
      if (search) {
        conditions.push('(q.title LIKE ? OR q.description LIKE ?)');
        params.push(`%${search}%`, `%${search}%`);
      }

      // Add tag filter
      if (tagFilter) {
        conditions.push(`q.id IN (
          SELECT qt.question_id FROM question_tags qt
          JOIN tags t ON qt.tag_id = t.id
          WHERE t.name = ?
        )`);
        params.push(tagFilter);
      }

      // Add user filter
      if (userId) {
        conditions.push('q.user_id = ?');
        params.push(userId);
      }

      // Add WHERE clause if conditions exist
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      // Add sorting
      const allowedSortFields = ['created_at', 'votes', 'view_count', 'title'];
      const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
      const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      
      query += ` ORDER BY q.${safeSortBy} ${safeSortOrder}`;
      
      // Add pagination
      query += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const questions = db.prepare(query).all(...params);

      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) as count FROM questions q';
      const countParams = [];
      
      if (conditions.length > 0) {
        countQuery += ' WHERE ' + conditions.join(' AND ');
        // Add the same filter params (excluding limit/offset)
        countParams.push(...params.slice(0, -2));
      }

      const totalCount = db.prepare(countQuery).get(...countParams).count;

      return {
        success: true,
        questions,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount
        }
      };
    } catch (error) {
      logger.error('Error fetching questions:', error);
      throw new Error('Failed to fetch questions');
    }
  }

  // Get question by ID with all details
  static getQuestionById(questionId, userId = null) {
    try {
      logger.logDBOperation('SELECT', 'questions', { questionId });

      // Increment view count
      db.prepare('UPDATE questions SET view_count = view_count + 1 WHERE id = ?').run(questionId);

      // Get question with details
      const question = db.prepare(`
        SELECT 
          q.id,
          q.title,
          q.description,
          q.votes,
          q.view_count,
          q.created_at,
          q.updated_at,
          q.accepted_answer_id,
          q.user_id,
          u.username as author,
          u.role as author_role,
          (SELECT GROUP_CONCAT(t.name) FROM tags t 
           JOIN question_tags qt ON t.id = qt.tag_id 
           WHERE qt.question_id = q.id) as tags
        FROM questions q
        JOIN users u ON q.user_id = u.id
        WHERE q.id = ?
      `).get(questionId);

      if (!question) {
        return {
          success: false,
          message: 'Question not found'
        };
      }

      // Get user's vote on this question (if user is logged in)
      let userVote = null;
      if (userId) {
        const vote = db.prepare('SELECT vote_type FROM votes WHERE user_id = ? AND target_id = ? AND target_type = ?')
          .get(userId, questionId, 'question');
        userVote = vote ? vote.vote_type : null;
      }

      return {
        success: true,
        question: {
          ...question,
          tags: question.tags ? question.tags.split(',') : [],
          userVote
        }
      };
    } catch (error) {
      logger.error('Error fetching question by ID:', error);
      throw new Error('Failed to fetch question');
    }
  }

  // Create new question
  static createQuestion(questionData, userId) {
    try {
      const { title, description, tags = [] } = questionData;
      
      logger.logDBOperation('INSERT', 'questions', { title, userId, tagCount: tags.length });

      // Start transaction
      const insertQuestion = db.prepare('INSERT INTO questions (title, description, user_id) VALUES (?, ?, ?)');
      const result = insertQuestion.run(title, description, userId);
      const questionId = result.lastInsertRowid;

      // Handle tags
      if (tags.length > 0) {
        this.associateTagsWithQuestion(questionId, tags);
      }

      return {
        success: true,
        message: 'Question created successfully',
        questionId
      };
    } catch (error) {
      logger.error('Error creating question:', error);
      throw new Error('Failed to create question');
    }
  }

  // Update question
  static updateQuestion(questionId, questionData, userId) {
    try {
      const { title, description, tags = [] } = questionData;
      
      logger.logDBOperation('UPDATE', 'questions', { questionId, userId });

      // Update question
      const stmt = db.prepare(`
        UPDATE questions 
        SET title = ?, description = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ? AND user_id = ?
      `);
      const result = stmt.run(title, description, questionId, userId);

      if (result.changes === 0) {
        return {
          success: false,
          message: 'Question not found or you do not have permission to update it'
        };
      }

      // Update tags
      this.updateQuestionTags(questionId, tags);

      return {
        success: true,
        message: 'Question updated successfully'
      };
    } catch (error) {
      logger.error('Error updating question:', error);
      throw new Error('Failed to update question');
    }
  }

  // Delete question
  static deleteQuestion(questionId, userId, userRole) {
    try {
      logger.logDBOperation('DELETE', 'questions', { questionId, userId });

      // Check if user owns the question or is admin
      const question = db.prepare('SELECT user_id FROM questions WHERE id = ?').get(questionId);
      
      if (!question) {
        return {
          success: false,
          message: 'Question not found'
        };
      }

      if (question.user_id !== userId && userRole !== 'admin') {
        return {
          success: false,
          message: 'You do not have permission to delete this question'
        };
      }

      // Delete question (cascading will handle related records)
      const stmt = db.prepare('DELETE FROM questions WHERE id = ?');
      stmt.run(questionId);

      return {
        success: true,
        message: 'Question deleted successfully'
      };
    } catch (error) {
      logger.error('Error deleting question:', error);
      throw new Error('Failed to delete question');
    }
  }

  // Accept answer for question
  static acceptAnswer(questionId, answerId, userId) {
    try {
      logger.logDBOperation('UPDATE', 'questions', { questionId, answerId, userId });

      // Check if user owns the question
      const question = db.prepare('SELECT user_id FROM questions WHERE id = ?').get(questionId);
      
      if (!question) {
        return {
          success: false,
          message: 'Question not found'
        };
      }

      if (question.user_id !== userId) {
        return {
          success: false,
          message: 'Only the question author can accept answers'
        };
      }

      // Check if answer exists for this question
      const answer = db.prepare('SELECT id FROM answers WHERE id = ? AND question_id = ?')
        .get(answerId, questionId);
      
      if (!answer) {
        return {
          success: false,
          message: 'Answer not found for this question'
        };
      }

      // Update question and answer
      const transaction = db.transaction(() => {
        // Remove previous accepted answer
        db.prepare('UPDATE answers SET is_accepted = 0 WHERE question_id = ?').run(questionId);
        
        // Set new accepted answer
        db.prepare('UPDATE answers SET is_accepted = 1 WHERE id = ?').run(answerId);
        
        // Update question
        db.prepare('UPDATE questions SET accepted_answer_id = ? WHERE id = ?').run(answerId, questionId);
      });

      transaction();

      return {
        success: true,
        message: 'Answer accepted successfully'
      };
    } catch (error) {
      logger.error('Error accepting answer:', error);
      throw new Error('Failed to accept answer');
    }
  }

  // Helper method to associate tags with question
  static associateTagsWithQuestion(questionId, tags) {
    try {
      const insertTag = db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)');
      const getTagId = db.prepare('SELECT id FROM tags WHERE name = ?');
      const insertQuestionTag = db.prepare('INSERT OR IGNORE INTO question_tags (question_id, tag_id) VALUES (?, ?)');
      const updateTagUsage = db.prepare('UPDATE tags SET usage_count = usage_count + 1 WHERE id = ?');

      tags.forEach(tagName => {
        const cleanTag = tagName.trim().toLowerCase();
        
        // Insert tag if not exists
        insertTag.run(cleanTag);
        
        // Get tag ID
        const tag = getTagId.get(cleanTag);
        
        if (tag) {
          // Associate with question
          insertQuestionTag.run(questionId, tag.id);
          
          // Update usage count
          updateTagUsage.run(tag.id);
        }
      });
    } catch (error) {
      logger.error('Error associating tags with question:', error);
      throw error;
    }
  }

  // Helper method to update question tags
  static updateQuestionTags(questionId, tags) {
    try {
      const transaction = db.transaction(() => {
        // Remove existing tags
        db.prepare('DELETE FROM question_tags WHERE question_id = ?').run(questionId);
        
        // Add new tags
        if (tags.length > 0) {
          this.associateTagsWithQuestion(questionId, tags);
        }
      });

      transaction();
    } catch (error) {
      logger.error('Error updating question tags:', error);
      throw error;
    }
  }
}

module.exports = QuestionService; 