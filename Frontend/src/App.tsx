import React, { useState } from 'react';
import Home from './screens/Home';
import AskQuestion from './screens/ AskQuestion';
import QuestionDetail from './screens/QuestionDetail';

// Types for screen identifiers
type Screen = 'home' | 'ask' | 'questionDetail';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
    setShowNotifications(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1
          onClick={() => navigateTo('home')}
          className="text-xl font-bold cursor-pointer text-blue-600"
        >
          StackIt
        </h1>

        <div className="space-x-4 flex items-center">
          <button
            onClick={() => navigateTo('ask')}
            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
          >
            Ask
          </button>

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:text-blue-600"
            >
              🛎️
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg border rounded p-4 z-50">
                <h2 className="font-semibold mb-2">Notifications</h2>
                <ul className="text-sm space-y-2">
                  <li>🔔 New answer on your question</li>
                  <li>👍 Someone upvoted your answer</li>
                  <li>💬 You were mentioned</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Screen Renderer */}
      <main className="p-6">
        {currentScreen === 'home' && (
          <Home
            navigate={navigateTo}
            selectQuestion={(id: number) => {
              setSelectedQuestionId(id);
              navigateTo('questionDetail');
            }}
          />
        )}

        {currentScreen === 'ask' && (
          <AskQuestion navigate={navigateTo} />
        )}

        {currentScreen === 'questionDetail' && selectedQuestionId !== null && (
          <QuestionDetail
            questionId={selectedQuestionId}
            navigate={navigateTo}
          />
        )}
      </main>
    </div>
  );
};

export default App;
