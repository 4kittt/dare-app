"use client";
import { useState, useEffect } from "react";
import { useMiniKit, useViewCast } from "@coinbase/onchainkit/minikit";
import { Wallet } from "./components/Wallet";
import { PersonalityRadar } from "./components/PersonalityRadar";

interface QuizQuestion {
  id: string;
  text: string;
  category: string;
  options: { text: string; points: number }[];
}

interface UserScore {
  category: string;
  score: number;
}

const quizQuestions: QuizQuestion[] = [
  // Mood Matching
  {
    id: '1',
    category: 'Mood',
    text: 'Do you prefer spending time alone or in groups?',
    options: [
      { text: 'Always alone', points: 10 },
      { text: 'Mostly alone', points: 30 },
      { text: 'Perfect balance', points: 50 },
      { text: 'Mostly in groups', points: 70 },
      { text: 'Always in groups', points: 90 }
    ]
  },
  {
    id: '2',
    category: 'Mood',
    text: 'How do you react to unexpected situations?',
    options: [
      { text: 'Total panic', points: 10 },
      { text: 'A bit stressed', points: 30 },
      { text: 'It depends', points: 50 },
      { text: 'It amuses me', points: 70 },
      { text: 'I love it', points: 90 }
    ]
  },
  // Dev Skills
  {
    id: '3',
    category: 'Dev Skills',
    text: 'Have you ever deployed an app?',
    options: [
      { text: 'What\'s that?', points: 10 },
      { text: 'I tried once', points: 30 },
      { text: 'A few times', points: 50 },
      { text: 'Often', points: 70 },
      { text: 'Every day', points: 90 }
    ]
  },
  {
    id: '4',
    category: 'Dev Skills',
    text: 'What\'s your programming level?',
    options: [
      { text: 'Total beginner', points: 10 },
      { text: 'Solid basics', points: 30 },
      { text: 'Intermediate', points: 50 },
      { text: 'Advanced', points: 70 },
      { text: 'Expert', points: 90 }
    ]
  },
  // Food Taste
  {
    id: '5',
    category: 'Food Taste',
    text: 'Do you eat sushi for breakfast?',
    options: [
      { text: 'Never in my life!', points: 10 },
      { text: 'Maybe once', points: 30 },
      { text: 'Why not', points: 50 },
      { text: 'I love it', points: 70 },
      { text: 'Every morning', points: 90 }
    ]
  },
  // Fun/Weird
  {
    id: '6',
    category: 'Fun',
    text: 'Would you wear socks with sandals?',
    options: [
      { text: 'Absolutely horrifying', points: 10 },
      { text: 'Never in public', points: 30 },
      { text: 'For fun', points: 50 },
      { text: 'No problem', points: 70 },
      { text: 'That\'s my style', points: 90 }
    ]
  }
];

