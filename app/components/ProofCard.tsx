import { useState } from 'react';
import { toast } from 'sonner';
import { Transaction } from '@coinbase/onchainkit/transaction';
// import { Basename } from '@coinbase/onchainkit/basename'; // TODO: Implement when available

interface Proof {
  id: string;
  dareId: string;
  dareTitle: string;
  postUrl?: string; // Farcaster cast URL instead of file
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  votes: number;
}

interface ProofCardProps {
  proof: Proof;
  onApprove: (proofId: string) => void;
  onReject: (proofId: string) => void;
  onVote: (proofId: string, vote: number) => void;
  rewardAmount?: string;
  submitterAddress?: string;
}

export function ProofCard({ proof, onApprove, onReject, onVote, rewardAmount, submitterAddress }: ProofCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onApprove(proof.id);
      toast.success('Proof approved!');
    } catch {
      toast.error('Error during approval');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onReject(proof.id);
      toast.success('Proof rejected');
    } catch {
      toast.error('Error during rejection');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = () => {
    switch (proof.status) {
      case 'approved': return 'text-green-600';
      case 'rejected': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
      <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">Challenge: {proof.dareTitle}</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-2 text-sm">
        Submitted on {proof.submittedAt.toLocaleDateString()}
      </p>
      <p className={`font-medium mb-2 ${getStatusColor()}`}>
        Status: {proof.status === 'pending' ? 'Pending' : proof.status === 'approved' ? 'Approved' : 'Rejected'}
      </p>
      <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm">
        Votes: {proof.votes}
      </p>

      {proof.postUrl && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Farcaster Post Verified</span>
            </div>
            <button
              onClick={() => window.open(proof.postUrl, '_blank')}
              className="text-primary hover:text-primary/80 text-sm font-medium underline"
            >
              View Post →
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => onVote(proof.id, 1)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg transition-colors min-h-9 font-medium"
        >
          👍
        </button>
        <button
          onClick={() => onVote(proof.id, -1)}
          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-lg transition-colors min-h-9 font-medium"
        >
          👎
        </button>
      </div>

      {proof.status === 'pending' && (
        <div className="flex gap-2">
          <button
            onClick={handleApprove}
            disabled={isProcessing}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors min-h-11 font-medium flex-1"
          >
            {isProcessing ? 'Processing...' : 'Approve'}
          </button>
          <button
            onClick={handleReject}
            disabled={isProcessing}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors min-h-11 font-medium flex-1"
          >
            {isProcessing ? 'Processing...' : 'Reject'}
          </button>
        </div>
      )}

      {proof.status === 'approved' && rewardAmount && submitterAddress && submitterAddress.startsWith('0x') && (
        <div className="mt-4">
          <Transaction
            calls={[
              {
                to: submitterAddress as `0x${string}`,
                value: BigInt((parseFloat(rewardAmount) * 0.999) * 1e18), // 99.9% to submitter
              },
              {
                to: '0x8787Aa06854592aEAC677e5928E88011a4A88446' as `0x${string}`, // App creator fee address
                value: BigInt((parseFloat(rewardAmount) * 0.001) * 1e18), // 0.1% fee
              }
            ]}
            onSuccess={() => toast.success('Reward sent successfully!')}
            onError={() => toast.error('Failed to send reward')}
          >
            <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors min-h-11 w-full font-medium">
              Send {rewardAmount} ETH Reward (0.1% fee)
            </button>
          </Transaction>
        </div>
      )}
    </div>
  );
}
