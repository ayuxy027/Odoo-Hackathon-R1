const express = require('express');
const VoteController = require('../controllers/VoteController');
const AuthMiddleware = require('../middleware/auth');
const ValidationMiddleware = require('../middleware/validation');

const router = express.Router();

// Cast vote
router.post('/', AuthMiddleware.authenticate, ValidationMiddleware.validateVote, VoteController.castVote);

// Get votes for targets (bulk)
router.post('/bulk', AuthMiddleware.authenticate, VoteController.getUserVotes);

// Get user vote stats
router.get('/stats', AuthMiddleware.authenticate, VoteController.getUserVoteStats);

module.exports = router; 