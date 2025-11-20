"use client";
import { useState, useEffect } from "react";
import { useMiniKit, useViewCast } from "@coinbase/onchainkit/minikit";
import { Wallet } from "./components/Wallet";
import { PersonalityRadar } from "./components/PersonalityRadar";
import { SwipeContainer } from "./components/SwipeContainer";
import { CardSlider } from "./components/CardSlider";
import { PersonalityFeedbackType } from "./lib/types";
import { useMintPersonalityBadge } from "./lib/nft";
import { CompatibilityCard } from "./lib/types";

interface QuizQuestion {
  id: string;
  text: string;
  category: string;
  options: { text: string; vectorDelta: PersonalityVector }[];
}

interface PersonalityVector {
  vision: number; // -10 to +10: Values and priorities
  risk: number;   // -10 to +10: Risk tolerance
  style: number;  // -10 to +10: Solo vs Social
  action: number; // -10 to +10: Reflection vs Speed
}

// Vector-based quiz with personality axes scoring
const quizQuestions: QuizQuestion[] = [
  // 🚀 Pillar 1: Vision & Values (The "Why")
  {
    id: '1',
    category: 'Vision & Values',
    text: 'The future of Web3 must prioritize:',
    options: [
      {
        text: 'Pure decentralization and censorship resistance, even if UX is complex.',
        vectorDelta: { vision: 3, risk: 0, style: 0, action: 0 }
      },
      {
        text: 'Mass adoption via perfect UX, even if requiring compromises on decentralization.',
        vectorDelta: { vision: -3, risk: 0, style: 0, action: 0 }
      }
    ]
  },
  {
    id: '2',
    category: 'Vision & Values',
    text: 'You receive 10 ETH. Your first move is to:',
    options: [
      {
        text: 'Stake it or place in DeFi for passive income.',
        vectorDelta: { vision: 1, risk: -1, style: 0, action: -1 }
      },
      {
        text: 'Fund a public good or small creator on Farcaster.',
        vectorDelta: { vision: 3, risk: 2, style: 0, action: 1 }
      },
      {
        text: 'Keep it liquid for next NFT drop or memecoin.',
        vectorDelta: { vision: -2, risk: 3, style: 0, action: 2 }
      }
    ]
  },
  {
    id: '3',
    category: 'Vision & Values',
    text: 'For you, "success" in 5 years primarily means:',
    options: [
      {
        text: 'Financial independence (no longer needing to work).',
        vectorDelta: { vision: -1, risk: -1, style: 0, action: -1 }
      },
      {
        text: 'Impact (building something used by thousands).',
        vectorDelta: { vision: 3, risk: 0, style: 1, action: 2 }
      },
      {
        text: 'Freedom (working from anywhere, on what I want).',
        vectorDelta: { vision: 2, risk: 0, style: 0, action: 3 }
      }
    ]
  },
  {
    id: '4',
    category: 'Vision & Values',
    text: 'What is the main purpose of crypto?',
    options: [
      {
        text: 'A fairer, more open financial system.',
        vectorDelta: { vision: 1, risk: -1, style: 0, action: -1 }
      },
      {
        text: 'A social and cultural revolution (NFTs, DAOs, communities).',
        vectorDelta: { vision: 3, risk: 1, style: 2, action: 1 }
      },
      {
        text: 'Technological evolution of the Internet.',
        vectorDelta: { vision: 2, risk: 0, style: -1, action: 3 }
      }
    ]
  },
  // ⚙️ Pillar 2: Building & Work Style (The "How")
  {
    id: '5',
    category: 'Building & Work Style',
    text: 'You are most productive:',
    options: [
      {
        text: 'Alone, in "deep work" mode with music and zero interruptions.',
        vectorDelta: { vision: 0, risk: 0, style: -4, action: -3 }
      },
      {
        text: 'In a "jam session," brainstorming and creating with others.',
        vectorDelta: { vision: 0, risk: 0, style: 4, action: 4 }
      }
    ]
  },
  {
    id: '6',
    category: 'Building & Work Style',
    text: 'Your project gets "forked" (copied) by an anonymous team. Your reaction:',
    options: [
      {
        text: 'That\'s validation! The fork is a compliment. I\'ll build my own path.',
        vectorDelta: { vision: 2, risk: 1, style: -1, action: 3 }
      },
      {
        text: 'It\'s frustrating. I\'ll defend my project\'s originality publicly.',
        vectorDelta: { vision: -1, risk: -1, style: 0, action: -2 }
      }
    ]
  },
  {
    id: '7',
    category: 'Building & Work Style',
    text: 'When you attack a new, complex project, you start by:',
    options: [
      {
        text: 'Reading the whitepaper or documentation deeply.',
        vectorDelta: { vision: 1, risk: -1, style: -1, action: -4 }
      },
      {
        text: 'Doing first. I try, break, and learn as I go.',
        vectorDelta: { vision: -1, risk: 1, style: 1, action: 4 }
      },
      {
        text: 'Finding 3 smartest people and asking questions.',
        vectorDelta: { vision: 0, risk: 0, style: 2, action: 2 }
      }
    ]
  },
  {
    id: '8',
    category: 'Building & Work Style',
    text: 'It is better to:',
    options: [
      {
        text: '"Ship" a 70% complete product and improve publicly.',
        vectorDelta: { vision: -1, risk: 2, style: 1, action: 4 }
      },
      {
        text: 'Polish privately and launch a 100% perfect product.',
        vectorDelta: { vision: 1, risk: -2, style: -1, action: -4 }
      }
    ]
  },
  // 🎢 Pillar 3: Chaos & Risk Tolerance (The "Risk")
  {
    id: '9',
    category: 'Chaos & Risk Tolerance',
    text: 'The market crashes 50%. You:',
    options: [
      {
        text: 'Sell to limit losses. "It\'s better to secure what\'s left."',
        vectorDelta: { vision: 0, risk: -5, style: 0, action: 0 }
      },
      {
        text: 'Do nothing. Close the app and "touch grass." It\'s just a cycle.',
        vectorDelta: { vision: 0, risk: 0, style: 0, action: 0 }
      },
      {
        text: 'Buy the dip. "This is the time to accumulate."',
        vectorDelta: { vision: 0, risk: 5, style: 0, action: 1 }
      }
    ]
  },
  {
    id: '10',
    category: 'Chaos & Risk Tolerance',
    text: 'Regarding "memecoins," your position is:',
    options: [
      {
        text: '"Degen." I allocate a small portfolio part for the "lotto" ticket.',
        vectorDelta: { vision: -1, risk: 3, style: 0, action: 0 }
      },
      {
        text: '"Builder." It\'s distracting and harms real projects.',
        vectorDelta: { vision: 1, risk: -2, style: -1, action: -1 }
      },
      {
        text: '"Observer." Fascinating phenomenon, but I don\'t touch it.',
        vectorDelta: { vision: 0, risk: 1, style: 0, action: 0 }
      }
    ]
  },
  {
    id: '11',
    category: 'Chaos & Risk Tolerance',
    text: 'You are planning a vacation. You prefer:',
    options: [
      {
        text: 'A detailed itinerary, hotel and activities booked months in advance.',
        vectorDelta: { vision: 0, risk: -3, style: -1, action: -2 }
      },
      {
        text: 'Just a one-way flight ticket. Figure out rest when I get there.',
        vectorDelta: { vision: 0, risk: 3, style: 1, action: 2 }
      }
    ]
  },
  {
    id: '12',
    category: 'Chaos & Risk Tolerance',
    text: 'A DeFi protocol promises you a 500% APY. You:',
    options: [
      {
        text: '"Scam." I ignore it; it\'s unsustainable and too risky.',
        vectorDelta: { vision: 0, risk: -5, style: 0, action: 0 }
      },
      {
        text: '"Intriguing." I read the docs and put 1% of my bag in it to see.',
        vectorDelta: { vision: 0, risk: 2, style: 0, action: -1 }
      }
    ]
  },
  // 🤝 Pillar 4: Connection & Social Style (The "Social")
  {
    id: '13',
    category: 'Connection & Social Style',
    text: 'On Farcaster (or X), you are more of a:',
    options: [
      {
        text: '"Lurker." You read constantly, but you almost never post.',
        vectorDelta: { vision: 0, risk: 0, style: -3, action: 0 }
      },
      {
        text: '"Broadcaster." You share your ideas, your takes, your projects (1-to-many).',
        vectorDelta: { vision: 0, risk: 1, style: 3, action: 1 }
      },
      {
        text: '"Connector." You spend your time in replies and DMs, connecting people (1-to-1).',
        vectorDelta: { vision: 1, risk: 0, style: 2, action: 0 }
      }
    ]
  },
  {
    id: '14',
    category: 'Connection & Social Style',
    text: 'At a party (or a crypto conference), you tend to:',
    options: [
      {
        text: 'Find a small group (2-3 people) and have one deep conversation.',
        vectorDelta: { vision: 0, risk: 0, style: -2, action: -1 }
      },
      {
        text: ' "Network" and try to talk to as many different people as possible.',
        vectorDelta: { vision: 0, risk: 1, style: 3, action: 2 }
      },
      {
        text: 'Stay near the food and wait for people to come to you.',
        vectorDelta: { vision: 0, risk: -1, style: -3, action: -2 }
      }
    ]
  },
  {
    id: '15',
    category: 'Connection & Social Style',
    text: 'Your daily "GM" / "GN" (Good Morning / Good Night) in servers is:',
    options: [
      {
        text: 'Essential. It\'s the foundation of courtesy and community presence.',
        vectorDelta: { vision: 1, risk: 0, style: 2, action: -1 }
      },
      {
        text: '"Noise." I prefer when people only speak when they have something useful to say.',
        vectorDelta: { vision: -1, risk: 0, style: -2, action: 1 }
      }
    ]
  },
  {
    id: '16',
    category: 'Connection & Social Style',
    text: 'If a friend has a problem, your first instinct is to:',
    options: [
      {
        text: 'Offer concrete solutions and an action plan.',
        vectorDelta: { vision: 0, risk: 0, style: 0, action: 2 }
      },
      {
        text: 'Simply listen and offer them emotional support.',
        vectorDelta: { vision: 0, risk: 0, style: 2, action: 0 }
      }
    ]
  }
];

