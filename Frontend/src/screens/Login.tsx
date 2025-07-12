import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface Props {
    navigate: (screen: 'home' | 'landing') => void;
}

const Login: React.FC<Props> = ({ navigate }) => {
    const { login } = useAuth();
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const result = await login(credentials);
            if (result.success) {
                navigate('home');
            } else {
                setError(result.message || 'Login failed');
            }
        } catch (error) {
            setError('Connection error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTestAccount = (username: string, password: string) => {
        setCredentials({ username, password });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
            <div className="max-w-md w-full space-y-8 p-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Sign in to StackIt
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Join the community and start asking questions
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-xl p-8">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                <div className="flex">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">
                                            {error}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label htmlFor="username" className="sr-only">
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Username"
                                value={credentials.username}
                                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={credentials.password}
                                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Signing in...
                                    </div>
                                ) : (
                                    'Sign in'
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Test with demo accounts</span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-3">
                            <button
                                onClick={() => handleTestAccount('guest', 'guest123')}
                                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                            >
                                <span className="text-blue-600 font-medium">Guest Account</span>
                                <span className="ml-2 text-gray-400">(guest/guest123)</span>
                            </button>

                            <button
                                onClick={() => handleTestAccount('user', 'user123')}
                                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                            >
                                <span className="text-green-600 font-medium">User Account</span>
                                <span className="ml-2 text-gray-400">(user/user123)</span>
                            </button>

                            <button
                                onClick={() => handleTestAccount('admin', 'admin123')}
                                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                            >
                                <span className="text-purple-600 font-medium">Admin Account</span>
                                <span className="ml-2 text-gray-400">(admin/admin123)</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <button
                        onClick={() => navigate('landing')}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                        ← Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login; 