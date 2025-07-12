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
      <div className="space-y-4">
        {dummyQuestions.map((question) => (
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
                  {question.hasAcceptedAnswer && (
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
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

            {/* Meta Data */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-6">
                <span>{question.votes} votes</span>
                <span>{question.answers} answers</span>
                <span>{question.views} views</span>
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
