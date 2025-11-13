"use client";
import { useState, useEffect } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
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
  fileUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
}

export default function Home() {
  const { isFrameReady, setFrameReady, context } = useMiniKit();
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

  const handleCreateDare = (newDare: { title: string; description: string; reward: string }) => {
    const dare: Dare = {
      id: Date.now().toString(),
      ...newDare
    };
    setDares(prev => [...prev, dare]);
  };

  const handleUploadProof = (file: File) => {
    if (!selectedDareForProof) return;

    // Simulate file upload - in real app, upload to IPFS or similar
    const fileUrl = URL.createObjectURL(file);

    const proof: Proof = {
      id: Date.now().toString(),
      dareId: selectedDareForProof.id,
      dareTitle: selectedDareForProof.title,
      fileUrl,
      status: 'pending',
      submittedAt: new Date()
    };

    setProofs(prev => [...prev, proof]);
  };

  const handleApproveProof = (proofId: string) => {
    setProofs(prev => prev.map(proof =>
      proof.id === proofId ? { ...proof, status: 'approved' } : proof
    ));
  };

  const handleRejectProof = (proofId: string) => {
    setProofs(prev => prev.map(proof =>
      proof.id === proofId ? { ...proof, status: 'rejected' } : proof
    ));
  };

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('dare-app-onboarding-seen', 'true');
  };

  const acceptedDares = dares.filter(dare => dare.accepted);

  return (
    <div className="min-h-screen bg-parchment">
      <Wallet />

      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-parchment border-2 border-brown rounded-lg p-6 max-w-md">
            <h2 className="font-special-elite text-2xl text-brown mb-4 text-center">
              Welcome to DareUP! 🤠
            </h2>
            <div className="space-y-3 text-brown font-special-elite mb-6">
              <p>• Accept community challenges</p>
              <p>• Submit your proofs (photos/videos)</p>
              <p>• Win ETH rewards</p>
              <p>• Help the community by approving proofs</p>
            </div>
            <button
              onClick={handleCloseOnboarding}
              className="w-full bg-gold hover:bg-yellow-600 text-brown font-rye px-4 py-3 rounded-lg transition-colors min-h-11"
            >
              Start the adventure!
            </button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        <header className="text-center mb-8">
          <h1 className="font-rye text-4xl text-brown mb-2">
            DareUp
          </h1>
          <p className="text-brown font-special-elite">
            Community challenges on Farcaster
          </p>
        </header>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-6">
          <div className="bg-sand border-2 border-brown rounded-lg p-1">
            <button
              onClick={() => setActiveTab('dares')}
              className={`px-6 py-2 rounded-md font-rye transition-colors min-h-11 ${
                activeTab === 'dares'
                  ? 'bg-gold text-brown'
                  : 'text-brown hover:bg-parchment'
              }`}
            >
              Challenges ({dares.length})
            </button>
            <button
              onClick={() => setActiveTab('proofs')}
              className={`px-6 py-2 rounded-md font-rye transition-colors min-h-11 ${
                activeTab === 'proofs'
                  ? 'bg-gold text-brown'
                  : 'text-brown hover:bg-parchment'
              }`}
            >
              Proofs ({proofs.length})
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'dares' ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-rye text-2xl text-brown">Available challenges</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gold hover:bg-yellow-600 text-brown font-rye px-4 py-2 rounded-lg transition-colors min-h-11"
              >
                + New challenge
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {dares.map(dare => (
                <DareCard
                  key={dare.id}
                  dare={dare}
                  onAccept={handleAcceptDare}
                />
              ))}
            </div>

            {acceptedDares.length > 0 && (
              <div className="mt-8">
                <h3 className="font-rye text-xl text-brown mb-4">My accepted challenges</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {acceptedDares.map(dare => (
                    <div key={dare.id} className="bg-sand border border-brown rounded-lg p-4">
                      <h4 className="font-rye text-brown mb-2">{dare.title}</h4>
                      <button
                        onClick={() => {
                          setSelectedDareForProof(dare);
                          setShowUploadModal(true);
                        }}
                        className="bg-green-500 hover:bg-green-600 text-white font-rye px-4 py-2 rounded-lg transition-colors min-h-11 min-w-[120px]"
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
            <h2 className="font-rye text-2xl text-brown mb-6">Proofs to approve</h2>

            {proofs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-brown font-special-elite text-lg">
                  No proof submitted yet.
                </p>
                <p className="text-brown opacity-75 mt-2">
                  Accept challenges and submit your proofs!
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {proofs.map(proof => (
                  <ProofCard
                    key={proof.id}
                    proof={proof}
                    onApprove={handleApproveProof}
                    onReject={handleRejectProof}
                  />
                ))}
              </div>
            )}
          </div>
        )}
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
