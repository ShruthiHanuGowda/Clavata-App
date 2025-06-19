import React, { useEffect, useRef } from 'react';
import Sound from 'react-native-sound';


export const useSuccessSound = () => {
  const soundRef = useRef<any>(null);


  useEffect(() => {
    Sound.setCategory('Playback');
    soundRef.current = new Sound('success.mp3', Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('Failed to load the sound', error);
      }
    });

    return () => {
      if (soundRef.current) {
        soundRef.current.release();
      }
    };
  }, []);

  const playSuccessSound = () => {
    if (soundRef.current) {
      soundRef.current.play((success: boolean) => {
        if (!success) {
          console.log('Sound playback failed');
        }
      });
    }
  };

  return { playSuccessSound };
};