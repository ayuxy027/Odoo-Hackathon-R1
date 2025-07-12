import React from 'react';

interface Props {
    navigate: (screen: 'home' | 'ask' | 'login') => void;
}

const Landing: React.FC<Props> = ({ navigate }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="relative z-10 pb-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">

                        <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                            <div className="sm:text-center lg:text-left">
                                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                                    <span className="block xl:inline">Welcome to</span>{' '}
                                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 xl:inline">
                                        StackIt
                                    </span>
                                </h1>
                                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                                    A modern Q&A platform where developers share knowledge, solve problems together, and build amazing things.
                                    Get expert answers to your technical questions and help others grow.
                                </p>

                                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                                    <div className="rounded-md shadow">
                                        <button
                                            onClick={() => navigate('home')}
                                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 md:py-4 md:text-lg md:px-10 transition-all duration-200 transform hover:scale-105"
                                        >
                                            Browse Questions
                                        </button>
                                    </div>
                                    <div className="mt-3 sm:mt-0 sm:ml-3">
                                        <button
                                            onClick={() => navigate('ask')}
                                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg md:px-10 transition-all duration-200"
                                        >
                                            Ask Question
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>

                <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
                    <div className="h-56 w-full bg-gradient-to-br from-blue-500 to-purple-600 sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center">
                        <div className="text-white text-center">
                            <svg className="w-32 h-32 mx-auto mb-4 opacity-80" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                            </svg>
                            <h3 className="text-2xl font-bold mb-2">Join the Community</h3>
                            <p className="text-blue-100">Connect with developers worldwide</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center">
                        <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Everything you need to get answers
                        </p>
                        <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                            StackIt provides all the tools you need to ask great questions and provide helpful answers.
                        </p>
                    </div>

                    <div className="mt-10">
                        <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                            <div className="relative">
                                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Fast Answers</p>
                                <p className="mt-2 ml-16 text-base text-gray-500">
                                    Get quick responses from experienced developers in the community.
                                </p>
                            </div>

                            <div className="relative">
                                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Quality Content</p>
                                <p className="mt-2 ml-16 text-base text-gray-500">
                                    Voting system ensures the best answers rise to the top.
                                </p>
                            </div>

                            <div className="relative">
                                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                </div>
                                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Smart Tagging</p>
                                <p className="mt-2 ml-16 text-base text-gray-500">
                                    Organize questions with tags to find exactly what you're looking for.
                                </p>
                            </div>

                            <div className="relative">
                                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 9H4l5-5v5zM5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
                                    </svg>
                                </div>
                                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Rich Formatting</p>
                                <p className="mt-2 ml-16 text-base text-gray-500">
                                    Support for code blocks, links, and formatted text to explain complex concepts.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8 lg:py-20">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                            Trusted by developers worldwide
                        </h2>
                        <p className="mt-3 text-xl text-blue-200 sm:mt-4">
                            Join thousands of developers sharing knowledge and solving problems together.
                        </p>
                    </div>
                    <dl className="mt-10 text-center sm:max-w-3xl sm:mx-auto sm:grid sm:grid-cols-3 sm:gap-8">
                        <div className="flex flex-col">
                            <dt className="order-2 mt-2 text-lg leading-6 font-medium text-blue-200">
                                Questions Answered
                            </dt>
                            <dd className="order-1 text-5xl font-extrabold text-white">10K+</dd>
                        </div>
                        <div className="flex flex-col mt-10 sm:mt-0">
                            <dt className="order-2 mt-2 text-lg leading-6 font-medium text-blue-200">
                                Active Users
                            </dt>
                            <dd className="order-1 text-5xl font-extrabold text-white">2.5K+</dd>
                        </div>
                        <div className="flex flex-col mt-10 sm:mt-0">
                            <dt className="order-2 mt-2 text-lg leading-6 font-medium text-blue-200">
                                Expert Contributors
                            </dt>
                            <dd className="order-1 text-5xl font-extrabold text-white">500+</dd>
                        </div>
                    </dl>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gray-50">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
                    <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                        <span className="block">Ready to get started?</span>
                        <span className="block text-blue-600">Join StackIt today.</span>
                    </h2>
                    <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
                        <div className="inline-flex rounded-md shadow">
                            <button
                                onClick={() => navigate('login')}
                                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                            >
                                Get Started
                            </button>
                        </div>
                        <div className="ml-3 inline-flex rounded-md shadow">
                            <button
                                onClick={() => navigate('home')}
                                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 transition-colors duration-200"
                            >
                                Browse Questions
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Landing; 