import React, { useState } from 'react';

interface Props {
  questionId: number;
  navigate: (screen: 'home' | 'ask' | 'questionDetail') => void;
}

interface VoteState {
  questionVote: 'up' | 'down' | null;
  answerVotes: { [key: number]: 'up' | 'down' | null };
}

interface Question {
  id: number;
  title: string;
  description: string;
  tags: string[];
  votes: number;
  answers: number;
  views: number;
  author: string;
  datePosted: string;
  fullContent: string;
}

interface Answer {
  id: number;
  content: string;
  author: string;
  votes: number;
  datePosted: string;
  isAccepted: boolean;
}

const QuestionDetail: React.FC<Props> = ({ questionId, navigate }) => {
  const [newAnswer, setNewAnswer] = useState('');
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [voteState, setVoteState] = useState<VoteState>({
    questionVote: null,
    answerVotes: {}
  });
  const [questionVotes, setQuestionVotes] = useState<{ [key: number]: number }>({});
  const [answerVoteCounts, setAnswerVoteCounts] = useState<{ [key: number]: number }>({});

  // Dummy question data - in a real app, this would come from an API or state management
  const dummyQuestions: Question[] = [
    {
      id: 1,
      title: "How to implement React hooks with TypeScript?",
      description: "I'm trying to use useState and useEffect with TypeScript but getting type errors. What's the best approach for typing these hooks?",
      tags: ["react", "typescript", "hooks"],
      votes: 15,
      answers: 3,
      views: 234,
      author: "dev_master",
      datePosted: "2 hours ago",
      fullContent: "I'm working on a React project with TypeScript and I'm having trouble with proper typing for hooks. Specifically, I'm getting errors when trying to use useState with complex objects and useEffect with async functions. Here's what I've tried so far:\n\n```typescript\nconst [user, setUser] = useState(null);\nconst [loading, setLoading] = useState(false);\n\nuseEffect(async () => {\n  const data = await fetchUser();\n  setUser(data);\n}, []);\n```\n\nThis gives me type errors and I'm not sure how to fix them properly. What's the correct way to handle this?"
    },
    {
      id: 2,
      title: "Best practices for API error handling in JavaScript",
      description: "What are some recommended patterns for handling API errors in modern JavaScript applications? Should I use try-catch or promise chains?",
      tags: ["javascript", "api", "error-handling", "best-practices"],
      votes: 8,
      answers: 2,
      views: 156,
      author: "code_ninja",
      datePosted: "5 hours ago",
      fullContent: "I'm building a JavaScript application that makes multiple API calls and I'm struggling with consistent error handling. I've seen different approaches like try-catch blocks, promise chains with .catch(), and even custom error handling middleware. What's the best approach for handling different types of errors (network errors, HTTP errors, validation errors) in a clean and maintainable way?"
    },
    {
      id: 3,
      title: "CSS Grid vs Flexbox: When to use which?",
      description: "I'm confused about when to use CSS Grid versus Flexbox for layout. Can someone explain the key differences and use cases?",
      tags: ["css", "layout", "grid", "flexbox"],
      votes: 22,
      answers: 5,
      views: 445,
      author: "frontend_guru",
      datePosted: "1 day ago",
      fullContent: "I keep hearing about CSS Grid and Flexbox but I'm not clear on when to use each one. They seem to overlap in functionality, and I often find myself choosing one arbitrarily. Can someone provide clear guidelines on:\n\n1. When to use CSS Grid vs Flexbox\n2. What are the strengths of each approach\n3. Are there cases where they work well together\n4. Performance considerations\n\nI'd appreciate some practical examples to illustrate the differences."
    },
    {
      id: 4,
      title: "PostgreSQL query optimization for large datasets",
      description: "My queries are running slow on tables with millions of rows. What indexing strategies and query patterns should I consider?",
      tags: ["postgresql", "database", "performance", "optimization"],
      votes: 31,
      answers: 7,
      views: 789,
      author: "db_wizard",
      datePosted: "3 days ago",
      fullContent: "I have a PostgreSQL database with several tables containing millions of rows. Some of my queries are taking 30+ seconds to complete, which is causing performance issues in my application. I've tried adding some basic indexes but I'm not seeing significant improvements. What are the best practices for:\n\n1. Choosing the right indexes\n2. Query optimization techniques\n3. Database design patterns for large datasets\n4. Monitoring and profiling tools\n\nAny specific PostgreSQL features I should be leveraging?"
    }
  ];

  // Dummy answers data
  const dummyAnswers: { [key: number]: Answer[] } = {
    1: [
      {
        id: 1,
        content: "You need to provide proper type annotations for your hooks. For useState with complex objects, you should define an interface and pass it as a generic type parameter:\n\n```typescript\ninterface User {\n  id: number;\n  name: string;\n  email: string;\n}\n\nconst [user, setUser] = useState<User | null>(null);\nconst [loading, setLoading] = useState<boolean>(false);\n```\n\nFor useEffect with async functions, you can't make the effect function itself async, but you can define an async function inside it:\n\n```typescript\nuseEffect(() => {\n  const fetchData = async () => {\n    setLoading(true);\n    try {\n      const data = await fetchUser();\n      setUser(data);\n    } catch (error) {\n      console.error('Error fetching user:', error);\n    } finally {\n      setLoading(false);\n    }\n  };\n  \n  fetchData();\n}, []);\n```",
        author: "typescript_pro",
        votes: 12,
        datePosted: "1 hour ago",
        isAccepted: true
      },
      {
        id: 2,
        content: "Another approach is to use custom hooks for better organization and reusability:\n\n```typescript\nconst useUser = () => {\n  const [user, setUser] = useState<User | null>(null);\n  const [loading, setLoading] = useState(false);\n  const [error, setError] = useState<string | null>(null);\n\n  const fetchUser = async () => {\n    setLoading(true);\n    setError(null);\n    try {\n      const data = await api.getUser();\n      setUser(data);\n    } catch (err) {\n      setError(err.message);\n    } finally {\n      setLoading(false);\n    }\n  };\n\n  return { user, loading, error, fetchUser };\n};\n```\n\nThis pattern makes your components cleaner and your logic more testable.",
        author: "react_expert",
        votes: 8,
        datePosted: "45 minutes ago",
        isAccepted: false
      },
      {
        id: 3,
        content: "Don't forget about the React.StrictMode implications! In development mode, effects run twice which can cause issues with async operations. Make sure to handle cleanup properly:\n\n```typescript\nuseEffect(() => {\n  let isMounted = true;\n  \n  const fetchData = async () => {\n    const data = await fetchUser();\n    if (isMounted) {\n      setUser(data);\n    }\n  };\n  \n  fetchData();\n  \n  return () => {\n    isMounted = false;\n  };\n}, []);\n```",
        author: "senior_dev",
        votes: 5,
        datePosted: "30 minutes ago",
        isAccepted: false
      }
    ],
    2: [
      {
        id: 1,
        content: "I recommend using a combination of try-catch blocks with custom error classes for different error types:\n\n```javascript\nclass APIError extends Error {\n  constructor(message, status, code) {\n    super(message);\n    this.name = 'APIError';\n    this.status = status;\n    this.code = code;\n  }\n}\n\nconst apiCall = async (url) => {\n  try {\n    const response = await fetch(url);\n    \n    if (!response.ok) {\n      throw new APIError(\n        `HTTP error! status: ${response.status}`,\n        response.status,\n        'HTTP_ERROR'\n      );\n    }\n    \n    return await response.json();\n  } catch (error) {\n    if (error instanceof APIError) {\n      // Handle API-specific errors\n      console.error('API Error:', error.message);\n    } else {\n      // Handle network or other errors\n      console.error('Network Error:', error.message);\n    }\n    throw error;\n  }\n};\n```",
        author: "error_handler",
        votes: 6,
        datePosted: "3 hours ago",
        isAccepted: true
      },
      {
        id: 2,
        content: "For a more functional approach, you can create a Result type pattern:\n\n```javascript\nconst createResult = (success, data, error) => ({ success, data, error });\n\nconst safeApiCall = async (url) => {\n  try {\n    const response = await fetch(url);\n    \n    if (!response.ok) {\n      return createResult(false, null, {\n        type: 'HTTP_ERROR',\n        status: response.status,\n        message: `HTTP ${response.status}`\n      });\n    }\n    \n    const data = await response.json();\n    return createResult(true, data, null);\n  } catch (error) {\n    return createResult(false, null, {\n      type: 'NETWORK_ERROR',\n      message: error.message\n    });\n  }\n};\n\n// Usage\nconst result = await safeApiCall('/api/users');\nif (result.success) {\n  console.log(result.data);\n} else {\n  console.error(result.error);\n}\n```",
        author: "functional_dev",
        votes: 4,
        datePosted: "2 hours ago",
        isAccepted: false
      }
    ],
    3: [
      {
        id: 1,
        content: "Great question! Here's my rule of thumb:\n\n**Use Flexbox when:**\n- You need to align items in a single dimension (row OR column)\n- You want items to grow/shrink to fill available space\n- You're working with navigation bars, button groups, or centering content\n\n**Use CSS Grid when:**\n- You need to control layout in two dimensions (rows AND columns)\n- You want to create complex layouts with precise positioning\n- You're building page layouts, card grids, or any structured content\n\n**Example - Flexbox for navigation:**\n```css\n.nav {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n```\n\n**Example - Grid for page layout:**\n```css\n.page-layout {\n  display: grid;\n  grid-template-areas: \n    'header header header'\n    'sidebar main aside'\n    'footer footer footer';\n  grid-template-columns: 200px 1fr 200px;\n}\n```",
        author: "css_master",
        votes: 18,
        datePosted: "20 hours ago",
        isAccepted: true
      },
      {
        id: 2,
        content: "They work great together! You can use Grid for the overall page structure and Flexbox for component-level layouts:\n\n```css\n/* Grid for main layout */\n.container {\n  display: grid;\n  grid-template-columns: 1fr 3fr;\n  gap: 20px;\n}\n\n/* Flexbox for card content */\n.card {\n  display: flex;\n  flex-direction: column;\n  justify-content: space-between;\n}\n\n.card-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n```\n\nThis gives you the best of both worlds - Grid's powerful 2D layout capabilities with Flexbox's flexible item alignment.",
        author: "layout_guru",
        votes: 12,
        datePosted: "18 hours ago",
        isAccepted: false
      }
    ],
    4: [
      {
        id: 1,
        content: "For PostgreSQL optimization on large datasets, here's my checklist:\n\n**1. Index Strategy:**\n```sql\n-- Composite indexes for common query patterns\nCREATE INDEX idx_users_status_created ON users(status, created_at);\n\n-- Partial indexes for frequent WHERE conditions\nCREATE INDEX idx_active_users ON users(email) WHERE status = 'active';\n\n-- Use EXPLAIN ANALYZE to verify index usage\nEXPLAIN ANALYZE SELECT * FROM users WHERE status = 'active' AND created_at > '2023-01-01';\n```\n\n**2. Query Optimization:**\n- Use LIMIT for pagination instead of OFFSET for large datasets\n- Consider window functions for complex aggregations\n- Use EXISTS instead of IN for subqueries\n- Avoid SELECT * in production queries\n\n**3. Database Configuration:**\n```sql\n-- Adjust work_mem for sort operations\nSET work_mem = '256MB';\n\n-- Increase shared_buffers for better caching\n-- In postgresql.conf: shared_buffers = 25% of RAM\n```",
        author: "postgres_expert",
        votes: 25,
        datePosted: "2 days ago",
        isAccepted: true
      },
      {
        id: 2,
        content: "Don't forget about partitioning for very large tables:\n\n```sql\n-- Range partitioning by date\nCREATE TABLE logs (\n    id BIGSERIAL,\n    created_at TIMESTAMP,\n    message TEXT\n) PARTITION BY RANGE (created_at);\n\nCREATE TABLE logs_2024_01 PARTITION OF logs\n    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');\n\nCREATE TABLE logs_2024_02 PARTITION OF logs\n    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');\n```\n\nThis can dramatically improve query performance when you're frequently filtering by date ranges.",
        author: "db_architect",
        votes: 15,
        datePosted: "1 day ago",
        isAccepted: false
      }
    ]
  };

  const currentQuestion = dummyQuestions.find(q => q.id === questionId);
  const currentAnswers = dummyAnswers[questionId] || [];

  const handleSubmitAnswer = () => {
    if (newAnswer.trim()) {
      // In a real app, this would make an API call
      const answerPreview = newAnswer.length > 100 ? newAnswer.substring(0, 100) + '...' : newAnswer;
      alert(`✅ Answer submitted successfully!\n\nPreview: "${answerPreview}"`);
      console.log('New answer submitted:', {
        questionId,
        content: newAnswer,
        timestamp: new Date().toISOString(),
        author: 'current_user' // In real app, this would come from auth
      });
      setNewAnswer('');
      setShowAnswerForm(false);
    } else {
      alert('❌ Please enter an answer before submitting.');
    }
  };

  const handleVote = (type: 'question' | 'answer', id: number, voteType: 'up' | 'down') => {
    if (type === 'question') {
      const currentVote = voteState.questionVote;
      const currentVotes = questionVotes[id] || currentQuestion?.votes || 0;
      
      let newVoteCount = currentVotes;
      let newVote: 'up' | 'down' | null = voteType;
      
      // If clicking the same vote, remove it
      if (currentVote === voteType) {
        newVote = null;
        newVoteCount = currentVotes - (voteType === 'up' ? 1 : -1);
      } else {
        // If switching vote or voting for first time
        if (currentVote) {
          // Remove previous vote and add new one
          newVoteCount = currentVotes - (currentVote === 'up' ? 1 : -1) + (voteType === 'up' ? 1 : -1);
        } else {
          // First vote
          newVoteCount = currentVotes + (voteType === 'up' ? 1 : -1);
        }
      }
      
      setVoteState(prev => ({ ...prev, questionVote: newVote }));
      setQuestionVotes(prev => ({ ...prev, [id]: newVoteCount }));
    } else {
      const currentVote = voteState.answerVotes[id];
      const answer = currentAnswers.find(a => a.id === id);
      const currentVotes = answerVoteCounts[id] || answer?.votes || 0;
      
      let newVoteCount = currentVotes;
      let newVote: 'up' | 'down' | null = voteType;
      
      if (currentVote === voteType) {
        newVote = null;
        newVoteCount = currentVotes - (voteType === 'up' ? 1 : -1);
      } else {
        if (currentVote) {
          newVoteCount = currentVotes - (currentVote === 'up' ? 1 : -1) + (voteType === 'up' ? 1 : -1);
        } else {
          newVoteCount = currentVotes + (voteType === 'up' ? 1 : -1);
        }
      }
      
      setVoteState(prev => ({
        ...prev,
        answerVotes: { ...prev.answerVotes, [id]: newVote }
      }));
      setAnswerVoteCounts(prev => ({ ...prev, [id]: newVoteCount }));
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

  if (!currentQuestion) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Question Not Found</h1>
          <p className="text-gray-600 mb-6">The question you're looking for doesn't exist.</p>
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
              className={`p-2 rounded-full transition-colors ${
                voteState.questionVote === 'up'
                  ? 'bg-green-100 text-green-600'
                  : 'hover:bg-gray-100 text-gray-400'
              }`}
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <span className={`text-2xl font-bold ${
              voteState.questionVote === 'up' ? 'text-green-600' : 
              voteState.questionVote === 'down' ? 'text-red-600' : 'text-gray-700'
            }`}>
              {questionVotes[currentQuestion.id] || currentQuestion.votes}
            </span>
            <button
              onClick={() => handleVote('question', currentQuestion.id, 'down')}
              className={`p-2 rounded-full transition-colors ${
                voteState.questionVote === 'down'
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
                  <path fillRule="evenodd" d="18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{currentQuestion.answers} answers</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{currentQuestion.views} views</span>
              </div>
            </div>

            {/* Question Content */}
            <div className="mb-6">
              <div className="prose max-w-none">
                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                  {currentQuestion.fullContent}
                </p>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {currentQuestion.tags.map((tag, index) => (
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
                <span>{currentQuestion.datePosted}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Answers Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {currentAnswers.length} Answer{currentAnswers.length !== 1 ? 's' : ''}
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

        <div className="space-y-6">
          {currentAnswers.map((answer) => (
            <div
              key={answer.id}
              className={`bg-white border rounded-lg shadow-sm p-6 ${
                answer.isAccepted ? 'border-green-200 bg-green-50' : 'border-gray-200'
              }`}
            >
              {answer.isAccepted && (
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
                    className={`p-2 rounded-full transition-colors ${
                      voteState.answerVotes[answer.id] === 'up'
                        ? 'bg-green-100 text-green-600'
                        : 'hover:bg-gray-100 text-gray-400'
                    }`}
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <span className={`text-lg font-bold ${
                    voteState.answerVotes[answer.id] === 'up' ? 'text-green-600' : 
                    voteState.answerVotes[answer.id] === 'down' ? 'text-red-600' : 'text-gray-700'
                  }`}>
                    {answerVoteCounts[answer.id] || answer.votes}
                  </span>
                  <button
                    onClick={() => handleVote('answer', answer.id, 'down')}
                    className={`p-2 rounded-full transition-colors ${
                      voteState.answerVotes[answer.id] === 'down'
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
                      <span>{answer.datePosted}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Answer Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Your Answer</h3>
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
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Submit Answer
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetail;