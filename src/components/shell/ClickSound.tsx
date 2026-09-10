'use client';

import { useEffect, useRef } from 'react';

export function ClickSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio('/sounds/click.mp3');

    // 효과음을 미리 불러옵니다.
    audio.preload = 'auto';

    // 소리 크기
    audio.volume = 0.95;

    audioRef.current = audio;

    const handleClick = () => {
      const sound = audioRef.current;

      if (!sound) return;

      // 빠르게 여러 번 클릭해도 매번 처음부터 재생
      sound.currentTime = 0;

      void sound.play().catch(() => {
        // 브라우저가 재생을 막는 경우 조용히 무시
      });
    };

    // 실제 click 이벤트를 전체 화면에서 감지
    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);

      audio.pause();
      audio.currentTime = 0;
      audioRef.current = null;
    };
  }, []);

  return null;
}
