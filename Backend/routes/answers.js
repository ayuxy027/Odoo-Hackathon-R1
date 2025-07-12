const express = require('express');
const AnswerController = require('../controllers/AnswerController');
const AuthMiddleware = require('../middleware/auth');
const ValidationMiddleware = require('../middleware/validation');

const router = express.Router();

// List answers for a question
router.get('/question/:questionId', AuthMiddleware.optionalAuth, ValidationMiddleware.validatePagination, AnswerController.listAnswersForQuestion);

// Get answer by ID
router.get('/:id', AuthMiddleware.optionalAuth, AnswerController.getAnswerById);

// Create answer
router.post('/', AuthMiddleware.authenticate, ValidationMiddleware.validateAnswer, AnswerController.createAnswer);

// Update answer
router.put('/:id', AuthMiddleware.authenticate, AuthMiddleware.checkOwnership('answer'), ValidationMiddleware.validateAnswer, AnswerController.updateAnswer);

// Delete answer
router.delete('/:id', AuthMiddleware.authenticate, AuthMiddleware.checkOwnership('answer'), AnswerController.deleteAnswer);

module.exports = router; 