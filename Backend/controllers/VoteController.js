const VoteService = require('../services/VoteService');
const logger = require('../utils/logger');

class VoteController {
  static async castVote(req, res) {
    try {
      const userId = req.user.id;
      const { targetId, targetType, voteType } = req.body;
      const result = VoteService.castVote(userId, targetId, targetType, voteType);
      if (!result.success) return res.status(400).json(result);
      return res.json(result);
    } catch (error) {
      logger.error('VoteController.castVote error', error);
      return res.status(500).json({ success: false, message: 'Failed to cast vote' });
    }
  }

  static async getUserVotes(req, res) {
    try {
      const userId = req.user.id;
      const targets = req.body.targets || [];
      const result = VoteService.getUserVotes(userId, targets);
      return res.json(result);
    } catch (error) {
      logger.error('VoteController.getUserVotes error', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch votes' });
    }
  }

  static async getUserVoteStats(req, res) {
    try {
      const userId = req.user.id;
      const result = VoteService.getUserVoteStats(userId);
      return res.json(result);
    } catch (error) {
      logger.error('VoteController.getUserVoteStats error', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch vote stats' });
    }
  }
}

module.exports = VoteController; 