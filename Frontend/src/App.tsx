import React, { useState } from 'react';
import Home from './screens/Home';
import AskQuestion from './screens/AskQuestion';
import QuestionDetail from './screens/QuestionDetail';
import Notifications from './screens/Notifications';

type Screen = 'home' | 'ask' | 'questionDetail' | 'notifications';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

  // Optional: Pass props to manage state between screens (e.g. selected question)
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);

  const navigateTo = (screen: Screen) => setCurrentScreen(screen);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Global Navigation Header */}
      <header className="bg-white shadow p-4 flex justify-between">
        <h1
          onClick={() => navigateTo('home')}
          className="text-xl font-bold cursor-pointer text-blue-600"
        >
          StackIt
        </h1>
        <div className="space-x-4">
          <button onClick={() => navigateTo('ask')}>Ask</button>
          <button onClick={() => navigateTo('notifications')}>Notifications</button>
        </div>
      </header>

      {/* Screen Renderer */}
      <main className="p-6">
        {currentScreen === 'home' && (
          <Home navigate={navigateTo} selectQuestion={setSelectedQuestionId} />
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
        {currentScreen === 'notifications' && (
          <Notifications navigate={navigateTo} />
        )}
      </main>
    </div>
  );
};

export default App;
