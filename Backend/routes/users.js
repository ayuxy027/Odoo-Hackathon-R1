const express = require('express');
const UserController = require('../controllers/UserController');
const AuthMiddleware = require('../middleware/auth');
const ValidationMiddleware = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', AuthMiddleware.optionalAuth, ValidationMiddleware.validatePagination, UserController.getAllUsers);
router.get('/:id', AuthMiddleware.optionalAuth, UserController.getUserById);

// Authenticated routes
router.get('/:id/stats', AuthMiddleware.authenticate, UserController.getUserStats);

// Registration route (open)
router.post('/', UserController.createUser);

// Admin route to update user role
router.put('/:id/role', AuthMiddleware.authenticate, AuthMiddleware.requireRole('admin'), UserController.updateUserRole);

module.exports = router;
