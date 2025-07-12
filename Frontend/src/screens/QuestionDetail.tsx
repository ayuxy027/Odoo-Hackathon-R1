import React, { useState, useEffect } from 'react';
import { questionService, Question } from '../services/questionService';
import { answerService, Answer } from '../services/answerService';
import { voteService } from '../services/voteService';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  questionId: number;
  navigate: (screen: 'home' | 'ask' | 'questionDetail') => void;
}

interface VoteState {
  questionVote: 'up' | 'down' | null;
  answerVotes: { [key: number]: 'up' | 'down' | null };
}

const QuestionDetail: React.FC<Props> = ({ questionId, navigate }) => {
  const { user, isAuthenticated } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newAnswer, setNewAnswer] = useState('');
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [voteState, setVoteState] = useState<VoteState>({
    questionVote: null,
    answerVotes: {}
  });

  useEffect(() => {
    loadQuestionAndAnswers();
  }, [questionId]);

  const loadQuestionAndAnswers = async () => {
    try {
      setLoading(true);
      setError(null);

      const [questionResponse, answersResponse] = await Promise.all([
        questionService.getQuestionById(questionId),
        answerService.getAnswersForQuestion(questionId, {
          sortBy: 'votes',
          sortOrder: 'desc'
        })
      ]);

      if (questionResponse.success) {
        setCurrentQuestion(questionResponse.question);
        setVoteState(prev => ({
          ...prev,
          questionVote: questionResponse.question.userVote === 'upvote' ? 'up' :
            questionResponse.question.userVote === 'downvote' ? 'down' : null
        }));
      }

      if (answersResponse.success) {
        setAnswers(answersResponse.answers);
        // Initialize vote states for answers
        const answerVotes: { [key: number]: 'up' | 'down' | null } = {};
        answersResponse.answers.forEach(answer => {
          answerVotes[answer.id] = answer.userVote === 'upvote' ? 'up' :
            answer.userVote === 'downvote' ? 'down' : null;
        });
        setVoteState(prev => ({ ...prev, answerVotes }));
      }
    } catch (err) {
      setError('Failed to load question and answers. Please try again.');
      console.error('Error loading question:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!isAuthenticated) {
      alert('Please login to submit an answer');
      return;
    }

    if (!newAnswer.trim()) {
      alert('Please enter an answer before submitting.');
      return;
    }

    setSubmittingAnswer(true);
    try {
      const result = await answerService.createAnswer({
        questionId,
        content: newAnswer.trim()
      });

      if (result.success) {
        setNewAnswer('');
        setShowAnswerForm(false);
        loadQuestionAndAnswers(); // Reload to show new answer

        // Show success message
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        successDiv.innerHTML = '✓ Answer submitted successfully!';
        document.body.appendChild(successDiv);
        setTimeout(() => document.body.removeChild(successDiv), 3000);
      } else {
        alert('Failed to submit answer. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      alert('Failed to submit answer. Please try again.');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleVote = async (type: 'question' | 'answer', id: number, voteType: 'up' | 'down') => {
    if (!isAuthenticated) {
      alert('Please login to vote');
      return;
    }

    try {
      const result = await voteService.castVote({
        targetId: id,
        targetType: type,
        voteType: voteType === 'up' ? 'upvote' : 'downvote'
      });

      if (result.success) {
        // Update local state based on vote result
        if (type === 'question') {
          const currentVote = voteState.questionVote;
          let newVote: 'up' | 'down' | null = voteType;

          if (currentVote === voteType) {
            newVote = null; // Remove vote if clicking same vote
          }

          setVoteState(prev => ({ ...prev, questionVote: newVote }));

          // Update question vote count
          setCurrentQuestion(prev => {
            if (!prev) return prev;
            let newVoteCount = prev.votes + result.voteChange;
            return { ...prev, votes: newVoteCount };
          });
        } else {
          const currentVote = voteState.answerVotes[id];
          let newVote: 'up' | 'down' | null = voteType;

          if (currentVote === voteType) {
            newVote = null; // Remove vote if clicking same vote
          }

          setVoteState(prev => ({
            ...prev,
            answerVotes: { ...prev.answerVotes, [id]: newVote }
          }));

          // Update answer vote count
          setAnswers(prev => prev.map(answer =>
            answer.id === id ? { ...answer, votes: answer.votes + result.voteChange } : answer
          ));
        }
      }
    } catch (err) {
      console.error('Error voting:', err);
      alert('Failed to vote. Please try again.');
    }
  };

  const getTagColor = (tag: string): string => {
    const colors = {
      'react': 'bg-blue-100 text-blue-800',
      'typescript': 'bg-blue-100 text-blue-800',
      'javascript': 'bg-yellow-100 text-yellow-800',
      'css': 'bg-pink-100 text-pink-800',
      'html': 'bg-orange-100 text-orange-800',
      'python': 'bg-green-100 text-green-800',
      'postgresql': 'bg-indigo-100 text-indigo-800',
      'database': 'bg-purple-100 text-purple-800',
      'api': 'bg-red-100 text-red-800',
      'hooks': 'bg-cyan-100 text-cyan-800',
      'layout': 'bg-teal-100 text-teal-800',
      'grid': 'bg-emerald-100 text-emerald-800',
      'flexbox': 'bg-lime-100 text-lime-800',
      'performance': 'bg-amber-100 text-amber-800',
      'optimization': 'bg-rose-100 text-rose-800',
      'error-handling': 'bg-violet-100 text-violet-800',
      'best-practices': 'bg-slate-100 text-slate-800',
      'default': 'bg-gray-100 text-gray-800'
    };
    return colors[tag as keyof typeof colors] || colors.default;
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

  if (error || !currentQuestion) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error ? 'Error Loading Question' : 'Question Not Found'}
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "The question you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => navigate('home')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('home')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 font-medium transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Questions
      </button>

      {/* Question */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex gap-6">
          {/* Question Vote Controls */}
          <div className="flex flex-col items-center space-y-2">
            <button
              onClick={() => handleVote('question', currentQuestion.id, 'up')}
              className={`p-2 rounded-full transition-colors ${voteState.questionVote === 'up'
                  ? 'bg-green-100 text-green-600'
                  : 'hover:bg-gray-100 text-gray-400'
                }`}
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <span className={`text-2xl font-bold ${voteState.questionVote === 'up' ? 'text-green-600' :
                voteState.questionVote === 'down' ? 'text-red-600' : 'text-gray-700'
              }`}>
              {currentQuestion.votes}
            </span>
            <button
              onClick={() => handleVote('question', currentQuestion.id, 'down')}
              className={`p-2 rounded-full transition-colors ${voteState.questionVote === 'down'
                  ? 'bg-red-100 text-red-600'
                  : 'hover:bg-gray-100 text-gray-400'
                }`}
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Question Content */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{currentQuestion.title}</h1>

            {/* Question Stats */}
            <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{currentQuestion.answer_count} answers</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{currentQuestion.view_count} views</span>
              </div>
            </div>

            {/* Question Content */}
            <div className="mb-6">
              <div className="prose max-w-none">
                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                  {currentQuestion.description}
                </p>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {parseTagsString(currentQuestion.tags).map((tag, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getTagColor(tag)}`}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Question Author */}
            <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <span>Asked by</span>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {currentQuestion.author[0].toUpperCase()}
                    </span>
                  </div>
                  <span className="font-medium text-blue-600">{currentQuestion.author}</span>
                </div>
                <span>•</span>
                <span>{formatDate(currentQuestion.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Answers Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {answers.length} Answer{answers.length !== 1 ? 's' : ''}
          </h2>
          <button
            onClick={() => setShowAnswerForm(!showAnswerForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {showAnswerForm ? 'Cancel' : 'Write Answer'}
          </button>
        </div>

        {/* Answer Form */}
        {showAnswerForm && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Your Answer</h3>
            {!isAuthenticated && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                <p className="text-yellow-800">Please login to submit an answer.</p>
              </div>
            )}
            <div className="mb-4">
              <textarea
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-vertical focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Write your answer here..."
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleSubmitAnswer}
                disabled={submittingAnswer || !isAuthenticated}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingAnswer ? 'Submitting...' : 'Submit Answer'}
              </button>
            </div>
          </div>
        )}

        {/* Answers List */}
        <div className="space-y-6">
          {answers.map((answer) => (
            <div
              key={answer.id}
              className={`bg-white border rounded-lg shadow-sm p-6 ${answer.is_accepted ? 'border-green-200 bg-green-50' : 'border-gray-200'
                }`}
            >
              {answer.is_accepted && (
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-green-600 font-medium">✨ Accepted Answer</span>
                </div>
              )}

              <div className="flex gap-4">
                {/* Answer Vote Controls */}
                <div className="flex flex-col items-center space-y-2">
                  <button
                    onClick={() => handleVote('answer', answer.id, 'up')}
                    className={`p-2 rounded-full transition-colors ${voteState.answerVotes[answer.id] === 'up'
                        ? 'bg-green-100 text-green-600'
                        : 'hover:bg-gray-100 text-gray-400'
                      }`}
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <span className={`text-lg font-bold ${voteState.answerVotes[answer.id] === 'up' ? 'text-green-600' :
                      voteState.answerVotes[answer.id] === 'down' ? 'text-red-600' : 'text-gray-700'
                    }`}>
                    {answer.votes}
                  </span>
                  <button
                    onClick={() => handleVote('answer', answer.id, 'down')}
                    className={`p-2 rounded-full transition-colors ${voteState.answerVotes[answer.id] === 'down'
                        ? 'bg-red-100 text-red-600'
                        : 'hover:bg-gray-100 text-gray-400'
                      }`}
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                {/* Answer Content */}
                <div className="flex-1">
                  <div className="prose max-w-none mb-6">
                    <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                      {answer.content}
                    </p>
                  </div>

                  {/* Answer Author */}
                  <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <span>Answered by</span>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {answer.author[0].toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-purple-600">{answer.author}</span>
                      </div>
                      <span>•</span>
                      <span>{formatDate(answer.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuestionDetail;