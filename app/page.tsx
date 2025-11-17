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
    text: 'Préfères-tu passer du temps seul ou en groupe ?',
    options: [
      { text: 'Toujours seul(e)', points: 10 },
      { text: 'Plutôt seul(e)', points: 30 },
      { text: 'Équilibre parfait', points: 50 },
      { text: 'Plutôt en groupe', points: 70 },
      { text: 'Toujours en groupe', points: 90 }
    ]
  },
  {
    id: '2',
    category: 'Mood',
    text: 'Comment réagis-tu face à l\'imprévu ?',
    options: [
      { text: 'Panique totale', points: 10 },
      { text: 'Un peu stressé(e)', points: 30 },
      { text: 'Ça dépend', points: 50 },
      { text: 'Ça m\'amuse', points: 70 },
      { text: 'J\'adore ça', points: 90 }
    ]
  },
  // Dev Skills
  {
    id: '3',
    category: 'Dev Skills',
    text: 'As-tu déjà déployé une app ?',
    options: [
      { text: 'Qu\'est-ce que c\'est ?', points: 10 },
      { text: 'J\'ai essayé une fois', points: 30 },
      { text: 'Quelques fois', points: 50 },
      { text: 'Souvent', points: 70 },
      { text: 'Tous les jours', points: 90 }
    ]
  },
  {
    id: '4',
    category: 'Dev Skills',
    text: 'Quel est ton niveau en programmation ?',
    options: [
      { text: 'Débutant complet', points: 10 },
      { text: 'Bases solides', points: 30 },
      { text: 'Intermédiaire', points: 50 },
      { text: 'Avancé', points: 70 },
      { text: 'Expert', points: 90 }
    ]
  },
  // Food Taste
  {
    id: '5',
    category: 'Food Taste',
    text: 'Manges-tu des sushis au petit-déjeuner ?',
    options: [
      { text: 'Jamais de la vie !', points: 10 },
      { text: 'Peut-être une fois', points: 30 },
      { text: 'Pourquoi pas', points: 50 },
      { text: 'J\'adore', points: 70 },
      { text: 'Tous les matins', points: 90 }
    ]
  },
  // Fun/Weird
  {
    id: '6',
    category: 'Fun',
    text: 'Serais-tu capable de porter des chaussettes avec des sandales ?',
    options: [
      { text: 'Horreur absolue', points: 10 },
      { text: 'Jamais en public', points: 30 },
      { text: 'Pour rigoler', points: 50 },
      { text: 'Sans problème', points: 70 },
      { text: 'C\'est mon style', points: 90 }
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
                  Découvre ta vraie personnalité !
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-8">
                  Réponds à quelques questions fun pour créer ton profil unique et trouver des personnes compatibles
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-left">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">🤔 Mood Matching</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Teste ton tempérament social</p>
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-left">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">💻 Dev Skills</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Évalue ton niveau technique</p>
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-left">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">🍜 Food Taste</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Préférences culinaires</p>
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-left">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">🎪 Questions Fun</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Questions loufoques et inattendues</p>
                </div>
              </div>

              <button
                onClick={handleStartQuiz}
                className="w-full bg-primary text-white hover:bg-primary/90 rounded-lg min-h-12 font-medium transition-colors text-lg"
              >
                Commencer le quiz
              </button>
            </div>
          ) : currentStep === 'quiz' ? (
            <div>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Question {currentQuestion + 1} sur {quizQuestions.length}
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
                  Félicitations !
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-8">
                  Voici ton profil de personnalité unique
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
                  onClick={() => alert('Mint de ton badge NFT en développement !')}
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

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">A</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-gray-100">@alice_dev</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">89% match • DeFi Builder</p>
                      </div>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400">👋 Available</span>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">M</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-gray-100">@mayan_artist</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">82% match • NFT Creator</p>
                      </div>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400">🎨 Artist</span>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">Z</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-gray-100">@zebra_trader</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">79% match • Crypto Trader</p>
                      </div>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400">📈 Trader</span>
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
      </div>
    </div>
  );
}
