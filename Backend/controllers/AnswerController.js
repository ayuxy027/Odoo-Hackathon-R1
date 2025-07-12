const AnswerService = require('../services/AnswerService');
const logger = require('../utils/logger');

class AnswerController {
  static async listAnswersForQuestion(req, res) {
    try {
      const { questionId } = req.params;
      const { page = 1, limit = 10 } = req.pagination || {};
      const { sortBy, sortOrder } = req.query;
      const userId = req.user ? req.user.id : null;
      const result = AnswerService.getAnswersByQuestionId(parseInt(questionId, 10), {
        limit,
        offset: (page - 1) * limit,
        sortBy,
        sortOrder,
        userId
      });
      return res.json(result);
    } catch (error) {
      logger.error('AnswerController.listAnswersForQuestion error', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch answers' });
    }
  }

  static async getAnswerById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user ? req.user.id : null;
      const result = AnswerService.getAnswerById(parseInt(id, 10), userId);
      if (!result.success) return res.status(404).json(result);
      return res.json(result);
    } catch (error) {
      logger.error('AnswerController.getAnswerById error', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch answer' });
    }
  }

  static async createAnswer(req, res) {
    try {
      const userId = req.user.id;
      const result = AnswerService.createAnswer(req.body, userId);
      if (!result.success) return res.status(400).json(result);
      return res.status(201).json(result);
    } catch (error) {
      logger.error('AnswerController.createAnswer error', error);
      return res.status(500).json({ success: false, message: 'Failed to create answer' });
    }
  }

  static async updateAnswer(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const result = AnswerService.updateAnswer(parseInt(id, 10), req.body, userId);
      if (!result.success) return res.status(400).json(result);
      return res.json(result);
    } catch (error) {
      logger.error('AnswerController.updateAnswer error', error);
      return res.status(500).json({ success: false, message: 'Failed to update answer' });
    }
  }

  static async deleteAnswer(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;
      const result = AnswerService.deleteAnswer(parseInt(id, 10), userId, userRole);
      if (!result.success) return res.status(400).json(result);
      return res.json(result);
    } catch (error) {
      logger.error('AnswerController.deleteAnswer error', error);
      return res.status(500).json({ success: false, message: 'Failed to delete answer' });
    }
  }
}

module.exports = AnswerController; 