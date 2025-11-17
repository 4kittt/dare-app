import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useComposeCast } from '@coinbase/onchainkit/minikit';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-parchment border-2 border-brown rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-rye text-2xl text-brown">{title}</h2>
            <button
              onClick={onClose}
              className="text-brown hover:text-gold text-2xl leading-none min-h-11 min-w-11 flex items-center justify-center"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

interface CreateDareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateDare: (dare: { title: string; description: string; reward: string }) => void;
}

export function CreateDareModal({ isOpen, onClose, onCreateDare }: CreateDareModalProps) {
  const { composeCast } = useComposeCast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [reward, setReward] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !reward.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const castText = `dare: ${title} - ${description} for ${reward} prize! ${tags.trim()}`;

      composeCast({ text: castText });
      onCreateDare({ title: title.trim(), description: description.trim(), reward: reward.trim() });
      toast.success('Challenge created and composer opened!');
      setTitle('');
      setDescription('');
      setTags('');
      setReward('');
      onClose();
    } catch (error) {
      toast.error('Error creating the challenge: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create a new challenge">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-brown font-rye mb-1">
            Challenge title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-brown rounded bg-white text-gray-900 font-special-elite min-h-11"
            placeholder="Ex: Dance on a public square"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-brown font-rye mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-brown rounded bg-white text-gray-900 font-special-elite min-h-20 resize-none"
            placeholder="Describe the challenge in detail..."
            required
          />
        </div>

        <div>
          <label htmlFor="reward" className="block text-brown font-rye mb-1">
            Reward
          </label>
          <input
            id="reward"
            type="text"
            value={reward}
            onChange={(e) => setReward(e.target.value)}
            className="w-full p-2 border border-brown rounded bg-white text-gray-900 font-special-elite min-h-11"
            placeholder="Ex: 1 USDC"
            required
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-brown font-rye mb-1">
            Tag friends (optional)
          </label>
          <input
            id="tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full p-2 border border-brown rounded bg-white text-gray-900 font-special-elite min-h-11"
            placeholder="Ex: @friend1, @friend2"
          />
        </div>

        <div className="flex gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-rye px-4 py-2 rounded-lg transition-colors min-h-11"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-gold hover:bg-yellow-600 disabled:bg-gray-400 text-brown font-rye px-4 py-2 rounded-lg transition-colors min-h-11"
          >
            {isSubmitting ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

interface UploadProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  dareTitle: string;
  onUploadProof: (postUrl: string) => void;
}

export function UploadProofModal({ isOpen, onClose, dareTitle, onUploadProof }: UploadProofModalProps) {
  const [postUrl, setPostUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postUrl.trim()) {
      toast.error('Please enter a post URL');
      return;
    }

    // Basic URL validation for Farcaster/Base posts
    const urlPattern = /^https:\/\/(warpcast\.com\/|base\.org\/|basescan\.org\/tx\/|optimism\.beacon\.chain\/)/;
    if (!urlPattern.test(postUrl.trim())) {
      toast.error('Please enter a valid Farcaster or Base app post URL');
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onUploadProof(postUrl.trim());
      toast.success('Proof post submitted successfully!');
      setPostUrl('');
      onClose();
    } catch {
      toast.error('Error submitting the proof');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Submit proof for "${dareTitle}"`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Submit Proof Post</p>
                <p className="text-blue-700 dark:text-blue-300">Create a post on Farcaster (warpcast.com) or Base app showing you completed the challenge, then paste the URL below.</p>
              </div>
            </div>
          </div>

          <label htmlFor="proof-url" className="block text-brown font-rye mb-2">
            Farcaster/Base Post URL
          </label>
          <input
            id="proof-url"
            type="url"
            value={postUrl}
            onChange={(e) => setPostUrl(e.target.value)}
            className="w-full p-2 border border-brown rounded bg-white text-gray-900 font-special-elite min-h-11"
            placeholder="https://warpcast.com/username/0x..."
            required
          />
          <p className="text-xs text-brown mt-1 opacity-75">
            Example: https://warpcast.com/username/0x123456789... or Base app transaction URL
          </p>
        </div>

        <div className="flex gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-rye px-4 py-2 rounded-lg transition-colors min-h-11"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !postUrl.trim()}
            className="flex-1 bg-gold hover:bg-yellow-600 disabled:bg-gray-400 text-brown font-rye px-4 py-2 rounded-lg transition-colors min-h-11"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Proof'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
