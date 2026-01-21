// src/components/subcomponents/VoiceDropdown.tsx
import React from 'react';
import { Volume2, Pause, Play } from 'lucide-react';
import { VoiceDto } from '../AgentForm.types';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';

interface VoiceDropdownProps {
  voices: VoiceDto[];
  selectedVoice: VoiceDto;
  onSelect: (voice: VoiceDto) => void;
}

const VoiceDropdown: React.FC<VoiceDropdownProps> = ({ voices, selectedVoice, onSelect }) => {
  const { playing, playingId, togglePlay } = useAudioPlayer();

  return (
    <div className="space-y-2">
      <label className="text-gray-300 flex items-center gap-2 text-sm font-medium">
        <Volume2 size={16} />
        Agent Voice
      </label>
      <div className="flex items-center gap-4 relative">
        <select
          value={selectedVoice?.voiceId}
          onChange={(e) => {
            const voice = voices.find((v) => v.voiceId === e.target.value);
            if (voice) onSelect(voice);
          }}
          className="w-full bg-gray-800/60 text-gray-100 border border-gray-700 rounded-lg py-3 pl-4 pr-10
                     focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none 
                     appearance-none transition-all cursor-pointer"
        >
          {voices.map((voice) => (
            <option key={voice.voiceId} value={voice.voiceId} className="bg-gray-800/60 text-gray-100">
              {voice.speaker}
            </option>
          ))}
        </select>
        <svg
          className="absolute right-14 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m6 9 6 6 6-6"
          />
        </svg>
        <button
          type="button"
          onClick={() => togglePlay(selectedVoice, selectedVoice.voiceId)}
          className="text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!selectedVoice?.voiceId}
        >
          {playing && playingId === selectedVoice.voiceId ? (
            <Pause size={20} />
          ) : (
            <Play size={20} />
          )}
        </button>
      </div>
    </div>
  );
};

export default VoiceDropdown;