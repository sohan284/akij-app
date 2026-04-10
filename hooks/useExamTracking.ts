'use client';

import { useEffect, useState, useCallback } from 'react';

export function useExamTracking() {
  const [tabSwitches, setTabSwitches] = useState(0);
  const [fullscreenExits, setFullscreenExits] = useState(0);

  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      setTabSwitches(prev => prev + 1);
      // We'll use a standard alert if toast is not available, 
      // but I'll add sonner later. For now just track.
      console.warn('Tab switched detected!');
    }
  }, []);

  const handleFullscreenChange = useCallback(() => {
    if (!document.fullscreenElement) {
      setFullscreenExits(prev => prev + 1);
      console.warn('Fullscreen exit detected!');
    }
  }, []);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [handleVisibilityChange, handleFullscreenChange]);

  const enterFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    }
  };

  return { tabSwitches, fullscreenExits, enterFullscreen };
}
