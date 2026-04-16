import { useState, useEffect, useRef } from 'react';

type SceneDurations = Record<string, number>;

interface UseVideoPlayerOptions {
  durations: SceneDurations;
}

interface UseVideoPlayerResult {
  currentScene: number;
}

export function useVideoPlayer({ durations }: UseVideoPlayerOptions): UseVideoPlayerResult {
  const [currentScene, setCurrentScene] = useState(0);
  const sceneKeys = Object.keys(durations);
  const hasStarted = useRef(false);
  const hasFinished = useRef(false);

  useEffect(() => {
    if (!hasStarted.current) {
      hasStarted.current = true;
      (window as any).startRecording?.();
    }

    let sceneIndex = 0;
    let timeoutId: ReturnType<typeof setTimeout>;

    const advance = () => {
      if (sceneIndex < sceneKeys.length - 1) {
        sceneIndex++;
        setCurrentScene(sceneIndex);
        timeoutId = setTimeout(advance, durations[sceneKeys[sceneIndex]]);
      } else {
        if (!hasFinished.current) {
          hasFinished.current = true;
          (window as any).stopRecording?.();
        }
        timeoutId = setTimeout(() => {
          sceneIndex = 0;
          setCurrentScene(0);
          timeoutId = setTimeout(advance, durations[sceneKeys[0]]);
        }, durations[sceneKeys[sceneIndex]]);
      }
    };

    timeoutId = setTimeout(advance, durations[sceneKeys[0]]);

    return () => clearTimeout(timeoutId);
  }, []);

  return { currentScene };
}
