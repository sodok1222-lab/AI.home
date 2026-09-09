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

  // ==========================================
  // 1. 핵심 "딸깍!" 충격음
  // ==========================================

  const clickBuffer = ctx.createBuffer(
    1,
    Math.floor(ctx.sampleRate * 0.035),
    ctx.sampleRate
  );

  const clickData = clickBuffer.getChannelData(0);

  for (let i = 0; i < clickData.length; i++) {
    const t = i / clickData.length;

    // 처음 순간을 강하게 만들고 빠르게 사라지는 노이즈
    const envelope = Math.pow(1 - t, 7);

    clickData[i] =
      (Math.random() * 2 - 1) *
      envelope *
      0.9;
  }

  const click = ctx.createBufferSource();
  const clickGain = ctx.createGain();
  const clickFilter = ctx.createBiquadFilter();

  click.buffer = clickBuffer;

  // 청축 특유의 날카로운 고주파
  clickFilter.type = 'bandpass';
  clickFilter.frequency.setValueAtTime(4200, now);
  clickFilter.Q.setValueAtTime(1.1, now);

  clickGain.gain.setValueAtTime(0.85, now);
  clickGain.gain.exponentialRampToValueAtTime(
    0.001,
    now + 0.035
  );

  click.connect(clickFilter);
  clickFilter.connect(clickGain);
  clickGain.connect(ctx.destination);

  click.start(now);


  // ==========================================
  // 2. "톡" 하고 플라스틱이 부딪히는 저음
  // ==========================================

  const thockBuffer = ctx.createBuffer(
    1,
    Math.floor(ctx.sampleRate * 0.045),
    ctx.sampleRate
  );

  const thockData = thockBuffer.getChannelData(0);

  for (let i = 0; i < thockData.length; i++) {
    const t = i / thockData.length;
    const envelope = Math.pow(1 - t, 5);

    thockData[i] =
      (Math.random() * 2 - 1) *
      envelope *
      0.5;
  }

  const thock = ctx.createBufferSource();
  const thockGain = ctx.createGain();
  const thockFilter = ctx.createBiquadFilter();

  thock.buffer = thockBuffer;

  thockFilter.type = 'lowpass';
  thockFilter.frequency.setValueAtTime(1200, now);
  thockFilter.Q.setValueAtTime(0.7, now);

  thockGain.gain.setValueAtTime(0.42, now);
  thockGain.gain.exponentialRampToValueAtTime(
    0.001,
    now + 0.045
  );

  thock.connect(thockFilter);
  thockFilter.connect(thockGain);
  thockGain.connect(ctx.destination);

  thock.start(now);


  // ==========================================
  // 3. 청축 스위치의 금속성 "찰칵" 잔향
  // ==========================================

  const metal = ctx.createOscillator();
  const metalGain = ctx.createGain();
  const metalFilter = ctx.createBiquadFilter();

  metal.type = 'triangle';

  metal.frequency.setValueAtTime(3800, now);
  metal.frequency.exponentialRampToValueAtTime(
    2100,
    now + 0.018
  );

  metalFilter.type = 'highpass';
  metalFilter.frequency.setValueAtTime(1800, now);

  metalGain.gain.setValueAtTime(0.12, now);
  metalGain.gain.exponentialRampToValueAtTime(
    0.001,
    now + 0.028
  );

  metal.connect(metalFilter);
  metalFilter.connect(metalGain);
  metalGain.connect(ctx.destination);

  metal.start(now);
  metal.stop(now + 0.03);
}


// ==========================================
// 실제 화면 클릭을 감지
// ==========================================

export default function ClickSound() {
  useEffect(() => {
    const handleClick = () => {
      playMechanicalClick();
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return null;
}
