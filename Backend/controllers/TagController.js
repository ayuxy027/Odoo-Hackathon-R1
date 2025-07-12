const TagService = require('../services/TagService');
const logger = require('../utils/logger');

class TagController {
  static async listTags(req, res) {
    try {
      const { page = 1, limit = 20 } = req.pagination || {};
      const { sortBy, sortOrder, search } = req.query;
      const result = TagService.getAllTags({
        limit,
        offset: (page - 1) * limit,
        sortBy,
        sortOrder,
        search
      });
      return res.json(result);
    } catch (error) {
      logger.error('TagController.listTags error', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch tags' });
    }
  }

  static async getTagById(req, res) {
    try {
      const { id } = req.params;
      const result = TagService.getTagById(parseInt(id, 10));
      if (!result.success) return res.status(404).json(result);
      return res.json(result);
    } catch (error) {
      logger.error('TagController.getTagById error', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch tag' });
    }
  }

  static async createTag(req, res) {
    try {
      const result = TagService.createTag(req.body);
      if (!result.success) return res.status(400).json(result);
      return res.status(201).json(result);
    } catch (error) {
      logger.error('TagController.createTag error', error);
      return res.status(500).json({ success: false, message: 'Failed to create tag' });
    }
  }

  static async updateTag(req, res) {
    try {
      const { id } = req.params;
      const result = TagService.updateTag(parseInt(id, 10), req.body);
      if (!result.success) return res.status(400).json(result);
      return res.json(result);
    } catch (error) {
      logger.error('TagController.updateTag error', error);
      return res.status(500).json({ success: false, message: 'Failed to update tag' });
    }
  }

  static async deleteTag(req, res) {
    try {
      const { id } = req.params;
      const result = TagService.deleteTag(parseInt(id, 10));
      if (!result.success) return res.status(400).json(result);
      return res.json(result);
    } catch (error) {
      logger.error('TagController.deleteTag error', error);
      return res.status(500).json({ success: false, message: 'Failed to delete tag' });
    }
  }
}

module.exports = TagController; 