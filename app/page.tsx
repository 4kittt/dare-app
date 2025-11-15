"use client";
import { useState, useEffect } from "react";
import { useMiniKit, useViewCast } from "@coinbase/onchainkit/minikit";
import { DareCard } from "./components/DareCard";
import { ProofCard } from "./components/ProofCard";
import { Wallet } from "./components/Wallet";
import { CreateDareModal, UploadProofModal } from "./components/Modal";


interface Dare {
  id: string;
  title: string;
  description: string;
  reward: string;
  accepted?: boolean;
}

interface Proof {
  id: string;
  dareId: string;
  dareTitle: string;
  postUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  votes: number;
}

export default function Home() {
  const { isFrameReady, setFrameReady, context } = useMiniKit();
  const { viewCast: _viewCast } = useViewCast();
  const [activeTab, setActiveTab] = useState<'dares' | 'proofs'>('dares');
  const [dares, setDares] = useState<Dare[]>([
    {
      id: '1',
      title: 'Dance on a public square',
      description: 'Do a crazy dance on the main square of your city and film yourself!',
      reward: '0.01 ETH'
    },
    {
      id: '2',
      title: 'Learn a new word',
      description: 'Learn a word in a foreign language and use it in a conversation.',
      reward: '0.005 ETH'
    }
  ]);
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDareForProof, setSelectedDareForProof] = useState<Dare | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Initialize the miniapp
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  // Load data from database
  useEffect(() => {
    const loadData = async () => {
      try {
        const [daresResponse, proofsResponse] = await Promise.all([
          fetch('/api/dares'),
          fetch('/api/proofs')
        ]);

        if (daresResponse.ok) {
          const daresData = await daresResponse.json();
          setDares(daresData.map((dare: { id: string; title: string; description: string; reward: string; createdAt: string; createdBy: string }) => ({
            id: dare.id,
            title: dare.title,
            description: dare.description,
            reward: dare.reward,
            accepted: false // This would need user-specific tracking
          })));
        }

        if (proofsResponse.ok) {
          const proofsData = await proofsResponse.json();
          setProofs(proofsData.map((proof: { id: string; dareId: string; dareTitle: string; postUrl?: string; status: string; submittedAt: string; submittedBy: string; votes: number }) => ({
            id: proof.id,
            dareId: proof.dareId,
            dareTitle: proof.dareTitle,
            postUrl: proof.postUrl || undefined,
            status: proof.status as 'pending' | 'approved' | 'rejected',
            submittedAt: new Date(proof.submittedAt),
            votes: proof.votes
          })));
        }
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to default data
      }
    };

    loadData();
  }, []);

  // Show onboarding for first-time users
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('dare-app-onboarding-seen');
    if (!hasSeenOnboarding && context?.user) {
      setShowOnboarding(true);
    }
  }, [context?.user]);

  const handleAcceptDare = (dareId: string) => {
    setDares(prev => prev.map(dare =>
      dare.id === dareId ? { ...dare, accepted: true } : dare
    ));
  };

  const handleCreateDare = async (newDare: { title: string; description: string; reward: string }) => {
    try {
      const response = await fetch('/api/dares', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newDare.title,
          description: newDare.description,
          reward: newDare.reward,
          createdBy: context?.user?.fid?.toString() || null
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const dare: Dare = {
          id: data.id,
          title: data.title,
          description: data.description,
          reward: data.reward,
          accepted: false
        };
        setDares(prev => [dare, ...prev]);
      } else {
        throw new Error('Failed to create dare');
      }
    } catch (error) {
      console.error('Error creating dare:', error);
      // Fallback to local state
      const dare: Dare = {
        id: Date.now().toString(),
        ...newDare
      };
      setDares(prev => [...prev, dare]);
    }
  };

  const handleUploadProof = async (postUrl: string) => {
    if (!selectedDareForProof) return;

    try {
      const formData = new FormData();
      formData.append('postUrl', postUrl);
      formData.append('dareId', selectedDareForProof.id);
      formData.append('dareTitle', selectedDareForProof.title);
      formData.append('submittedBy', context?.user?.fid?.toString() || '');

      const response = await fetch('/api/proofs', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const proof: Proof = {
          id: data.id,
          dareId: data.dareId,
          dareTitle: data.dareTitle,
          postUrl: data.postUrl || undefined,
          status: data.status,
          submittedAt: new Date(data.submittedAt),
          votes: data.votes
        };
        setProofs(prev => [proof, ...prev].sort((a, b) => b.votes - a.votes));
      } else {
        throw new Error('Failed to upload proof');
      }
    } catch (error) {
      console.error('Error uploading proof:', error);
      // Fallback to local state
      const proof: Proof = {
        id: Date.now().toString(),
        dareId: selectedDareForProof.id,
        dareTitle: selectedDareForProof.title,
        postUrl,
        status: 'pending',
        submittedAt: new Date(),
        votes: 0
      };
      setProofs(prev => [...prev, proof]);
    }
  };

  const handleApproveProof = async (proofId: string) => {
    try {
      const response = await fetch('/api/proofs', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: proofId, status: 'approved' }),
      });

      if (response.ok) {
        setProofs(prev => prev.map(proof =>
          proof.id === proofId ? { ...proof, status: 'approved' } : proof
        ));
      } else {
        throw new Error('Failed to approve proof');
      }
    } catch (error) {
      console.error('Error approving proof:', error);
      // Fallback to local update
      setProofs(prev => prev.map(proof =>
        proof.id === proofId ? { ...proof, status: 'approved' } : proof
      ));
    }
  };

  const handleRejectProof = async (proofId: string) => {
    try {
      const response = await fetch('/api/proofs', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: proofId, status: 'rejected' }),
      });

      if (response.ok) {
        setProofs(prev => prev.map(proof =>
          proof.id === proofId ? { ...proof, status: 'rejected' } : proof
        ));
      } else {
        throw new Error('Failed to reject proof');
      }
    } catch (error) {
      console.error('Error rejecting proof:', error);
      // Fallback to local update
      setProofs(prev => prev.map(proof =>
        proof.id === proofId ? { ...proof, status: 'rejected' } : proof
      ));
    }
  };

  const handleVoteProof = async (proofId: string, vote: number) => {
    try {
      // Get current votes first
      const currentProof = proofs.find(p => p.id === proofId);
      if (currentProof) {
        const newVotes = currentProof.votes + vote;
        const response = await fetch('/api/proofs', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: proofId, votes: newVotes }),
        });

        if (response.ok) {
          setProofs(prev => prev.map(proof =>
            proof.id === proofId ? { ...proof, votes: newVotes } : proof
          ).sort((a, b) => b.votes - a.votes));
        } else {
          throw new Error('Failed to vote on proof');
        }
      }
    } catch (error) {
      console.error('Error voting on proof:', error);
      // Fallback to local update
      setProofs(prev => prev.map(proof =>
        proof.id === proofId ? { ...proof, votes: proof.votes + vote } : proof
      ).sort((a, b) => b.votes - a.votes));
    }
  };

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('dare-app-onboarding-seen', 'true');
  };

  const acceptedDares = dares.filter(dare => dare.accepted);

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
              Community challenges on Farcaster
            </p>
          </header>

        {/* Content */}
        <div className="flex-1 pb-24"> {/* Add padding for bottom nav */}
          {activeTab === 'dares' ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Available challenges</h2>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-primary text-white hover:bg-primary/90 rounded-lg min-h-11 px-4 py-2 transition-colors font-medium"
                >
                  + New challenge
                </button>
              </div>

              <div className="space-y-4">
                {dares.map(dare => (
                  <DareCard
                    key={dare.id}
                    dare={dare}
                    onAccept={handleAcceptDare}
                  />
                ))}
              </div>

              {acceptedDares.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-4">My accepted challenges</h3>
                  <div className="space-y-4">
                    {acceptedDares.map(dare => (
                      <div key={dare.id} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">{dare.title}</h4>
                        <button
                          onClick={() => {
                            setSelectedDareForProof(dare);
                            setShowUploadModal(true);
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white rounded-lg min-h-11 w-full font-medium transition-colors"
                        >
                          Submit proof
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-6">Proofs to approve</h2>

              {proofs.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    No proof submitted yet.
                  </p>
                  <p className="text-gray-500 dark:text-gray-500 mt-2">
                    Accept challenges and submit your proofs!
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {proofs.map(proof => {
                    const dare = dares.find(d => d.id === proof.dareId);
                    return (
                      <ProofCard
                        key={proof.id}
                        proof={proof}
                        onApprove={handleApproveProof}
                        onReject={handleRejectProof}
                        onVote={handleVoteProof}
                        rewardAmount={dare?.reward}
                        submitterAddress="0x742d35Cc6634C0532925a3b844Bc454e4438f44e" // Test address - replace with actual submitter address
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Navigation Bar */}
        <nav className="bottom-nav fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 px-4 py-2">
            <button
              onClick={() => setActiveTab('dares')}
              className={`flex flex-col items-center justify-center py-3 px-4 rounded-lg transition-colors min-h-11 ${
                activeTab === 'dares'
                  ? 'text-primary bg-primary/5'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-xs font-medium">Challenges</span>
            </button>
            <button
              onClick={() => setActiveTab('proofs')}
              className={`flex flex-col items-center justify-center py-3 px-4 rounded-lg transition-colors min-h-11 ${
                activeTab === 'proofs'
                  ? 'text-primary bg-primary/5'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-xs font-medium">Proofs</span>
            </button>
          </div>
        </nav>
        </main>
      </div>

      {/* Modals */}
      <CreateDareModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateDare={handleCreateDare}
      />

      <UploadProofModal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setSelectedDareForProof(null);
        }}
        dareTitle={selectedDareForProof?.title || ''}
        onUploadProof={handleUploadProof}
      />
    </div>
  );
}
