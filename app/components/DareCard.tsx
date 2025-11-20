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
    <div className="bg-black border border-white pixel-corner p-6 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="font-pixel text-xl uppercase text-white mb-2">{dare.title}</h3>
      <p className="text-gray-400 mb-4">{dare.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-primary font-semibold uppercase">Reward: {dare.reward}</span>
        <button
          onClick={handleAccept}
          disabled={isAccepting || dare.accepted}
          className="pixel-button bg-primary disabled:bg-gray-400 text-white uppercase font-pixel hover:translate-0"
        >
          {isAccepting ? 'Accepting...' : dare.accepted ? 'Accepted' : 'Accept'}
        </button>
      </div>
    </div>
  );
}
