const logger = require('../utils/logger');

class ValidationMiddleware {
  // Generic validation function
  static validate(schema) {
    return (req, res, next) => {
      try {
        const { error } = schema.validate(req.body);
        
        if (error) {
          const errorDetails = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }));

          logger.warn('Validation failed', { errors: errorDetails, body: req.body });
          
          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errorDetails
          });
        }

        next();
      } catch (validationError) {
        logger.error('Validation middleware error:', validationError);
        return res.status(500).json({
          success: false,
          message: 'Validation error'
        });
      }
    };
  }

  // Question validation
  static validateQuestion(req, res, next) {
    try {
      const { title, description, tags } = req.body;
      const errors = [];

      if (!title || title.trim().length === 0) {
        errors.push({ field: 'title', message: 'Title is required' });
      } else if (title.length > 200) {
        errors.push({ field: 'title', message: 'Title must be less than 200 characters' });
      }

      if (!description || description.trim().length === 0) {
        errors.push({ field: 'description', message: 'Description is required' });
      } else if (description.length > 5000) {
        errors.push({ field: 'description', message: 'Description must be less than 5000 characters' });
      }

      if (tags) {
        if (!Array.isArray(tags)) {
          errors.push({ field: 'tags', message: 'Tags must be an array' });
        } else if (tags.length > 10) {
          errors.push({ field: 'tags', message: 'Maximum 10 tags allowed' });
        } else {
          tags.forEach((tag, index) => {
            if (typeof tag !== 'string' || tag.trim().length === 0) {
              errors.push({ field: `tags[${index}]`, message: 'Tag must be a non-empty string' });
            } else if (tag.length > 50) {
              errors.push({ field: `tags[${index}]`, message: 'Tag must be less than 50 characters' });
            }
          });
        }
      }

      if (errors.length > 0) {
        logger.warn('Question validation failed', { errors, body: req.body });
        return res.status(400).json({
          success: false,
          message: 'Question validation failed',
          errors
        });
      }

      next();
    } catch (error) {
      logger.error('Question validation middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Question validation error'
      });
    }
  }

  // Answer validation
  static validateAnswer(req, res, next) {
    try {
      const { content } = req.body;
      const errors = [];

      if (!content || content.trim().length === 0) {
        errors.push({ field: 'content', message: 'Answer content is required' });
      } else if (content.length > 10000) {
        errors.push({ field: 'content', message: 'Answer content must be less than 10000 characters' });
      }

      if (errors.length > 0) {
        logger.warn('Answer validation failed', { errors, body: req.body });
        return res.status(400).json({
          success: false,
          message: 'Answer validation failed',
          errors
        });
      }

      next();
    } catch (error) {
      logger.error('Answer validation middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Answer validation error'
      });
    }
  }

  // Vote validation
  static validateVote(req, res, next) {
    try {
      const { voteType } = req.body;
      const errors = [];

      if (!voteType || !['upvote', 'downvote'].includes(voteType)) {
        errors.push({ field: 'voteType', message: 'Vote type must be either "upvote" or "downvote"' });
      }

      if (errors.length > 0) {
        logger.warn('Vote validation failed', { errors, body: req.body });
        return res.status(400).json({
          success: false,
          message: 'Vote validation failed',
          errors
        });
      }

      next();
    } catch (error) {
      logger.error('Vote validation middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Vote validation error'
      });
    }
  }

  // Pagination validation
  static validatePagination(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      
      if (isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json({
          success: false,
          message: 'Page must be a positive integer'
        });
      }
      
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        return res.status(400).json({
          success: false,
          message: 'Limit must be between 1 and 100'
        });
      }

      req.pagination = {
        page: pageNum,
        limit: limitNum,
        offset: (pageNum - 1) * limitNum
      };

      next();
    } catch (error) {
      logger.error('Pagination validation middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Pagination validation error'
      });
    }
  }
}

module.exports = ValidationMiddleware; 