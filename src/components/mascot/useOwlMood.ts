import { useEffect, useRef, useState } from 'react';

export type OwlMood = 'idle' | 'thinking' | 'happy';

export function useOwlMood(): { mood: OwlMood; happySequence: number } {
  const [mood, setMood] = useState<OwlMood>('idle');
  const [happySequence, setHappySequence] = useState(0);
  const thinkingRef = useRef(false);

  useEffect(() => {
    let happyTimer = 0;
    const onThinking = (event: Event) => {
      thinkingRef.current = (event as CustomEvent<{ active: boolean }>).detail.active;
      setMood(thinkingRef.current ? 'thinking' : 'idle');
    };
    const onHappy = () => {
      window.clearTimeout(happyTimer);
      setMood('happy');
      setHappySequence((sequence) => sequence + 1);
      happyTimer = window.setTimeout(() => {
        setMood(thinkingRef.current ? 'thinking' : 'idle');
      }, 800);
    };

    window.addEventListener('owl:thinking', onThinking);
    window.addEventListener('owl:happy', onHappy);
    return () => {
      window.removeEventListener('owl:thinking', onThinking);
      window.removeEventListener('owl:happy', onHappy);
      window.clearTimeout(happyTimer);
    };
  }, []);

  return { mood, happySequence };
}
