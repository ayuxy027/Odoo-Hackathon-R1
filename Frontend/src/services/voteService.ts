import api from '../lib/api';

export interface VoteData {
  targetId: number;
  targetType: 'question' | 'answer';
  voteType: 'upvote' | 'downvote';
}

export const voteService = {
  // Cast vote
  async castVote(data: VoteData): Promise<{ 
    success: boolean; 
    message: string;
    voteChange: number;
    action: string;
  }> {
    const response = await api.post('/votes', data);
    return response.data;
  },

  // Get user vote stats
  async getUserVoteStats(): Promise<{ 
    success: boolean; 
    stats: {
      total_votes: number;
      upvotes: number;
      downvotes: number;
      question_votes: number;
      answer_votes: number;
    }
  }> {
    const response = await api.get('/votes/stats');
    return response.data;
  }
}; 