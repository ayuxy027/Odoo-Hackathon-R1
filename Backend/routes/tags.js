const express = require('express');
const TagController = require('../controllers/TagController');
const AuthMiddleware = require('../middleware/auth');
const ValidationMiddleware = require('../middleware/validation');

const router = express.Router();

// List tags with search & pagination
router.get('/', AuthMiddleware.optionalAuth, ValidationMiddleware.validatePagination, TagController.listTags);

// Get tag by ID
router.get('/:id', AuthMiddleware.optionalAuth, TagController.getTagById);

// Create tag (admin only)
router.post('/', AuthMiddleware.authenticate, AuthMiddleware.requireRole('admin'), TagController.createTag);

// Update tag (admin only)
router.put('/:id', AuthMiddleware.authenticate, AuthMiddleware.requireRole('admin'), TagController.updateTag);

// Delete tag (admin only)
router.delete('/:id', AuthMiddleware.authenticate, AuthMiddleware.requireRole('admin'), TagController.deleteTag);

module.exports = router; 