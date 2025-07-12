import React, { useState } from 'react';

interface Props {
  navigate: (screen: 'home') => void;
}

const AskQuestion: React.FC<Props> = ({ navigate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (title.trim() && description.trim()) {
      setIsSubmitting(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log({ title, description, tags });
      
      // Show success message
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full';
      successDiv.innerHTML = '✓ Question submitted successfully!';
      document.body.appendChild(successDiv);
      
      setTimeout(() => {
        successDiv.classList.remove('translate-x-full');
      }, 100);
      
      setTimeout(() => {
        successDiv.classList.add('translate-x-full');
        setTimeout(() => document.body.removeChild(successDiv), 300);
      }, 2000);
      
      setIsSubmitting(false);
      navigate('home');
    } else {
      // Show error message
      const errorDiv = document.createElement('div');
      errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full';
      errorDiv.innerHTML = '⚠ Please fill in both title and description';
      document.body.appendChild(errorDiv);
      
      setTimeout(() => {
        errorDiv.classList.remove('translate-x-full');
      }, 100);
      
      setTimeout(() => {
        errorDiv.classList.add('translate-x-full');
        setTimeout(() => document.body.removeChild(errorDiv), 300);
      }, 2000);
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      e.preventDefault();
      const newTag = e.currentTarget.value.trim();
      const currentTags = tags.split(',').map(t => t.trim()).filter(t => t);
      if (!currentTags.includes(newTag)) {
        setTags(currentTags.concat(newTag).join(', '));
      }
      e.currentTarget.value = '';
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = tags.split(',').map(t => t.trim()).filter(t => t);
    const filteredTags = currentTags.filter(tag => tag !== tagToRemove);
    setTags(filteredTags.join(', '));
  };

  const displayTags = tags.split(',').map(t => t.trim()).filter(t => t);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Ask a Question
          </h1>
          <p className="text-gray-600 text-lg">
            Share your question with the community and get expert answers
          </p>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2"></div>
          
          <div className="p-8">
            {/* Title Input */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2 text-lg">
                Question Title
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 text-lg"
                  placeholder="What's your question? Be specific and clear..."
                />
                <div className="absolute right-3 top-3 text-gray-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Description Input */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2 text-lg">
                Description
              </label>
              <div className="relative">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 text-lg resize-none"
                  rows={6}
                  placeholder="Provide detailed context, what you've tried, and what you expect to happen..."
                />
                <div className="absolute right-3 top-3 text-gray-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Tags Input */}
            <div className="mb-8">
              <label className="block text-gray-700 font-semibold mb-2 text-lg">
                Tags
              </label>
              <div className="relative">
                <input
                  type="text"
                  onKeyDown={handleTagKeyDown}
                  className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 text-lg"
                  placeholder="Add tags (press Enter to add): react, javascript, css..."
                />
                <div className="absolute right-3 top-3 text-gray-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
              </div>
              
              {/* Display Tags */}
              {displayTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {displayTags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-200"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-blue-500 hover:text-blue-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Submit Question
                  </span>
                )}
              </button>
              
              <button
                onClick={() => navigate('home')}
                className="flex-1 bg-gray-100 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-200 transform hover:scale-105 transition-all duration-200 border-2 border-gray-200"
              >
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Cancel
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Tips for a Great Question
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-gray-700"><strong>Be specific:</strong> Include relevant details and context</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-gray-700"><strong>Use tags:</strong> Help others find and answer your question</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-gray-700"><strong>Show effort:</strong> Mention what you've already tried</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-gray-700"><strong>Clear title:</strong> Make it easy to understand at a glance</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AskQuestion;