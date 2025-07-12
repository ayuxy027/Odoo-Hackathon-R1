import React, { useState } from 'react';

interface Props {
  navigate: (screen: 'home') => void;
}

const AskQuestion: React.FC<Props> = ({ navigate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');

  const handleSubmit = () => {
    if (title.trim() && description.trim()) {
      // You can extend this to actually store or send the question
      console.log({ title, description, tags });
      alert('Question submitted!');
      navigate('home');
    } else {
      alert('Please fill in both the title and description.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      <h2 className="text-2xl font-bold mb-4">Ask a Question</h2>

      <div className="mb-4">
        <label className="block font-medium mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          placeholder="What do you want to ask?"
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          rows={6}
          placeholder="Give more context or details about your question."
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Tags (comma separated)</label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          placeholder="e.g., react, javascript"
        />
      </div>

      <div className="flex space-x-2">
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Submit
        </button>
        <button
          onClick={() => navigate('home')}
          className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AskQuestion;