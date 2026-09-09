'use client';

import { useEffect } from 'react';

let audioContext: AudioContext | null = null;

function getAudioContext() {
  if (!audioContext) {
    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & {
        webkitAudioContext?: typeof AudioContext;
      }).webkitAudioContext;

    if (!AudioContextClass) return null;

    audioContext = new AudioContextClass();
  }

  return audioContext;
}

function playMechanicalClick() {
  const ctx = getAudioContext();

  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const now = ctx.currentTime;

  // -----------------------------
  // 1. 청축의 "딸깍" 하는 높은 클릭음
  // -----------------------------
  const clickOscillator = ctx.createOscillator();
  const clickGain = ctx.createGain();

  clickOscillator.type = 'square';

  clickOscillator.frequency.setValueAtTime(1800, now);
  clickOscillator.frequency.exponentialRampToValueAtTime(
    850,
    now + 0.025
  );

  clickGain.gain.setValueAtTime(0.22, now);
  clickGain.gain.exponentialRampToValueAtTime(
    0.001,
    now + 0.045
  );

  clickOscillator.connect(clickGain);
  clickGain.connect(ctx.destination);

  clickOscillator.start(now);
  clickOscillator.stop(now + 0.05);

  // -----------------------------
  // 2. 키보드 스위치가 바닥에 닿는
  //    "톡" 하는 저음
  // -----------------------------
  const bottomOscillator = ctx.createOscillator();
  const bottomGain = ctx.createGain();

  bottomOscillator.type = 'triangle';

  bottomOscillator.frequency.setValueAtTime(230, now);
  bottomOscillator.frequency.exponentialRampToValueAtTime(
    90,
    now + 0.035
  );

  bottomGain.gain.setValueAtTime(0.16, now);
  bottomGain.gain.exponentialRampToValueAtTime(
    0.001,
    now + 0.055
  );

  bottomOscillator.connect(bottomGain);
  bottomGain.connect(ctx.destination);

  bottomOscillator.start(now);
  bottomOscillator.stop(now + 0.06);

  // -----------------------------
  // 3. 아주 짧은 노이즈를 섞어서
  //    실제 스위치의 "찰칵" 느낌 추가
  // -----------------------------
  const bufferSize = Math.floor(ctx.sampleRate * 0.025);
  const buffer = ctx.createBuffer(
    1,
    bufferSize,
    ctx.sampleRate
  );

  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.35;
  }

  const noise = ctx.createBufferSource();
  const noiseGain = ctx.createGain();

  noise.buffer = buffer;

  noiseGain.gain.setValueAtTime(0.12, now);
  noiseGain.gain.exponentialRampToValueAtTime(
    0.001,
    now + 0.025
  );

  noise.connect(noiseGain);
  noiseGain.connect(ctx.destination);

  noise.start(now);
}

export default function ClickSound() {
  useEffect(() => {
    const handleClick = () => {
      playMechanicalClick();
    };

    // 화면에서 실제 클릭이 발생할 때 감지
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return null;
}
