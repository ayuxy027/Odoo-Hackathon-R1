const db = require('../config/database');
const logger = require('../utils/logger');

class NotificationService {
  // Get all notifications for a user
  static getUserNotifications(userId, options = {}) {
    try {
      const { 
        limit = 20, 
        offset = 0, 
        unreadOnly = false,
        type = null 
      } = options;

      logger.logDBOperation('SELECT', 'notifications', { userId, options });

      let query = `
        SELECT 
          n.id,
          n.type,
          n.message,
          n.is_read,
          n.related_id,
          n.created_at
        FROM notifications n
        WHERE n.user_id = ?
      `;

      const params = [userId];
      const conditions = [];

      // Add unread only filter
      if (unreadOnly) {
        conditions.push('n.is_read = FALSE');
      }

      // Add type filter
      if (type) {
        conditions.push('n.type = ?');
        params.push(type);
      }

      // Add additional conditions
      if (conditions.length > 0) {
        query += ' AND ' + conditions.join(' AND ');
      }

      // Add ordering and pagination
      query += ' ORDER BY n.created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const notifications = db.prepare(query).all(...params);

      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) as count FROM notifications n WHERE n.user_id = ?';
      const countParams = [userId];

      if (conditions.length > 0) {
        countQuery += ' AND ' + conditions.join(' AND ');
        countParams.push(...params.slice(1, -2)); // Skip userId and limit/offset
      }

      const totalCount = db.prepare(countQuery).get(...countParams).count;

      return {
        success: true,
        notifications,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount
        }
      };
    } catch (error) {
      logger.error('Error fetching user notifications:', error);
      throw new Error('Failed to fetch notifications');
    }
  }

  // Get unread notification count
  static getUnreadCount(userId) {
    try {
      logger.logDBOperation('SELECT', 'notifications', { userId });

      const result = db.prepare(`
        SELECT COUNT(*) as count 
        FROM notifications 
        WHERE user_id = ? AND is_read = FALSE
      `).get(userId);

      return {
        success: true,
        unreadCount: result.count
      };
    } catch (error) {
      logger.error('Error fetching unread count:', error);
      throw new Error('Failed to fetch unread count');
    }
  }

  // Mark notification as read
  static markAsRead(notificationId, userId) {
    try {
      logger.logDBOperation('UPDATE', 'notifications', { notificationId, userId });

      const stmt = db.prepare(`
        UPDATE notifications 
        SET is_read = TRUE 
        WHERE id = ? AND user_id = ?
      `);
      
      const result = stmt.run(notificationId, userId);

      if (result.changes === 0) {
        return {
          success: false,
          message: 'Notification not found or you do not have permission to modify it'
        };
      }

      return {
        success: true,
        message: 'Notification marked as read'
      };
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      throw new Error('Failed to mark notification as read');
    }
  }

  // Mark all notifications as read
  static markAllAsRead(userId) {
    try {
      logger.logDBOperation('UPDATE', 'notifications', { userId });

      const stmt = db.prepare(`
        UPDATE notifications 
        SET is_read = TRUE 
        WHERE user_id = ? AND is_read = FALSE
      `);
      
      const result = stmt.run(userId);

      return {
        success: true,
        message: `Marked ${result.changes} notifications as read`
      };
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      throw new Error('Failed to mark all notifications as read');
    }
  }

  // Create notification (used internally by other services)
  static createNotification(notificationData) {
    try {
      const { userId, type, message, relatedId = null } = notificationData;

      logger.logDBOperation('INSERT', 'notifications', { userId, type });

      // Validate notification type
      const validTypes = ['answer', 'comment', 'mention', 'vote'];
      if (!validTypes.includes(type)) {
        return {
          success: false,
          message: 'Invalid notification type'
        };
      }

      // Insert notification
      const stmt = db.prepare(`
        INSERT INTO notifications (user_id, type, message, related_id) 
        VALUES (?, ?, ?, ?)
      `);
      
      const result = stmt.run(userId, type, message, relatedId);

      return {
        success: true,
        message: 'Notification created successfully',
        notificationId: result.lastInsertRowid
      };
    } catch (error) {
      logger.error('Error creating notification:', error);
      throw new Error('Failed to create notification');
    }
  }

  // Delete notification
  static deleteNotification(notificationId, userId) {
    try {
      logger.logDBOperation('DELETE', 'notifications', { notificationId, userId });

      const stmt = db.prepare(`
        DELETE FROM notifications 
        WHERE id = ? AND user_id = ?
      `);
      
      const result = stmt.run(notificationId, userId);

      if (result.changes === 0) {
        return {
          success: false,
          message: 'Notification not found or you do not have permission to delete it'
        };
      }

      return {
        success: true,
        message: 'Notification deleted successfully'
      };
    } catch (error) {
      logger.error('Error deleting notification:', error);
      throw new Error('Failed to delete notification');
    }
  }

  // Delete all notifications for a user
  static deleteAllNotifications(userId) {
    try {
      logger.logDBOperation('DELETE', 'notifications', { userId });

      const stmt = db.prepare('DELETE FROM notifications WHERE user_id = ?');
      const result = stmt.run(userId);

      return {
        success: true,
        message: `Deleted ${result.changes} notifications`
      };
    } catch (error) {
      logger.error('Error deleting all notifications:', error);
      throw new Error('Failed to delete all notifications');
    }
  }

  // Get notification by ID
  static getNotificationById(notificationId, userId) {
    try {
      logger.logDBOperation('SELECT', 'notifications', { notificationId, userId });

      const notification = db.prepare(`
        SELECT 
          n.id,
          n.type,
          n.message,
          n.is_read,
          n.related_id,
          n.created_at
        FROM notifications n
        WHERE n.id = ? AND n.user_id = ?
      `).get(notificationId, userId);

      if (!notification) {
        return {
          success: false,
          message: 'Notification not found'
        };
      }

      return {
        success: true,
        notification
      };
    } catch (error) {
      logger.error('Error fetching notification by ID:', error);
      throw new Error('Failed to fetch notification');
    }
  }

  // Get notification statistics for a user
  static getUserNotificationStats(userId) {
    try {
      logger.logDBOperation('SELECT', 'notifications', { userId });

      const stats = db.prepare(`
        SELECT 
          COUNT(*) as total_notifications,
          COUNT(CASE WHEN is_read = FALSE THEN 1 END) as unread_notifications,
          COUNT(CASE WHEN is_read = TRUE THEN 1 END) as read_notifications,
          COUNT(CASE WHEN type = 'answer' THEN 1 END) as answer_notifications,
          COUNT(CASE WHEN type = 'comment' THEN 1 END) as comment_notifications,
          COUNT(CASE WHEN type = 'mention' THEN 1 END) as mention_notifications,
          COUNT(CASE WHEN type = 'vote' THEN 1 END) as vote_notifications
        FROM notifications
        WHERE user_id = ?
      `).get(userId);

      return {
        success: true,
        stats
      };
    } catch (error) {
      logger.error('Error fetching notification stats:', error);
      throw new Error('Failed to fetch notification statistics');
    }
  }

  // Clean up old notifications (admin utility)
  static cleanupOldNotifications(daysOld = 30) {
    try {
      logger.logDBOperation('DELETE', 'notifications', { daysOld });

      const stmt = db.prepare(`
        DELETE FROM notifications 
        WHERE created_at < datetime('now', '-${daysOld} days')
      `);
      
      const result = stmt.run();

      return {
        success: true,
        message: `Cleaned up ${result.changes} old notifications (older than ${daysOld} days)`
      };
    } catch (error) {
      logger.error('Error cleaning up old notifications:', error);
      throw new Error('Failed to cleanup old notifications');
    }
  }

  // Create answer notification (called by AnswerService)
  static createAnswerNotification(questionId, answerUserId, answerId) {
    try {
      // Get question author
      const question = db.prepare('SELECT user_id FROM questions WHERE id = ?').get(questionId);
      
      if (question && question.user_id !== answerUserId) {
        // Don't notify if user is answering their own question
        const answerUser = db.prepare('SELECT username FROM users WHERE id = ?').get(answerUserId);
        
        if (answerUser) {
          const message = `${answerUser.username} answered your question`;
          
          this.createNotification({
            userId: question.user_id,
            type: 'answer',
            message,
            relatedId: answerId
          });
          
          logger.info('Answer notification created', { questionId, answerUserId, answerId });
        }
      }
    } catch (error) {
      logger.error('Error creating answer notification:', error);
      // Don't throw error as this is not critical
    }
  }

  // Create vote notification (called by VoteService)
  static createVoteNotification(contentOwnerId, voterId, targetId, targetType) {
    try {
      // Don't create notification if user is voting on their own content
      if (contentOwnerId === voterId) {
        return;
      }

      const voter = db.prepare('SELECT username FROM users WHERE id = ?').get(voterId);
      
      if (voter) {
        const message = `${voter.username} upvoted your ${targetType}`;
        
        this.createNotification({
          userId: contentOwnerId,
          type: 'vote',
          message,
          relatedId: targetId
        });
        
        logger.info('Vote notification created', { contentOwnerId, voterId, targetId, targetType });
      }
    } catch (error) {
      logger.error('Error creating vote notification:', error);
      // Don't throw error as this is not critical
    }
  }

  // Create mention notification (for future @username mentions)
  static createMentionNotification(mentionedUserId, mentionerUserId, contentId, contentType) {
    try {
      // Don't create notification if user mentions themselves
      if (mentionedUserId === mentionerUserId) {
        return;
      }

      const mentioner = db.prepare('SELECT username FROM users WHERE id = ?').get(mentionerUserId);
      
      if (mentioner) {
        const message = `${mentioner.username} mentioned you in a ${contentType}`;
        
        this.createNotification({
          userId: mentionedUserId,
          type: 'mention',
          message,
          relatedId: contentId
        });
        
        logger.info('Mention notification created', { mentionedUserId, mentionerUserId, contentId, contentType });
      }
    } catch (error) {
      logger.error('Error creating mention notification:', error);
      // Don't throw error as this is not critical
    }
  }
}

module.exports = NotificationService; 