import { useState, useEffect } from 'react';
import { toast } from 'sonner';

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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      onCreateDare({ title: title.trim(), description: description.trim(), reward: reward.trim() });
      toast.success('Challenge created successfully!');
      setTitle('');
      setDescription('');
      setReward('');
      onClose();
    } catch {
      toast.error('Error creating the challenge');
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
            className="w-full p-2 border border-brown rounded bg-white text-brown font-special-elite min-h-11"
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
            className="w-full p-2 border border-brown rounded bg-white text-brown font-special-elite min-h-20 resize-none"
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
            className="w-full p-2 border border-brown rounded bg-white text-brown font-special-elite min-h-11"
            placeholder="Ex: 0.01 ETH"
            required
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
  onUploadProof: (file: File) => void;
}

export function UploadProofModal({ isOpen, onClose, dareTitle, onUploadProof }: UploadProofModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setIsUploading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      onUploadProof(file);
      toast.success('Proof submitted successfully!');
      setFile(null);
      onClose();
    } catch {
      toast.error('Error sending the proof');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('The file must not exceed 10MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Submit proof for "${dareTitle}"`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="proof-file" className="block text-brown font-rye mb-2">
            Select your proof (image/video)
          </label>
          <input
            id="proof-file"
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="w-full p-2 border border-brown rounded bg-white text-brown font-special-elite min-h-11"
            required
          />
          {file && (
            <p className="text-sm text-brown mt-1">
              Selected file: {file.name}
            </p>
          )}
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
            disabled={isUploading || !file}
            className="flex-1 bg-gold hover:bg-yellow-600 disabled:bg-gray-400 text-brown font-rye px-4 py-2 rounded-lg transition-colors min-h-11"
          >
            {isUploading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
