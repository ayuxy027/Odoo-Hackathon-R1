const db = require('../config/database');
const logger = require('../utils/logger');

class VoteService {
  // Cast or update vote
  static castVote(userId, targetId, targetType, voteType) {
    try {
      logger.logDBOperation('INSERT/UPDATE', 'votes', { userId, targetId, targetType, voteType });

      // Validate inputs
      if (!['question', 'answer'].includes(targetType)) {
        return {
          success: false,
          message: 'Invalid target type'
        };
      }

      if (!['upvote', 'downvote'].includes(voteType)) {
        return {
          success: false,
          message: 'Invalid vote type'
        };
      }

      // Check if target exists
      const targetTable = targetType === 'question' ? 'questions' : 'answers';
      const target = db.prepare(`SELECT id, user_id FROM ${targetTable} WHERE id = ?`).get(targetId);
      
      if (!target) {
        return {
          success: false,
          message: `${targetType} not found`
        };
      }

      // Prevent self-voting
      if (target.user_id === userId) {
        return {
          success: false,
          message: 'You cannot vote on your own content'
        };
      }

      // Check existing vote
      const existingVote = db.prepare(`
        SELECT vote_type FROM votes 
        WHERE user_id = ? AND target_id = ? AND target_type = ?
      `).get(userId, targetId, targetType);

      let voteChange = 0;
      let action = '';

      const transaction = db.transaction(() => {
        if (existingVote) {
          if (existingVote.vote_type === voteType) {
            // Remove vote (toggle off)
            db.prepare(`
              DELETE FROM votes 
              WHERE user_id = ? AND target_id = ? AND target_type = ?
            `).run(userId, targetId, targetType);
            
            voteChange = voteType === 'upvote' ? -1 : 1;
            action = 'removed';
          } else {
            // Change vote
            db.prepare(`
              UPDATE votes 
              SET vote_type = ? 
              WHERE user_id = ? AND target_id = ? AND target_type = ?
            `).run(voteType, userId, targetId, targetType);
            
            voteChange = voteType === 'upvote' ? 2 : -2;
            action = 'changed';
          }
        } else {
          // New vote
          db.prepare(`
            INSERT INTO votes (user_id, target_id, target_type, vote_type) 
            VALUES (?, ?, ?, ?)
          `).run(userId, targetId, targetType, voteType);
          
          voteChange = voteType === 'upvote' ? 1 : -1;
          action = 'added';
        }

        // Update vote count in target table
        db.prepare(`
          UPDATE ${targetTable} 
          SET votes = votes + ? 
          WHERE id = ?
        `).run(voteChange, targetId);
      });

      transaction();

      // Create notification for content owner (if upvote)
      if (voteType === 'upvote' && action !== 'removed') {
        this.createVoteNotification(target.user_id, userId, targetId, targetType);
      }

      return {
        success: true,
        message: `Vote ${action} successfully`,
        voteChange,
        action
      };
    } catch (error) {
      logger.error('Error casting vote:', error);
      throw new Error('Failed to cast vote');
    }
  }

  // Get vote status for user on multiple items
  static getUserVotes(userId, targets) {
    try {
      if (!targets || targets.length === 0) {
        return {
          success: true,
          votes: {}
        };
      }

      logger.logDBOperation('SELECT', 'votes', { userId, targetCount: targets.length });

      // Build query for multiple targets
      const conditions = targets.map(target => 
        `(target_id = ${target.id} AND target_type = '${target.type}')`
      ).join(' OR ');

      const votes = db.prepare(`
        SELECT target_id, target_type, vote_type 
        FROM votes 
        WHERE user_id = ? AND (${conditions})
      `).all(userId);

      // Format response
      const voteMap = {};
      votes.forEach(vote => {
        const key = `${vote.target_type}_${vote.target_id}`;
        voteMap[key] = vote.vote_type;
      });

      return {
        success: true,
        votes: voteMap
      };
    } catch (error) {
      logger.error('Error fetching user votes:', error);
      throw new Error('Failed to fetch user votes');
    }
  }

  // Get voting statistics for a user
  static getUserVoteStats(userId) {
    try {
      logger.logDBOperation('SELECT', 'votes', { userId });

      const stats = db.prepare(`
        SELECT 
          COUNT(*) as total_votes,
          SUM(CASE WHEN vote_type = 'upvote' THEN 1 ELSE 0 END) as upvotes,
          SUM(CASE WHEN vote_type = 'downvote' THEN 1 ELSE 0 END) as downvotes,
          SUM(CASE WHEN target_type = 'question' THEN 1 ELSE 0 END) as question_votes,
          SUM(CASE WHEN target_type = 'answer' THEN 1 ELSE 0 END) as answer_votes
        FROM votes 
        WHERE user_id = ?
      `).get(userId);

      return {
        success: true,
        stats: stats || {
          total_votes: 0,
          upvotes: 0,
          downvotes: 0,
          question_votes: 0,
          answer_votes: 0
        }
      };
    } catch (error) {
      logger.error('Error fetching user vote stats:', error);
      throw new Error('Failed to fetch vote statistics');
    }
  }

  // Get top voted content
  static getTopVotedContent(contentType, limit = 10) {
    try {
      logger.logDBOperation('SELECT', contentType, { limit });

      const table = contentType === 'question' ? 'questions' : 'answers';
      const query = contentType === 'question' 
        ? `
          SELECT 
            q.id,
            q.title,
            q.votes,
            q.view_count,
            q.created_at,
            u.username as author
          FROM questions q
          JOIN users u ON q.user_id = u.id
          WHERE q.votes > 0
          ORDER BY q.votes DESC
          LIMIT ?
        `
        : `
          SELECT 
            a.id,
            a.content,
            a.votes,
            a.is_accepted,
            a.created_at,
            a.question_id,
            u.username as author,
            q.title as question_title
          FROM answers a
          JOIN users u ON a.user_id = u.id
          JOIN questions q ON a.question_id = q.id
          WHERE a.votes > 0
          ORDER BY a.votes DESC
          LIMIT ?
        `;

      const content = db.prepare(query).all(limit);

      return {
        success: true,
        content
      };
    } catch (error) {
      logger.error('Error fetching top voted content:', error);
      throw new Error('Failed to fetch top voted content');
    }
  }

  // Get vote history for a user
  static getUserVoteHistory(userId, options = {}) {
    try {
      const { limit = 20, offset = 0 } = options;
      
      logger.logDBOperation('SELECT', 'votes', { userId, options });

      const votes = db.prepare(`
        SELECT 
          v.target_id,
          v.target_type,
          v.vote_type,
          v.created_at,
          CASE 
            WHEN v.target_type = 'question' THEN q.title
            ELSE a.content
          END as content_preview
        FROM votes v
        LEFT JOIN questions q ON v.target_type = 'question' AND v.target_id = q.id
        LEFT JOIN answers a ON v.target_type = 'answer' AND v.target_id = a.id
        WHERE v.user_id = ?
        ORDER BY v.created_at DESC
        LIMIT ? OFFSET ?
      `).all(userId, limit, offset);

      const totalCount = db.prepare('SELECT COUNT(*) as count FROM votes WHERE user_id = ?')
        .get(userId).count;

      return {
        success: true,
        votes,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount
        }
      };
    } catch (error) {
      logger.error('Error fetching user vote history:', error);
      throw new Error('Failed to fetch vote history');
    }
  }

  // Helper method to create vote notification
  static createVoteNotification(contentOwnerId, voterId, targetId, targetType) {
    try {
      // Don't create notification if user is voting on their own content
      if (contentOwnerId === voterId) {
        return;
      }

      const voter = db.prepare('SELECT username FROM users WHERE id = ?').get(voterId);
      
      if (voter) {
        const message = `${voter.username} upvoted your ${targetType}`;
        
        db.prepare(`
          INSERT INTO notifications (user_id, type, message, related_id) 
          VALUES (?, 'vote', ?, ?)
        `).run(contentOwnerId, message, targetId);
        
        logger.info('Vote notification created', { contentOwnerId, voterId, targetId, targetType });
      }
    } catch (error) {
      logger.error('Error creating vote notification:', error);
      // Don't throw error as this is not critical
    }
  }
}

module.exports = VoteService; 