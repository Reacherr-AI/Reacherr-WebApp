import { useState, useRef } from 'react';
import { getVoiceUrl } from '@/api/client';
import { VoiceDto } from '../components/AgentForm';

interface AudioPlayerState {
  playing: boolean;
  playingId: string | number | null;
  isLoading: boolean; // New state for better UX
  togglePlay: (voice: VoiceDto, id: string | number) => Promise<void>;
}

export const useAudioPlayer = (): AudioPlayerState => {
  const [playing, setPlaying] = useState(false);
  const [playingId, setPlayingId] = useState<string | number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = async (voice: VoiceDto, id: string | number) => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.onended = () => {
        setPlaying(false);
        setPlayingId(null);
      };
    }

    if (playing && playingId === id) {
      audioRef.current.pause();
      setPlaying(false);
      setPlayingId(null);
      return;
    }

    setIsLoading(true);
    setPlayingId(id);

    try {
      // Use temporary URL if no previewUrl or API response
      let url = voice.previewUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
      if (!url) {
        const response = await getVoiceUrl(voice.voiceId);
        url = response.data.url;
        voice.previewUrl = url; 
      }
      audioRef.current.pause();
      audioRef.current.src = url;
      await audioRef.current.play();
      
      setPlaying(true);
    } catch (error) {
      console.error('Audio playback failed:', error);
      setPlaying(false);
      setPlayingId(null);
    } finally {
      setIsLoading(false);
    }
  };

  return { playing, playingId, isLoading, togglePlay };
};