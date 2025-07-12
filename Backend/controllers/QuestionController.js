const QuestionService = require('../services/QuestionService');
const ValidationMiddleware = require('../middleware/validation');
const logger = require('../utils/logger');

class QuestionController {
  static async listQuestions(req, res) {
    try {
      const { page = 1, limit = 10 } = req.pagination || {};
      const { sortBy, sortOrder, tag, search, userId } = req.query;
      const result = QuestionService.getAllQuestions({
        limit,
        offset: (page - 1) * limit,
        sortBy,
        sortOrder,
        tagFilter: tag,
        search,
        userId: userId ? parseInt(userId, 10) : null
      });
      return res.json(result);
    } catch (error) {
      logger.error('QuestionController.listQuestions error', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch questions' });
    }
  }

  static async getQuestionById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user ? req.user.id : null;
      const result = QuestionService.getQuestionById(parseInt(id, 10), userId);
      if (!result.success) return res.status(404).json(result);
      return res.json(result);
    } catch (error) {
      logger.error('QuestionController.getQuestionById error', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch question' });
    }
  }

  static async createQuestion(req, res) {
    try {
      const userId = req.user.id;
      const result = QuestionService.createQuestion(req.body, userId);
      if (!result.success) return res.status(400).json(result);
      return res.status(201).json(result);
    } catch (error) {
      logger.error('QuestionController.createQuestion error', error);
      return res.status(500).json({ success: false, message: 'Failed to create question' });
    }
  }

  static async updateQuestion(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const result = QuestionService.updateQuestion(parseInt(id, 10), req.body, userId);
      if (!result.success) return res.status(400).json(result);
      return res.json(result);
    } catch (error) {
      logger.error('QuestionController.updateQuestion error', error);
      return res.status(500).json({ success: false, message: 'Failed to update question' });
    }
  }

  static async deleteQuestion(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;
      const result = QuestionService.deleteQuestion(parseInt(id, 10), userId, userRole);
      if (!result.success) return res.status(400).json(result);
      return res.json(result);
    } catch (error) {
      logger.error('QuestionController.deleteQuestion error', error);
      return res.status(500).json({ success: false, message: 'Failed to delete question' });
    }
  }

  static async acceptAnswer(req, res) {
    try {
      const { id } = req.params; // questionId
      const { answerId } = req.body;
      const userId = req.user.id;
      const result = QuestionService.acceptAnswer(parseInt(id, 10), answerId, userId);
      if (!result.success) return res.status(400).json(result);
      return res.json(result);
    } catch (error) {
      logger.error('QuestionController.acceptAnswer error', error);
      return res.status(500).json({ success: false, message: 'Failed to accept answer' });
    }
  }
}

module.exports = QuestionController; 