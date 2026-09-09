'use client';

import { useEffect } from 'react';

export default function ClickSound() {
  useEffect(() => {
    const playClick = () => {
      const AudioContext =
        window.AudioContext ||
        (window as typeof window & {
          webkitAudioContext?: typeof window.AudioContext;
        }).webkitAudioContext;

      if (!AudioContext) return;

      const ctx = new AudioContext();

      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(900, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        500,
        ctx.currentTime + 0.04
      );

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + 0.04
      );

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.04);

      setTimeout(() => {
        ctx.close();
      }, 100);
    };

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;

      if (!target) return;

      const button = target.closest('button, [role="button"]');

      if (button) {
        playClick();
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return null;
}
