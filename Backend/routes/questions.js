const express = require('express');
const QuestionController = require('../controllers/QuestionController');
const AuthMiddleware = require('../middleware/auth');
const ValidationMiddleware = require('../middleware/validation');

const router = express.Router();

// List questions
router.get('/', AuthMiddleware.optionalAuth, ValidationMiddleware.validatePagination, QuestionController.listQuestions);

// Get question by ID
router.get('/:id', AuthMiddleware.optionalAuth, QuestionController.getQuestionById);

// Create question
router.post('/', AuthMiddleware.authenticate, ValidationMiddleware.validateQuestion, QuestionController.createQuestion);

// Update question
router.put('/:id', AuthMiddleware.authenticate, AuthMiddleware.checkOwnership('question'), ValidationMiddleware.validateQuestion, QuestionController.updateQuestion);

// Delete question
router.delete('/:id', AuthMiddleware.authenticate, AuthMiddleware.checkOwnership('question'), QuestionController.deleteQuestion);

// Accept answer for question
router.post('/:id/accept', AuthMiddleware.authenticate, QuestionController.acceptAnswer);

module.exports = router; 