import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Landing from './screens/Landing';
import Login from './screens/Login';
import Home from './screens/Home';
import AskQuestion from './screens/AskQuestion';
import QuestionDetail from './screens/QuestionDetail';

// Types for screen identifiers
type Screen = 'landing' | 'login' | 'home' | 'ask' | 'questionDetail';

const AppContent: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
    setShowNotifications(false);
  };

  const handleLogout = () => {
    logout();
    navigateTo('landing');
  };

  // Show header only for authenticated screens
  const shouldShowHeader = currentScreen !== 'landing' && currentScreen !== 'login';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {shouldShowHeader && (
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

            {/* User Info and Auth Actions */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {user?.username[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">{user?.username}</div>
                      <div className="text-gray-500 capitalize">{user?.role}</div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigateTo('login')}
                  className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Screen Renderer */}
      <main className={shouldShowHeader ? "p-6" : ""}>
        {currentScreen === 'landing' && (
          <Landing navigate={navigateTo} />
        )}

        {currentScreen === 'login' && (
          <Login navigate={navigateTo} />
        )}

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

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