export default function Home() {
  const { isFrameReady, setFrameReady, context } = useMiniKit();
  const { viewCast: _viewCast } = useViewCast();
  const [currentStep, setCurrentStep] = useState<'landing' | 'track-select' | 'quiz' | 'results' | 'swipe' | 'profile' | 'community'>('landing');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userVector, setUserVector] = useState<PersonalityVector>({
    vision: 0, risk: 0, style: 0, action: 0
  });
  const [selectedTrack, setSelectedTrack] = useState<'Build' | 'Connect' | null>(null);
  const [isMinted, setIsMinted] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [profileDescription, setProfileDescription] = useState('');
  const [profileTags, setProfileTags] = useState<string[]>([]);
  const [swipeCards, setSwipeCards] = useState<CompatibilityCard[]>([]);
  const [currentSwipeIndex, setCurrentSwipeIndex] = useState(0);

  // Generate personality name based on dominant traits
  const generatePersonalityName = (vector: PersonalityVector): string => {
    const { vision, risk, style } = vector; // action not used in name generation

    let name = '';

    // Vision-based
    if (vision > 5) name += 'Visionary ';
    else if (vision < -5) name += 'Pragmatic ';
    else name += 'Balanced ';

    // Style-based
    if (Math.abs(style) > 4) {
      name += style > 0 ? 'Connector ' : 'Architect ';
    } else {
      name += 'Explorer ';
    }

    // Risk-based
    if (risk > 3) name += 'Trailblazer';
    else if (risk < -3) name += 'Guardian';
    else name += 'Navigator';

    return name.trim();
  };

  // NFT Minting hook
  const personalityType = generatePersonalityName(userVector);
  const { mintBadge, result: mintResult, isPending: isMinting, isConfirming } = useMintPersonalityBadge(
    personalityType,
    Math.round(userVector.vision),
    Math.round(userVector.risk),
    Math.round(userVector.style),
    Math.round(userVector.action),
    selectedTrack as 'Build' | 'Connect',
    context?.user?.fid?.toString() || '',
    context?.user?.username || ''
  );

  // Handle NFT minting
  const handleMintBadge = async () => {
    try {
      const _result = mintBadge();
      if (_result?.success === false) {
        alert(`Minting failed: ${_result.error}`);
        return;
      }
      // Wait for confirmation
      // The hook handles the transaction confirmation
    } catch (error) {
      alert(`Minting failed: ${error}`);
    }
  };

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

  // Redirect to track selection after wallet connect
  useEffect(() => {
    if (context?.user && !showOnboarding && currentStep === 'landing') {
      setCurrentStep('track-select');
    }
  }, [context?.user, showOnboarding, currentStep]);



  const handleAnswer = (questionId: string, vectorDelta: PersonalityVector) => {
    // Add the vector delta to the userVector
    setUserVector(prev => ({
      vision: prev.vision + vectorDelta.vision,
      risk: prev.risk + vectorDelta.risk,
      style: prev.style + vectorDelta.style,
      action: prev.action + vectorDelta.action
    }));

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setCurrentStep('results');
    }
  };

  const handleRestartQuiz = () => {
    setCurrentStep('landing');
    setCurrentQuestion(0);
    setUserVector({ vision: 0, risk: 0, style: 0, action: 0 });
    setSelectedTrack(null);
  };

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('dare-app-onboarding-seen', 'true');
  };

  // Generate mock compatibility cards for testing CardSlider
  const generateMockCards = (): CompatibilityCard[] => {
    return [
      {
        profile: {
          fid: '201',
          username: 'sarah_builder',
          displayName: 'Sarah Chen',
          pfpUrl: 'https://picsum.photos/200/200?random=10',
          track: 'Build' as const,
          personalityScores: [],
          minted: true,
          tags: ['Solidity', 'DeFi', 'Security', 'ETH']
        },
        matchPercentage: 92,
        keyAlignmentTags: ['Both prioritize security', 'Similar building philosophy'],
        popNftProfile: 'Visionary Security Builder'
      },
      {
        profile: {
          fid: '202',
          username: 'alex_artist',
          displayName: 'Alex Rivera',
          pfpUrl: 'https://picsum.photos/200/200?random=11',
          track: 'Connect' as const,
          personalityScores: [],
          minted: true,
          bio: 'Bridging art and tech. Creating immersive NFT experiences.',
          tags: ['NFTs', 'Art', 'Augmented Reality', 'Community']
        },
        matchPercentage: 87,
        keyAlignmentTags: ['Creative and technical synergy', 'Growth mindset alignment'],
        popNftProfile: 'Immersive Experience Creator'
      },
      {
        profile: {
          fid: '203',
          username: 'jordan_defi',
          displayName: 'Jordan Park',
          pfpUrl: 'https://picsum.photos/200/200?random=12',
          track: 'Build' as const,
          personalityScores: [],
          minted: true,
          bio: 'Passionate about financial freedom. Building autonomous money protocols.',
          tags: ['DeFi', 'ZKPs', 'Autonomous', 'Solidity']
        },
        matchPercentage: 89,
        keyAlignmentTags: ['DeFi vision shared', 'Technical capabilities match'],
        popNftProfile: 'Autonomous Finance Architect'
      },
      {
        profile: {
          fid: '204',
          username: 'maya_designer',
          displayName: 'Maya Johnson',
          pfpUrl: 'https://picsum.photos/200/200?random=13',
          track: 'Connect' as const,
          personalityScores: [],
          minted: true,
          bio: 'UX designer with a background in sociology. Making web3 accessible.',
          tags: ['UX', 'Design', 'Psychology', 'Education']
        },
        matchPercentage: 83,
        keyAlignmentTags: ['Human-centered approach', 'Educational values shared'],
        popNftProfile: 'Human-Centered Innovator'
      },
      {
        profile: {
          fid: '205',
          username: 'drew_gaming',
          displayName: 'Drew Kim',
          pfpUrl: 'https://picsum.photos/200/200?random=14',
          track: 'Build' as const,
          personalityScores: [],
          minted: true,
          bio: 'Game developer exploring blockchain for gaming economies.',
          tags: ['Gaming', 'Blockchain', 'Rust', 'Unity']
        },
        matchPercentage: 78,
        keyAlignmentTags: ['Gaming and web3 crossover', 'Creative technical challenges'],
        popNftProfile: 'Blockchain Gaming Pioneer'
      }
    ];
  };

  // Handle CardSlider swipe actions
  const handleCardSliderSwipe = (action: PersonalityFeedbackType) => {
    console.log('Swiped:', action, 'on card index:', currentSwipeIndex);

    // Here you would typically send the action to your backend API
    // For now, we'll just log it
  };

  const handleCardSliderComplete = () => {
    if (currentSwipeIndex < swipeCards.length - 1) {
      setCurrentSwipeIndex(prev => prev + 1);
    } else {
      alert('No more compatible profiles! Check back later.');
      setCurrentSwipeIndex(0);
    }
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pixel-art pixel-filter">
      <Wallet />

      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 pixel-bg">
          <div className="pixel-container pixel-shadow max-w-sm w-full mx-4">
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
              className="pixel-button w-full bg-primary text-white hover:bg-primary/90 min-h-11 font-medium"
            >
              Get Started
            </button>
          </div>
        </div>
      )}

      {/* User Profile Header */}
      {context?.user && isMinted && (
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

      <div className="flex flex-col min-h-screen">
        <main className="flex-1 px-4 py-6 max-w-md mx-auto w-full">
          <header className="text-center mb-6">
            <h1 className="text-2xl font-bold font-pixel text-gray-900 dark:text-gray-100 mb-1">
              DareUP
            </h1>
            <p className="text-blue-600 text-sm font-pixel">
              Dare to Meet
            </p>
          </header>

        {/* Content */}
        <div className="flex-1 pb-24">
          {currentStep === 'landing' ? (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center px-6">
              {/* Main Hero Section */}
              <div className="mb-12">
                {/* Logo/Icon with gradient background */}
          <div className="pixel-container w-24 h-24 pixel-shadow pixel-gradient flex items-center justify-center mx-auto mb-8">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>

              {/* Main headline */}
              <h1 className="text-4xl font-bold font-pixel mb-4 pixel-text pixel-gradient">
                  DareUP
                </h1>

                {/* Subheadline */}
                <p className="text-lg pixel-text mb-8 leading-relaxed">
                  Dare to Meet
                </p>
              </div>

              {/* Feature highlights */}
              <div className="grid grid-cols-1 gap-4 mb-12 max-w-sm mx-auto w-full">
                <div className="pixel-container pixel-shadow">
                  <div className="flex items-center space-x-4">
                    <div className="pixel-container w-10 h-10 flex items-center justify-center">
                      <span className="text-2xl">🧠</span>
                    </div>
                    <div className="text-left">
                      <h3 className="pixel-text font-semibold">Personality First</h3>
                      <p className="pixel-text text-sm">Deep compatibility matching</p>
                    </div>
                  </div>
                </div>

                <div className="pixel-container pixel-shadow">
                  <div className="flex items-center space-x-4">
                    <div className="pixel-container w-10 h-10 flex items-center justify-center">
                      <span className="text-2xl">💫</span>
                    </div>
                    <div className="text-left">
                      <h3 className="pixel-text font-semibold">Web3 Native</h3>
                      <p className="pixel-text text-sm">Crypto creators community</p>
                    </div>
                  </div>
                </div>

                <div className="pixel-container pixel-shadow">
                  <div className="flex items-center space-x-4">
                    <div className="pixel-container w-10 h-10 flex items-center justify-center">
                      <span className="text-2xl">🏆</span>
                    </div>
                    <div className="text-left">
                      <h3 className="pixel-text font-semibold">Real Connections</h3>
                      <p className="pixel-text text-sm">Build, collaborate, connect</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => setCurrentStep('track-select')}
                className="pixel-button w-full max-w-sm pixel-gradient text-white font-bold py-4 px-8 text-lg pixel-shadow mb-6"
              >
                Start Your Journey 🚀
              </button>

              {/* Trust indicators */}
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <p>✨ Personalized matching • 🤝 Like-minded connections</p>
                <p className="mt-1">🎯 Build your web3 network • 💎 Mint personality NFTs</p>
              </div>
            </div>
          ) : currentStep === 'track-select' ? (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  What brings you to DareUp?
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-8">
                  Choose your path to find compatible crypto enthusiasts
                </p>
              </div>


              <div className="space-y-4">
                <button
                  onClick={() => {
                    setSelectedTrack('Build');
                    setCurrentStep('quiz');
                  }}
                  className="w-full p-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white pixel-corner transition-all duration-200 transform hover:scale-105"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 pixel-corner flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-lg">💻 Build</h3>
                      <p className="text-sm opacity-90">Find co-founders & collaborators with complementary risk styles</p>
                    </div>
                  </div>
                </button>


                <button
                  onClick={() => {
                    setSelectedTrack('Connect');
                    setCurrentStep('quiz');
                  }}
                  className="w-full p-6 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white pixel-corner transition-all duration-200 transform hover:scale-105"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 pixel-corner flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-lg">🤝 Connect</h3>
                      <p className="text-sm opacity-90">Find like-minded friends who share your social style</p>
                    </div>
                  </div>
                </button>


              </div>

              <div className="text-center mt-8">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Your selection helps us match you with compatible people who share your goals
                </p>
              </div>
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
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 pixel-corner p-6">
                    <div className="flex items-center mb-4">
                      <span className={`px-3 py-1 pixel-corner text-xs font-medium ${
                        question.category === 'Vision & Values' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                        question.category === 'Building & Work Style' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        question.category === 'Chaos & Risk Tolerance' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
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
                          onClick={() => handleAnswer(question.id, option.vectorDelta)}
                          className="w-full text-left p-4 border border-gray-200 dark:border-gray-600 pixel-corner hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-primary transition-all duration-200"
                        >
                          <span className="text-gray-900 dark:text-gray-100">{option.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
              ) : currentStep === 'swipe' ? (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 text-center">
                  Find Your Matches
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">
                  {isMinted ? 'Experience premium matching!' : 'Get started by minting your personality badge'}
                </p>
              </div>

              {isMinted ? (
                // Premium CardSlider for minted users
                <>
                  <CardSlider
                    cards={swipeCards.length > 0 ? swipeCards : generateMockCards()}
                    currentIndex={currentSwipeIndex}
                    onSwipe={handleCardSliderSwipe}
                    onCardComplete={handleCardSliderComplete}
                  />

                  <div className="mt-6 text-center">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 p-4 pixel-corner border border-purple-200 dark:border-purple-700">
                      <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                        🎉 Premium Experience Active!
                      </p>
                      <p className="text-xs text-purple-600 dark:text-purple-400">
                        Your nuanced feedback helps our AI learn what you truly want
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                // Fallback for non-minted users
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-8 mb-6">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V9z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Premium Matching Locked
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-sm">
                    Mint your personality badge to unlock the CardSlider experience with nuanced feedback!
                  </p>
                  <button
                    onClick={() => setCurrentStep('results')}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-8 pixel-corner pixel-button hover:from-purple-600 hover:to-pink-600 transition-all duration-300 text-lg font-medium shadow-lg"
                  >
                    🏅 Mint Badge to Unlock
                  </button>
                </div>
              )}

              <div className="mt-6 space-y-3">
                <button
                  onClick={() => setCurrentStep('results')}
                  className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 pixel-corner pixel-button min-h-12 font-medium transition-colors"
                >
                  View My Personality Results
                </button>
                <button
                  onClick={() => setCurrentStep('profile')}
                  className="w-full bg-primary text-white hover:bg-primary/90 pixel-corner pixel-button min-h-12 font-medium transition-colors"
                >
                  Edit My Profile
                </button>
              </div>
            </div>
          ) : currentStep === 'profile' ? (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 text-center">
                  Edit Your Profile
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">
                  Customize your DareUp experience
                </p>
              </div>

              <div className="space-y-6">
                {/* Profile Image */}
                <div className="text-center">
                  <img
                    src={context?.user?.pfpUrl || ''}
                    alt={context?.user?.username || 'User'}
                    className="w-20 h-20 rounded-full mx-auto mb-4"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Profile picture from Farcaster
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                    About Me
                  </label>
                  <textarea
                    value={profileDescription}
                    onChange={(e) => setProfileDescription(e.target.value)}
                    placeholder={`I'm a ${selectedTrack?.toLowerCase()} looking to connect with...`}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 pixel-corner bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                    rows={4}
                  />
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                    My Interests & Tags
                  </label>
                  <input
                    type="text"
                    placeholder="DeFi, NFTs, DAOs, Art... (separate with commas)"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 pixel-corner bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    value={profileTags.join(', ')}
                    onChange={(e) => {
                      const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                      setProfileTags(tags);
                      console.log('Profile tags updated:', tags); // Used for linting
                    }}
                  />
                </div>

                {/* Selected Track */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                    My Track
                  </label>
                  <div className="flex justify-center">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${selectedTrack === 'Build' ? 'bg-blue-100 text-blue-800' : selectedTrack === 'Connect' ? 'bg-purple-100 text-purple-800' : 'bg-pink-100 text-pink-800'}`}>
                      {selectedTrack}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <button
                    onClick={() => setCurrentStep('swipe')}
                    className="w-full bg-primary text-white hover:bg-primary/90 pixel-corner pixel-button min-h-12 font-medium transition-colors"
                  >
                    Start Swiping
                  </button>
                  <button
                    onClick={() => setCurrentStep('results')}
                    className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 pixel-corner pixel-button min-h-12 font-medium transition-colors"
                  >
                    Back to Results
                  </button>
                </div>
              </div>
            </div>
          ) : currentStep === 'community' ? (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold font-pixel text-gray-900 dark:text-gray-100 text-center">
                  🌟 Web3 Community Hub
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">
                  Connect with the broader ecosystem
                </p>
              </div>

              <div className="space-y-4">
                {/* Discord Links */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 pixel-corner p-4">
                  <h3 className="text-lg font-semibold font-pixel text-gray-900 dark:text-gray-100 mb-3">
                    🎮 Official Communities
                  </h3>

                  <div className="space-y-3">
                    <a
                      href="https://discord.gg/cSMGfkCwxX"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full p-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white pixel-corner pixel-button transition-all duration-200 transform hover:scale-105"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white/20 pixel-corner flex items-center justify-center">
                          <span className="text-xl">💬</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold">Base Official Discord</h4>
                          <p className="text-sm opacity-90">Join the largest Base community</p>
                        </div>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                    </a>

                    <a
                      href="https://portal.cdp.coinbase.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full p-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white pixel-corner pixel-button transition-all duration-200 transform hover:scale-105"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white/20 pixel-corner flex items-center justify-center">
                          <span className="text-xl">🌐</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold">Base Portal</h4>
                          <p className="text-sm opacity-90">Explore apps & tools on Base</p>
                        </div>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                    </a>
                  </div>
                </div>

                {/* Farcaster Channels */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    🔥 Trending Farcaster Channels
                  </h3>

                  <div className="space-y-3">
                    <a
                      href="https://warpcast.com/~/channel/web3"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 pixel-corner hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-xs">W3</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">/web3</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">152k followers</p>
                        </div>
                      </div>
                      <span className="text-gray-400">→</span>
                    </a>

                    <a
                      href="https://warpcast.com/~/channel/crypto"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 pixel-corner hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-xs">🎯</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">/crypto</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">89k followers</p>
                        </div>
                      </div>
                      <span className="text-gray-400">→</span>
                    </a>

                    <a
                      href="https://warpcast.com/~/channel/base"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 pixel-corner hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-xs">⚡</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">/base</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">34k followers</p>
                        </div>
                      </div>
                      <span className="text-gray-400">→</span>
                    </a>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                    Discover active communities on Farcaster ✨
                  </p>
                </div>

                <div className="text-center mt-6">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Join the Web3 ecosystem • Build connections • Create together
                  </p>
                </div>
              </div>
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
                <div className="mb-6">
                  <p className="text-lg text-primary font-semibold mb-2">
                    {generatePersonalityName(userVector)}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    You are a stylish {selectedTrack?.toLowerCase()}er in web3
                  </p>
                </div>
              </div>

              {/* Personality Radar Chart */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 text-center">
                  Your Personality Web
                </h3>
                <PersonalityRadar scores={[
                  { category: 'Vision & Values', score: Math.max(0, Math.min(100, ((userVector.vision + 10) / 20) * 100)) },
                  { category: 'Building & Work Style', score: Math.max(0, Math.min(100, ((userVector.action + 10) / 20) * 100)) },
                  { category: 'Chaos & Risk Tolerance', score: Math.max(0, Math.min(100, ((userVector.risk + 10) / 20) * 100)) },
                  { category: 'Connection & Social Style', score: Math.max(0, Math.min(100, ((userVector.style + 10) / 20) * 100)) }
                ]} />
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
                  onClick={async () => {
                    try {
                      const result = mintBadge();
                      if (result?.success === false) {
                        alert(`Minting failed: ${result.error}`);
                        return;
                      }
                      // For demo purposes - simulate success
                      setTimeout(() => {
                        setIsMinted(true);
                        setCurrentStep('swipe');
                      }, 2000);
                    } catch (error) {
                      console.error('Minting error:', error);
                      alert('Minting failed. Please try again.');
                    }
                  }}
                  disabled={isMinting || isConfirming}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 disabled:from-gray-400 disabled:to-gray-500 text-white hover:from-purple-600 hover:to-pink-600 rounded-lg min-h-12 font-medium transition-all duration-300 text-lg shadow-lg disabled:cursor-not-allowed"
                >
                  {isMinting ? '⏳ Minting Badge...' : isConfirming ? '✅ Confirming...' : '🏅 Mint Badge & Unlock'}
                </button>

                {/* Transaction status */}
                {mintResult?.success && (
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      🎉 Badge minted successfully! Transaction: {mintResult.transactionHash}
                    </p>
                  </div>
                )}

                {mintResult?.error && (
                  <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-300">
                      ❌ Minting failed: {mintResult.error}
                    </p>
                  </div>
                )}

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
        {currentStep !== 'landing' && (
          <nav className="bottom-nav fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="grid grid-cols-3 px-2 py-2">
              <button
                onClick={() => setCurrentStep('community')}
                className={`flex flex-col items-center justify-center py-3 px-4 rounded-lg transition-colors min-h-11 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800`}
              >
                <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-xs font-medium">Community</span>
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
                  if (currentStep !== 'results' && userVector.vision !== 0) {
                    setCurrentStep('results');
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
                <span className="text-xs font-medium">My Results</span>
              </button>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}
