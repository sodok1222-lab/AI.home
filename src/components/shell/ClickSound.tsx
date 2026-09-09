'use client';

import { useEffect, useRef } from 'react';

export function ClickSound() {
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const playClick = () => {
      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }).webkitAudioContext;

      if (!AudioContextClass) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextClass();
      }

      const ctx = audioContextRef.current;

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // ==============================
      // 청축 키보드의 "달칵" 소리
      // 음정이 있는 소리는 사용하지 않음
      // ==============================

      // 아주 짧은 클릭용 노이즈
      const bufferSize = Math.floor(ctx.sampleRate * 0.035);
      const buffer = ctx.createBuffer(
        1,
        bufferSize,
        ctx.sampleRate
      );

      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        // 초반은 강하고 빠르게 사라지는 노이즈
        const envelope = Math.exp(-i / (ctx.sampleRate * 0.004));
        data[i] = (Math.random() * 2 - 1) * envelope;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // 키캡의 날카로운 "찰칵" 부분
      const highpass = ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.value = 1800;
      highpass.Q.value = 0.7;

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 6500;
      lowpass.Q.value = 0.5;

      // 소리 크기
      const gain = ctx.createGain();

      gain.gain.setValueAtTime(0.0, now);
      gain.gain.linearRampToValueAtTime(0.95, now + 0.001);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        now + 0.028
      );

      noise.connect(highpass);
      highpass.connect(lowpass);
      lowpass.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 0.035);

      // ==============================
      // 아주 짧은 "키캡 충돌" 임펄스
      // ==============================

      const clickBuffer = ctx.createBuffer(
        1,
        Math.floor(ctx.sampleRate * 0.008),
        ctx.sampleRate
      );

      const clickData = clickBuffer.getChannelData(0);

      for (let i = 0; i < clickData.length; i++) {
        const envelope = Math.exp(
          -i / (ctx.sampleRate * 0.0012)
        );

        clickData[i] =
          (Math.random() * 2 - 1) *
          envelope *
          0.8;
      }

      const click = ctx.createBufferSource();
      click.buffer = clickBuffer;

      const clickFilter = ctx.createBiquadFilter();
      clickFilter.type = 'bandpass';
      clickFilter.frequency.value = 3200;
      clickFilter.Q.value = 0.9;

      const clickGain = ctx.createGain();

      clickGain.gain.setValueAtTime(0.75, now);
      clickGain.gain.exponentialRampToValueAtTime(
        0.001,
        now + 0.009
      );

      click.connect(clickFilter);
      clickFilter.connect(clickGain);
      clickGain.connect(ctx.destination);

      click.start(now);
      click.stop(now + 0.01);
    };

    // 버튼뿐 아니라 실제 "클릭"되는 UI를 기준으로 작동
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;

      if (!target) return;

      const clickable = target.closest(
        'button, a, [role="button"], input, select, textarea, summary'
      );

      if (!clickable) return;

      playClick();
    };

    document.addEventListener(
      'pointerdown',
      handlePointerDown,
      true
    );

    return () => {
      document.removeEventListener(
        'pointerdown',
        handlePointerDown,
        true
      );
    };
  }, []);

  return null;
}
