import { useState } from 'react';
import { toast } from 'sonner';
import Image from 'next/image';

interface Proof {
  id: string;
  dareId: string;
  dareTitle: string;
  fileUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
}

interface ProofCardProps {
  proof: Proof;
  onApprove: (proofId: string) => void;
  onReject: (proofId: string) => void;
}

export function ProofCard({ proof, onApprove, onReject }: ProofCardProps) {
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
    <div className="bg-parchment border-2 border-brown rounded-lg p-6 shadow-lg">
      <h3 className="font-rye text-xl text-brown mb-2">Challenge: {proof.dareTitle}</h3>
      <p className="text-brown mb-2 font-special-elite">
        Submitted on {proof.submittedAt.toLocaleDateString()}
      </p>
      <p className={`font-bold mb-4 ${getStatusColor()}`}>
        Status: {proof.status === 'pending' ? 'Pending' : proof.status === 'approved' ? 'Approved' : 'Rejected'}
      </p>

      {proof.fileUrl && (
        <div className="mb-4">
          <Image
            src={proof.fileUrl}
            alt="Submitted proof"
            width={300}
            height={200}
            className="w-full max-w-xs rounded-lg border border-brown"
          />
        </div>
      )}

      {proof.status === 'pending' && (
        <div className="flex gap-2">
          <button
            onClick={handleApprove}
            disabled={isProcessing}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-rye px-4 py-2 rounded-lg transition-colors min-h-11"
          >
            {isProcessing ? 'Processing...' : 'Approve'}
          </button>
          <button
            onClick={handleReject}
            disabled={isProcessing}
            className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-rye px-4 py-2 rounded-lg transition-colors min-h-11"
          >
            {isProcessing ? 'Processing...' : 'Reject'}
          </button>
        </div>
      )}
    </div>
  );
}
