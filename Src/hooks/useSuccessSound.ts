import {useEffect, useRef, useState} from 'react';
import Sound from 'react-native-sound';

export const useSuccessSound = () => {
  const soundRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Sound.setCategory('Playback');

    // Try multiple formats in order of preference
    const tryFormats = ['success.mp3'];
    let currentIndex = 0;

    const loadSound = (filename: string) => {
      const sound = new Sound(filename, Sound.MAIN_BUNDLE, loadError => {
        if (loadError) {
          if (currentIndex < tryFormats.length - 1) {
            currentIndex++;
            sound.release();
            loadSound(tryFormats[currentIndex]);
          } else {
            setError('All audio formats failed to load');
            setIsLoaded(false);
          }
        } else {
          sound.setVolume(1.0);
          soundRef.current = sound;
          setIsLoaded(true);
          setError(null);
        }
      });
    };

    loadSound(tryFormats[currentIndex]);

    return () => {
      if (soundRef.current) {
        soundRef.current.release();
      }
    };
  }, []);

  const playSuccessSound = () => {
    if (!isLoaded || !soundRef.current || error) {
      return;
    }

    soundRef?.current.setCurrentTime(0);
    soundRef?.current.play((success: boolean) => {
      if (success) {
        console.info('Sound played successfully');
      } else {
        console.error('Playback failed');
      }
    });
  };

  return {playSuccessSound, isLoaded, error};
};
