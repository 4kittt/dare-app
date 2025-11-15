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
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="font-semibold text-xl text-gray-900 dark:text-gray-100 mb-2">{dare.title}</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{dare.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-primary font-semibold">Reward: {dare.reward}</span>
        <button
          onClick={handleAccept}
          disabled={isAccepting || dare.accepted}
          className="bg-primary hover:bg-primary/90 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors min-h-11 min-w-[100px] font-medium"
        >
          {isAccepting ? 'Accepting...' : dare.accepted ? 'Accepted' : 'Accept'}
        </button>
      </div>
    </div>
  );
}
