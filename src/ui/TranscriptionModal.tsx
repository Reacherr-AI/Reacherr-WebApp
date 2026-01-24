import React from 'react';
import { X } from 'lucide-react';

interface TranscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transcription: string;
}

const TranscriptionModal: React.FC<TranscriptionModalProps> = ({ isOpen, onClose, transcription }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-surface-secondary p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-primary-text"></h2>
          <button
            onClick={onClose}
            className="text-secondary-text hover:text-primary-text transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="overflow-y-auto pr-4">
          <p className="text-base text-primary-text whitespace-pre-wrap">
            {transcription}
          </p>
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="bg-primary-accent hover:bg-primary-accent/80 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TranscriptionModal;