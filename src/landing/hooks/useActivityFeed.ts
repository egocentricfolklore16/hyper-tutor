import { useEffect, useState } from 'react';
import { activityTemplates } from '../content';

export function useActivityFeed(interval = 2500) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setTick((value) => value + 1), interval);
    return () => window.clearInterval(timer);
  }, [interval]);
  return Array.from({ length: 8 }, (_, index) => activityTemplates[(index + tick) % activityTemplates.length]);
}
