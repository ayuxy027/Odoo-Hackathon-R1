import api from '../lib/api';

export interface Answer {
  id: number;
  content: string;
  votes: number;
  is_accepted: boolean;
  created_at: string;
  updated_at: string;
  user_id: number;
  author: string;
  author_role: string;
  userVote?: 'upvote' | 'downvote' | null;
}

export interface AnswerResponse {
  success: boolean;
  answers: Answer[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface CreateAnswerData {
  questionId: number;
  content: string;
}

export const answerService = {
  // Get answers for a question
  async getAnswersForQuestion(questionId: number, params: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  } = {}): Promise<AnswerResponse> {
    const response = await api.get(`/answers/question/${questionId}`, { params });
    return response.data;
  },

  // Get answer by ID
  async getAnswerById(id: number): Promise<{ success: boolean; answer: Answer }> {
    const response = await api.get(`/answers/${id}`);
    return response.data;
  },

  // Create answer
  async createAnswer(data: CreateAnswerData): Promise<{ success: boolean; answerId: number }> {
    const response = await api.post('/answers', data);
    return response.data;
  },

  // Update answer
  async updateAnswer(id: number, content: string): Promise<{ success: boolean }> {
    const response = await api.put(`/answers/${id}`, { content });
    return response.data;
  },

  // Delete answer
  async deleteAnswer(id: number): Promise<{ success: boolean }> {
    const response = await api.delete(`/answers/${id}`);
    return response.data;
  }
}; 