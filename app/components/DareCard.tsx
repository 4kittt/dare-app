import { useState } from 'react';
import { toast } from 'sonner';

interface Dare {
  id: string;
  title: string;
  description: string;
  reward: string;
  accepted?: boolean;
}

interface DareCardProps {
  dare: Dare;
  onAccept: (dareId: string) => void;
}

export function DareCard({ dare, onAccept }: DareCardProps) {
  const [isAccepting, setIsAccepting] = useState(false);

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      // Simulate signing a message
      await new Promise(resolve => setTimeout(resolve, 1000));
      onAccept(dare.id);
      toast.success(`Challenge "${dare.title}" accepted!`);
    } catch {
      toast.error('Error accepting the challenge');
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <div className="bg-parchment border-2 border-brown rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
      <h3 className="font-rye text-2xl text-brown mb-2">{dare.title}</h3>
      <p className="text-brown mb-4 font-special-elite">{dare.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-gold font-bold font-rye">Reward: {dare.reward}</span>
        <button
          onClick={handleAccept}
          disabled={isAccepting || dare.accepted}
          className="bg-gold hover:bg-yellow-600 disabled:bg-gray-400 text-brown font-rye px-4 py-2 rounded-lg transition-colors min-h-11 min-w-[100px]"
        >
          {isAccepting ? 'Accepting...' : dare.accepted ? 'Accepted' : 'Accept'}
        </button>
      </div>
    </div>
  );
}
