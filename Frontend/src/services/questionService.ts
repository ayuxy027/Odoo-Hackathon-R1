import api from '../lib/api';

export interface Question {
  id: number;
  title: string;
  description: string;
  votes: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  accepted_answer_id: number | null;
  author: string;
  author_role: string;
  answer_count: number;
  tags: string;
  userVote?: 'upvote' | 'downvote' | null;
}

export interface QuestionResponse {
  success: boolean;
  questions: Question[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface CreateQuestionData {
  title: string;
  description: string;
  tags: string[];
}

export const questionService = {
  // Get all questions
  async getQuestions(params: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
    tag?: string;
    search?: string;
    userId?: number;
  } = {}): Promise<QuestionResponse> {
    const response = await api.get('/questions', { params });
    return response.data;
  },

  // Get question by ID
  async getQuestionById(id: number): Promise<{ success: boolean; question: Question }> {
    const response = await api.get(`/questions/${id}`);
    return response.data;
  },

  // Create question
  async createQuestion(data: CreateQuestionData): Promise<{ success: boolean; questionId: number }> {
    const response = await api.post('/questions', data);
    return response.data;
  },

  // Update question
  async updateQuestion(id: number, data: CreateQuestionData): Promise<{ success: boolean }> {
    const response = await api.put(`/questions/${id}`, data);
    return response.data;
  },

  // Delete question
  async deleteQuestion(id: number): Promise<{ success: boolean }> {
    const response = await api.delete(`/questions/${id}`);
    return response.data;
  },

  // Accept answer
  async acceptAnswer(questionId: number, answerId: number): Promise<{ success: boolean }> {
    const response = await api.post(`/questions/${questionId}/accept`, { answerId });
    return response.data;
  }
}; 