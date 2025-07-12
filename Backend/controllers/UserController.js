const UserService = require('../services/UserService');
const logger = require('../utils/logger');

class UserController {
  static async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 10 } = req.pagination || {};
      const result = UserService.getAllUsers({ limit, offset: (page - 1) * limit });
      return res.json(result);
    } catch (error) {
      logger.error('UserController.getAllUsers error', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
  }

  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      const result = UserService.getUserById(parseInt(id, 10));
      if (!result.success) {
        return res.status(404).json(result);
      }
      return res.json(result);
    } catch (error) {
      logger.error('UserController.getUserById error', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch user' });
    }
  }

  static async getUserStats(req, res) {
    try {
      const userId = parseInt(req.params.id, 10);
      const result = UserService.getUserStats(userId);
      return res.json(result);
    } catch (error) {
      logger.error('UserController.getUserStats error', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch user stats' });
    }
  }

  static async createUser(req, res) {
    try {
      const result = UserService.createUser(req.body);
      if (!result.success) return res.status(400).json(result);
      return res.status(201).json(result);
    } catch (error) {
      logger.error('UserController.createUser error', error);
      return res.status(500).json({ success: false, message: 'Failed to create user' });
    }
  }

  static async updateUserRole(req, res) {
    try {
      const userId = parseInt(req.params.id, 10);
      const { role } = req.body;
      const result = UserService.updateUserRole(userId, role);
      if (!result.success) return res.status(400).json(result);
      return res.json(result);
    } catch (error) {
      logger.error('UserController.updateUserRole error', error);
      return res.status(500).json({ success: false, message: 'Failed to update user role' });
    }
  }
}

module.exports = UserController; 