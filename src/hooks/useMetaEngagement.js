import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { customEvent } from '../lib/fpixel';

const TIME_MILESTONES = [15, 30, 60, 120, 300];
const SCROLL_MILESTONES = [25, 50, 75, 90];

export default function useMetaEngagement() {
  const router = useRouter();
  const timeAccruedRef = useRef(0);
  const firedTimeMilestonesRef = useRef(new Set());
  const firedScrollMilestonesRef = useRef(new Set());

  useEffect(() => {
    // Reset milestones on route change
    timeAccruedRef.current = 0;
    firedTimeMilestonesRef.current.clear();
    firedScrollMilestonesRef.current.clear();

    const path = router.asPath;
    let timerId = null;

    // 1. Time Engagement Tracker (Active Time Only)
    const tick = () => {
      if (document.visibilityState === 'visible') {
        timeAccruedRef.current += 1;
        const currentSeconds = timeAccruedRef.current;

        TIME_MILESTONES.forEach((seconds) => {
          if (currentSeconds >= seconds && !firedTimeMilestonesRef.current.has(seconds)) {
            firedTimeMilestonesRef.current.add(seconds);
            
            // Fire custom Meta Pixel time event
            customEvent(`TimeSpent_${seconds}s`, {
              seconds,
              path,
            });

            // Fire audience quality segment events
            if (seconds === 30) {
              customEvent('EngagedVisitor', { path, timeOnPage: 30 });
            } else if (seconds === 60) {
              customEvent('HighEngagementVisitor', { path, timeOnPage: 60 });
            }
          }
        });
      }
    };

    timerId = setInterval(tick, 1000);

    // 2. Scroll Depth Tracker
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollPercent = Math.min(100, Math.round((scrollTop / docHeight) * 100));

      SCROLL_MILESTONES.forEach((milestone) => {
        if (scrollPercent >= milestone && !firedScrollMilestonesRef.current.has(milestone)) {
          firedScrollMilestonesRef.current.add(milestone);

          customEvent(`ScrollDepth_${milestone}`, {
            percentage: milestone,
            path,
          });
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      if (timerId) clearInterval(timerId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [router.asPath]);
}
