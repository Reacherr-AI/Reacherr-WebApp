import { useRef, useState } from 'react';
// import { getRecordingUrl } from '../../api/client';
// This assumes 'Recording' is defined elsewhere, maybe in AgentForm or types
// We only need the recordingObjKey from it.
interface Recording {
  recordingObjKey: string;
}

interface AudioPlayerState {
  playing: boolean;
  playingId: string | number | null;
  togglePlay: (recordingObjKey: Recording, id: string | number) => Promise<void>;
  progress: number; // <-- 1. Expose progress
}

export const recordingAudioPlayer = (): AudioPlayerState => {
  const [playing, setPlaying] = useState(false);
  const [playingId, setPlayingId] = useState<string | number | null>(null);
  const [progress, setProgress] = useState(0); // <-- 2. Add progress state
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = async (recording: Recording, id: string | number) => {
    // 3. Create audio element and set up listeners ONCE
    if (!audioRef.current) {
      audioRef.current = new Audio();

      // On track end
      audioRef.current.onended = () => {
        setPlaying(false);
        setPlayingId(null);
        setProgress(0); // Reset progress
      };

      // On time update
      audioRef.current.ontimeupdate = () => {
        if (!audioRef.current) return;
        const { currentTime, duration } = audioRef.current;
        if (duration > 0) {
          const newProgress = (currentTime / duration) * 100;
          setProgress(newProgress);
        }
      };
    }

    // --- 4. Updated Play/Pause/Switch Logic ---

    // Case 1: Clicking the one that is currently playing (PAUSE)
    if (playing && playingId === id) {
      audioRef.current.pause();
      setPlaying(false);
      return;
    }

    // Case 2: Clicking the one that is paused (RESUME)
    if (!playing && playingId === id) {
      try {
        await audioRef.current.play();
        setPlaying(true);
      } catch (error) {
        console.error('Failed to resume audio:', error);
        // Reset all on failure
        setPlaying(false);
        setPlayingId(null);
        setProgress(0);
        throw error;
      }
      return;
    }

    // Case 3: Clicking a new track (or first track)
    // (This implies playingId !== id)
    if (audioRef.current.src) {
      audioRef.current.pause(); // Stop any previous track
    }

    const url = recording.recordingObjKey;

    try {
      // Load and play new track
      audioRef.current.src = url;
      setProgress(0); // Reset progress for new track
      await audioRef.current.play();
      setPlaying(true);
      setPlayingId(id); // Set the new active track
    } catch (error)
    {
      console.error('Failed to play new audio:', error);
      setPlaying(false);
      setPlayingId(null);
      setProgress(0);
      throw error;
    }
  };

  return { playing, playingId, togglePlay, progress }; // <-- 5. Return progress
};