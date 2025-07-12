const NotificationService = require('../services/NotificationService');
const logger = require('../utils/logger');

class NotificationController {
  static async listNotifications(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.pagination || {};
      const { unreadOnly, type } = req.query;
      const result = NotificationService.getUserNotifications(userId, {
        limit,
        offset: (page - 1) * limit,
        unreadOnly: unreadOnly === 'true',
        type
      });
      return res.json(result);
    } catch (error) {
      logger.error('NotificationController.listNotifications error', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
    }
  }

  static async getUnreadCount(req, res) {
    try {
      const userId = req.user.id;
      const result = NotificationService.getUnreadCount(userId);
      return res.json(result);
    } catch (error) {
      logger.error('NotificationController.getUnreadCount error', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch unread count' });
    }
  }

  static async markAsRead(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const result = NotificationService.markAsRead(parseInt(id, 10), userId);
      if (!result.success) return res.status(400).json(result);
      return res.json(result);
    } catch (error) {
      logger.error('NotificationController.markAsRead error', error);
      return res.status(500).json({ success: false, message: 'Failed to mark notification as read' });
    }
  }

  static async markAllAsRead(req, res) {
    try {
      const userId = req.user.id;
      const result = NotificationService.markAllAsRead(userId);
      return res.json(result);
    } catch (error) {
      logger.error('NotificationController.markAllAsRead error', error);
      return res.status(500).json({ success: false, message: 'Failed to mark all as read' });
    }
  }

  static async deleteNotification(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const result = NotificationService.deleteNotification(parseInt(id, 10), userId);
      if (!result.success) return res.status(400).json(result);
      return res.json(result);
    } catch (error) {
      logger.error('NotificationController.deleteNotification error', error);
      return res.status(500).json({ success: false, message: 'Failed to delete notification' });
    }
  }

  static async deleteAllNotifications(req, res) {
    try {
      const userId = req.user.id;
      const result = NotificationService.deleteAllNotifications(userId);
      return res.json(result);
    } catch (error) {
      logger.error('NotificationController.deleteAllNotifications error', error);
      return res.status(500).json({ success: false, message: 'Failed to delete notifications' });
    }
  }
}

module.exports = NotificationController; 