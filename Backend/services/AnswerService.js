const db = require('../config/database');
const logger = require('../utils/logger');

class AnswerService {
  // Get all answers for a question
  static getAnswersByQuestionId(questionId, options = {}) {
    try {
      const { 
        limit = 10, 
        offset = 0, 
        sortBy = 'votes', 
        sortOrder = 'DESC',
        userId = null 
      } = options;

      logger.logDBOperation('SELECT', 'answers', { questionId, options });

      // Validate sort options
      const allowedSortFields = ['votes', 'created_at', 'is_accepted'];
      const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'votes';
      const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      const query = `
        SELECT 
          a.id,
          a.content,
          a.votes,
          a.is_accepted,
          a.created_at,
          a.updated_at,
          a.user_id,
          u.username as author,
          u.role as author_role
        FROM answers a
        JOIN users u ON a.user_id = u.id
        WHERE a.question_id = ?
        ORDER BY 
          a.is_accepted DESC,
          a.${safeSortBy} ${safeSortOrder}
        LIMIT ? OFFSET ?
      `;

      const answers = db.prepare(query).all(questionId, limit, offset);

      // Get user votes for each answer (if user is logged in)
      if (userId) {
        const answerIds = answers.map(a => a.id);
        if (answerIds.length > 0) {
          const placeholders = answerIds.map(() => '?').join(',');
          const votes = db.prepare(`
            SELECT target_id, vote_type 
            FROM votes 
            WHERE user_id = ? AND target_type = 'answer' AND target_id IN (${placeholders})
          `).all(userId, ...answerIds);

          const voteMap = {};
          votes.forEach(vote => {
            voteMap[vote.target_id] = vote.vote_type;
          });

          answers.forEach(answer => {
            answer.userVote = voteMap[answer.id] || null;
          });
        }
      }

      // Get total count for pagination
      const totalCount = db.prepare('SELECT COUNT(*) as count FROM answers WHERE question_id = ?')
        .get(questionId).count;

      return {
        success: true,
        answers,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount
        }
      };
    } catch (error) {
      logger.error('Error fetching answers for question:', error);
      throw new Error('Failed to fetch answers');
    }
  }

  // Get answer by ID
  static getAnswerById(answerId, userId = null) {
    try {
      logger.logDBOperation('SELECT', 'answers', { answerId });

      const answer = db.prepare(`
        SELECT 
          a.id,
          a.content,
          a.votes,
          a.is_accepted,
          a.created_at,
          a.updated_at,
          a.user_id,
          a.question_id,
          u.username as author,
          u.role as author_role
        FROM answers a
        JOIN users u ON a.user_id = u.id
        WHERE a.id = ?
      `).get(answerId);

      if (!answer) {
        return {
          success: false,
          message: 'Answer not found'
        };
      }

      // Get user's vote on this answer (if user is logged in)
      let userVote = null;
      if (userId) {
        const vote = db.prepare('SELECT vote_type FROM votes WHERE user_id = ? AND target_id = ? AND target_type = ?')
          .get(userId, answerId, 'answer');
        userVote = vote ? vote.vote_type : null;
      }

      return {
        success: true,
        answer: {
          ...answer,
          userVote
        }
      };
    } catch (error) {
      logger.error('Error fetching answer by ID:', error);
      throw new Error('Failed to fetch answer');
    }
  }

  // Create new answer
  static createAnswer(answerData, userId) {
    try {
      const { questionId, content } = answerData;
      
      logger.logDBOperation('INSERT', 'answers', { questionId, userId });

      // Check if question exists
      const question = db.prepare('SELECT id FROM questions WHERE id = ?').get(questionId);
      if (!question) {
        return {
          success: false,
          message: 'Question not found'
        };
      }

      // Insert answer
      const stmt = db.prepare('INSERT INTO answers (question_id, user_id, content) VALUES (?, ?, ?)');
      const result = stmt.run(questionId, userId, content);

      // Create notification for question author
      this.createAnswerNotification(questionId, userId, result.lastInsertRowid);

      return {
        success: true,
        message: 'Answer created successfully',
        answerId: result.lastInsertRowid
      };
    } catch (error) {
      logger.error('Error creating answer:', error);
      throw new Error('Failed to create answer');
    }
  }

  // Update answer
  static updateAnswer(answerId, answerData, userId) {
    try {
      const { content } = answerData;
      
      logger.logDBOperation('UPDATE', 'answers', { answerId, userId });

      // Update answer (only if user owns it)
      const stmt = db.prepare(`
        UPDATE answers 
        SET content = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ? AND user_id = ?
      `);
      const result = stmt.run(content, answerId, userId);

      if (result.changes === 0) {
        return {
          success: false,
          message: 'Answer not found or you do not have permission to update it'
        };
      }

      return {
        success: true,
        message: 'Answer updated successfully'
      };
    } catch (error) {
      logger.error('Error updating answer:', error);
      throw new Error('Failed to update answer');
    }
  }

  // Delete answer
  static deleteAnswer(answerId, userId, userRole) {
    try {
      logger.logDBOperation('DELETE', 'answers', { answerId, userId });

      // Check if user owns the answer or is admin
      const answer = db.prepare('SELECT user_id, question_id FROM answers WHERE id = ?').get(answerId);
      
      if (!answer) {
        return {
          success: false,
          message: 'Answer not found'
        };
      }

      if (answer.user_id !== userId && userRole !== 'admin') {
        return {
          success: false,
          message: 'You do not have permission to delete this answer'
        };
      }

      // If this is the accepted answer, remove acceptance
      const transaction = db.transaction(() => {
        // Remove acceptance from question if this was the accepted answer
        db.prepare('UPDATE questions SET accepted_answer_id = NULL WHERE accepted_answer_id = ?').run(answerId);
        
        // Delete the answer
        db.prepare('DELETE FROM answers WHERE id = ?').run(answerId);
      });

      transaction();

      return {
        success: true,
        message: 'Answer deleted successfully'
      };
    } catch (error) {
      logger.error('Error deleting answer:', error);
      throw new Error('Failed to delete answer');
    }
  }

  // Get answers by user
  static getAnswersByUserId(userId, options = {}) {
    try {
      const { limit = 10, offset = 0 } = options;
      
      logger.logDBOperation('SELECT', 'answers', { userId, options });

      const answers = db.prepare(`
        SELECT 
          a.id,
          a.content,
          a.votes,
          a.is_accepted,
          a.created_at,
          a.question_id,
          q.title as question_title
        FROM answers a
        JOIN questions q ON a.question_id = q.id
        WHERE a.user_id = ?
        ORDER BY a.created_at DESC
        LIMIT ? OFFSET ?
      `).all(userId, limit, offset);

      const totalCount = db.prepare('SELECT COUNT(*) as count FROM answers WHERE user_id = ?')
        .get(userId).count;

      return {
        success: true,
        answers,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount
        }
      };
    } catch (error) {
      logger.error('Error fetching answers by user:', error);
      throw new Error('Failed to fetch user answers');
    }
  }

  // Helper method to create notification when answer is posted
  static createAnswerNotification(questionId, answerUserId, answerId) {
    try {
      // Get question author
      const question = db.prepare('SELECT user_id FROM questions WHERE id = ?').get(questionId);
      
      if (question && question.user_id !== answerUserId) {
        // Don't notify if user is answering their own question
        const answerUser = db.prepare('SELECT username FROM users WHERE id = ?').get(answerUserId);
        
        if (answerUser) {
          const message = `${answerUser.username} answered your question`;
          
          db.prepare(`
            INSERT INTO notifications (user_id, type, message, related_id) 
            VALUES (?, 'answer', ?, ?)
          `).run(question.user_id, message, answerId);
          
          logger.info('Answer notification created', { questionId, answerUserId, answerId });
        }
      }
    } catch (error) {
      logger.error('Error creating answer notification:', error);
      // Don't throw error as this is not critical
    }
  }
}

module.exports = AnswerService; 