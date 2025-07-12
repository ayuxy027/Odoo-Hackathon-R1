import React, { useState, useEffect } from 'react';
import { questionService, Question } from '../services/questionService';

interface Props {
  navigate: (screen: 'home' | 'ask' | 'questionDetail') => void;
  selectQuestion: (id: number) => void;
}

const Home: React.FC<Props> = ({ navigate, selectQuestion }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await questionService.getQuestions({
        limit: 10,
        sortBy: 'votes',
        sortOrder: 'desc'
      });
      setQuestions(response.questions);
    } catch (err) {
      setError('Failed to load questions. Please try again.');
      console.error('Error loading questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionClick = (questionId: number) => {
    selectQuestion(questionId);
    navigate('questionDetail');
  };

  const getTagColor = (tag: string): string => {
    const colors: Record<string, string> = {
      react: 'bg-blue-100 text-blue-800',
      typescript: 'bg-blue-100 text-blue-800',
      javascript: 'bg-yellow-100 text-yellow-800',
      css: 'bg-pink-100 text-pink-800',
      html: 'bg-orange-100 text-orange-800',
      python: 'bg-green-100 text-green-800',
      postgresql: 'bg-indigo-100 text-indigo-800',
      database: 'bg-purple-100 text-purple-800',
      api: 'bg-red-100 text-red-800',
    };
    return colors[tag] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days} days ago`;
    if (hours > 0) return `${hours} hours ago`;
    if (minutes > 0) return `${minutes} minutes ago`;
    return 'Just now';
  };

  const parseTagsString = (tagsString: string): string[] => {
    if (!tagsString) return [];
    return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-center items-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-red-800 font-semibold mb-2">Error Loading Questions</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadQuestions}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Top Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Top Questions</h1>
          <p className="text-gray-600 mt-1">Browse the most popular questions in our community</p>
        </div>
        <button
          onClick={() => navigate('ask')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Ask Question
        </button>
      </div>

      {/* Questions List */}
      {questions.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">No questions yet</h2>
          <p className="text-gray-600 mb-6">Be the first to ask a question!</p>
          <button
            onClick={() => navigate('ask')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Ask the First Question
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <div
              key={question.id}
              onClick={() => handleQuestionClick(question.id)}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              {/* Title and Accepted Icon */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                      {question.title}
                    </h2>
                    {question.accepted_answer_id && (
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <p className="text-gray-600 mb-3 line-clamp-2">{question.description}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {parseTagsString(question.tags).map((tag, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getTagColor(tag)}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Meta Data */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-6">
                  <span>{question.votes} votes</span>
                  <span>{question.answer_count} answers</span>
                  <span>{question.view_count} views</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>asked by</span>
                  <span className="font-medium text-blue-600">{question.author}</span>
                  <span>•</span>
                  <span>{formatDate(question.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More Button */}
      <div className="mt-8 text-center">
        <button
          onClick={loadQuestions}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Refresh Questions
        </button>
      </div>
    </div>
  );
};

export default Home;