export default function Home() {
  const { isFrameReady, setFrameReady, context } = useMiniKit();
  const { viewCast: _viewCast } = useViewCast();
  const [currentStep, setCurrentStep] = useState<'welcome' | 'quiz' | 'results'>('welcome');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{[key: string]: number}>({});
  const [userScores, setUserScores] = useState<UserScore[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Initialize the miniapp
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  // Show onboarding for first-time users
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('dare-app-onboarding-seen');
    if (!hasSeenOnboarding && context?.user) {
      setShowOnboarding(true);
    }
  }, [context?.user]);

  const handleStartQuiz = () => {
    setCurrentStep('quiz');
    setCurrentQuestion(0);
  };

  const handleAnswer = (questionId: string, points: number) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: points
    }));

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateScores();
      setCurrentStep('results');
    }
  };

  const calculateScores = () => {
    const scores: {[category: string]: { total: number, count: number }} = {};

    quizQuestions.forEach(question => {
      const answer = userAnswers[question.id];
      if (answer !== undefined) {
        if (!scores[question.category]) {
          scores[question.category] = { total: 0, count: 0 };
        }
        scores[question.category].total += answer;
        scores[question.category].count += 1;
      }
    });

    const calculatedScores = Object.entries(scores).map(([category, data]) => ({
      category,
      score: Math.round(data.total / data.count)
    }));

    setUserScores(calculatedScores);
  };

  const handleRestartQuiz = () => {
    setCurrentStep('welcome');
    setCurrentQuestion(0);
    setUserAnswers({});
    setUserScores([]);
  };

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('dare-app-onboarding-seen', 'true');
  };

  if (!isFrameReady) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading DareUp...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Wallet />

      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 max-w-sm w-full mx-4 shadow-lg">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Welcome to DareUp!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Get started with community challenges
              </p>
            </div>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300 mb-6 text-sm">
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Accept community challenges
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Submit proofs (photos/videos)
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Win ETH rewards
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Help approve community proofs
              </li>
            </ul>
            <button
              onClick={handleCloseOnboarding}
              className="w-full bg-primary text-white hover:bg-primary/90 rounded-lg min-h-11 font-medium transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col min-h-screen">
        {/* User Profile Header */}
        {context?.user && (
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
            <div className="flex items-center gap-3 max-w-md mx-auto">
              <img
                src={context.user.pfpUrl}
                alt={context.user.username}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  @{context.user.username}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {context.user.displayName}
                </p>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full">
          <header className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              DareUp
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Web3 Personality Quiz & Social Matching
            </p>
          </header>

        {/* Content */}
        <div className="flex-1 pb-24">
          {currentStep === 'welcome' ? (
            <div className="text-center">
              <div className="mb-8">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Discover Your True Personality!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-8">
                  Answer a few fun questions to create your unique profile and find compatible people
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-left">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">🤔 Mood Matching</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Test your social temperament</p>
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-left">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">💻 Dev Skills</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Assess your technical level</p>
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-left">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">🍜 Food Taste</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Culinary preferences</p>
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-left">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">🎪 Questions Fun</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Weird and unexpected questions</p>
                </div>
              </div>

              <button
                onClick={handleStartQuiz}
                className="w-full bg-primary text-white hover:bg-primary/90 rounded-lg min-h-12 font-medium transition-colors text-lg"
              >
                Start Quiz
              </button>
            </div>
          ) : currentStep === 'quiz' ? (
            <div>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Question {currentQuestion + 1} of {quizQuestions.length}
                  </span>
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {(() => {
                const question = quizQuestions[currentQuestion];
                return (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        question.category === 'Mood' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        question.category === 'Dev Skills' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        question.category === 'Food Taste' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                        'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      }`}>
                        {question.category}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                      {question.text}
                    </h3>

                    <div className="space-y-3">
                      {question.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleAnswer(question.id, option.points)}
                          className="w-full text-left p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-primary transition-all duration-200"
                        >
                          <span className="text-gray-900 dark:text-gray-100">{option.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="text-center">
              <div className="mb-8">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Congratulations!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-8">
                  Here's your unique personality profile
                </p>
              </div>

              {/* Personality Radar Chart */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 text-center">
                  Your Personality Web
                </h3>
                <PersonalityRadar scores={userScores} />
              </div>

              {/* Social Gating CTA Section */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-6 space-y-4">
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    🏆 Mint Your Web3 Personality Badge
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Unlock access to meet compatible crypto builders
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <span className="text-primary">✨</span>
                      <span className="text-gray-700 dark:text-gray-300">Discover 13+ compatible profiles</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <span className="text-primary">💫</span>
                      <span className="text-gray-700 dark:text-gray-300">Access the matching experience</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <span className="text-primary">🤝</span>
                      <span className="text-gray-700 dark:text-gray-300">Connect with like-minded creators</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="bg-primary/10 rounded-full px-4 py-2">
                    <span className="text-primary font-semibold">13 potential matches waiting for you 🎯</span>
                  </div>
                </div>

                <button
                  onClick={() => alert('Mint your Web3 Personality Badge - Coming Soon!')}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 rounded-lg min-h-12 font-medium transition-all duration-300 text-lg shadow-lg"
                >
                  🏅 Mint Match Badge & Unlock
                </button>

                <button
                  onClick={handleRestartQuiz}
                  className="w-full bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg min-h-12 font-medium transition-colors"
                >
                  Retake Quiz
                </button>

                {/* Mock Preview of Compatible Profiles */}
                <div className="mt-6 pt-6 border-t border-purple-200 dark:border-purple-600">
                  <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4 text-center">
                    Preview of Compatible Creators 🔥
                  </h5>

                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">A</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-gray-100">@alice_dev</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">89% • DeFi Builder</p>
                      </div>
                      <span className="text-xs text-green-600">💫</span>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">M</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-gray-100">@mayan_artist</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">82% • NFT Creator</p>
                      </div>
                      <span className="text-xs text-green-600">🎨</span>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-xs">🤝</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-gray-100">@crypto_soul</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">76% • Community Builder</p>
                      </div>
                      <span className="text-xs text-green-600">🔗</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                    Mint your badge to unlock 10+ more profiles & messaging
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        </main>

        {/* Bottom Navigation Bar - Required by Base guidelines */}
        <nav className="bottom-nav fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="grid grid-cols-3 px-2 py-2">
            <button
              onClick={() => setCurrentStep('welcome')}
              className={`flex flex-col items-center justify-center py-3 px-4 rounded-lg transition-colors min-h-11 ${
                currentStep === 'welcome'
                  ? 'text-primary bg-primary/5'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-medium">Discover</span>
            </button>

            <button
              onClick={() => currentStep !== 'quiz' && setCurrentStep('quiz')}
              className={`flex flex-col items-center justify-center py-3 px-4 rounded-lg transition-colors min-h-11 ${
                currentStep === 'quiz'
                  ? 'text-primary bg-primary/5'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span className="text-xs font-medium">Take Quiz</span>
            </button>

            <button
              onClick={() => {
                if (currentStep !== 'results') {
                  if (userAnswers && Object.keys(userAnswers).length > 0) {
                    calculateScores();
                    setCurrentStep('results');
                  }
                }
              }}
              className={`flex flex-col items-center justify-center py-3 px-4 rounded-lg transition-colors min-h-11 ${
                currentStep === 'results'
                  ? 'text-primary bg-primary/5'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-xs font-medium">My Matches</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
