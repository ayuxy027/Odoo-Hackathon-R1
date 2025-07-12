import React from 'react';

interface Props {
  navigate: (screen: 'home' | 'ask' | 'questionDetail') => void;
  selectQuestion: (id: number) => void;
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
  hasAcceptedAnswer: boolean;
  datePosted: string;
}

const Home: React.FC<Props> = ({ navigate, selectQuestion }) => {
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
      hasAcceptedAnswer: true,
      datePosted: "2 hours ago"
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
      hasAcceptedAnswer: false,
      datePosted: "5 hours ago"
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
      hasAcceptedAnswer: true,
      datePosted: "1 day ago"
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
      hasAcceptedAnswer: true,
      datePosted: "3 days ago"
    }
  ];

  const handleQuestionClick = (questionId: number) => {
    selectQuestion(questionId);
    navigate('questionDetail');
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
      'default': 'bg-gray-100 text-gray-800'
    };
    return colors[tag as keyof typeof colors] || colors.default;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
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
      <div className="space-y-4">
        {dummyQuestions.map((question) => (
          <div
            key={question.id}
            onClick={() => handleQuestionClick(question.id)}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                    {question.title}
                  </h2>
                  {question.hasAcceptedAnswer && (
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <p className="text-gray-600 mb-3 line-clamp-2">{question.description}</p>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {question.tags.map((tag, index) => (
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

            {/* Question Stats */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  <span className="font-medium">{question.votes}</span>
                  <span>votes</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">{question.answers}</span>
                  <span>answers</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">{question.views}</span>
                  <span>views</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span>asked by</span>
                <span className="font-medium text-blue-600">{question.author}</span>
                <span>•</span>
                <span>{question.datePosted}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      <div className="mt-8 text-center">
        <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors">
          Load More Questions
        </button>
      </div>
    </div>
  );
};

export default Home;