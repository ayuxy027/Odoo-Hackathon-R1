const express = require('express');
const NotificationController = require('../controllers/NotificationController');
const AuthMiddleware = require('../middleware/auth');
const ValidationMiddleware = require('../middleware/validation');

const router = express.Router();

// List notifications
router.get('/', AuthMiddleware.authenticate, ValidationMiddleware.validatePagination, NotificationController.listNotifications);

// Get unread count
router.get('/unread-count', AuthMiddleware.authenticate, NotificationController.getUnreadCount);

// Mark notification as read
router.post('/:id/read', AuthMiddleware.authenticate, NotificationController.markAsRead);

// Mark all as read
router.post('/read-all', AuthMiddleware.authenticate, NotificationController.markAllAsRead);

// Delete notification
router.delete('/:id', AuthMiddleware.authenticate, NotificationController.deleteNotification);

// Delete all
router.delete('/', AuthMiddleware.authenticate, NotificationController.deleteAllNotifications);

module.exports = router; 