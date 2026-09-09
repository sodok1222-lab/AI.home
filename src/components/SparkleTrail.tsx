'use client';

import { useEffect, useRef } from 'react';

type Sparkle = {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  alpha: number;
  decay: number;
  color: string;
  rotation: number;
};

export function SparkleTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas: HTMLCanvasElement = canvasRef.current;
 const ctx = canvas.getContext('2d')!;

  

    const sparkles: Sparkle[] = [];

    const colors = ['#8c98c4', '#eeeffc'];

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let mouseX = 0;
    let mouseY = 0;
    let lastX = 0;
    let lastY = 0;

    function createSparkle(x: number, y: number) {
      const color =
        colors[Math.floor(Math.random() * colors.length)];

      sparkles.push({
        x,
        y,
        size: Math.random() * 3 + 2,

        // 천천히 움직이도록 속도 조절
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: -Math.random() * 0.7 - 0.2,

        // 은은한 밝기
        alpha: Math.random() * 0.5 + 0.5,

        // 천천히 사라짐
        decay: Math.random() * 0.008 + 0.005,

        color,
        rotation: Math.random() * Math.PI,
      });
    }

    function handleMouseMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;

      const distance = Math.hypot(
        mouseX - lastX,
        mouseY - lastY
      );

      // 숫자가 클수록 반짝이가 적게 생성됨
      if (distance > 18) {
        createSparkle(mouseX, mouseY);

        lastX = mouseX;
        lastY = mouseY;
      }
    }

    window.addEventListener(
      'mousemove',
      handleMouseMove
    );

    function drawSparkle(sparkle: Sparkle) {
      ctx.save();

      ctx.globalAlpha = sparkle.alpha;

      ctx.translate(
        sparkle.x,
        sparkle.y
      );

      ctx.rotate(sparkle.rotation);

      // 반짝이 빛
      ctx.shadowBlur = 8;
      ctx.shadowColor = sparkle.color;
      ctx.fillStyle = sparkle.color;

      // ✨ 반짝이 모양
      ctx.beginPath();

      ctx.moveTo(
        0,
        -sparkle.size * 2.5
      );

      ctx.lineTo(
        sparkle.size * 0.5,
        -sparkle.size * 0.5
      );

      ctx.lineTo(
        sparkle.size * 2.5,
        0
      );

      ctx.lineTo(
        sparkle.size * 0.5,
        sparkle.size * 0.5
      );

      ctx.lineTo(
        0,
        sparkle.size * 2.5
      );

      ctx.lineTo(
        -sparkle.size * 0.5,
        sparkle.size * 0.5
      );

      ctx.lineTo(
        -sparkle.size * 2.5,
        0
      );

      ctx.lineTo(
        -sparkle.size * 0.5,
        -sparkle.size * 0.5
      );

      ctx.closePath();

      ctx.fill();

      ctx.restore();
    }

    function animate() {
      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      for (
        let i = sparkles.length - 1;
        i >= 0;
        i--
      ) {
        const sparkle = sparkles[i];

        // 천천히 이동
        sparkle.x += sparkle.speedX;
        sparkle.y += sparkle.speedY;

        // 천천히 사라짐
        sparkle.alpha -= sparkle.decay;

        // 아주 천천히 회전
        sparkle.rotation += 0.003;

        drawSparkle(sparkle);

        if (sparkle.alpha <= 0) {
          sparkles.splice(i, 1);
        }
      }

      requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener(
        'resize',
        resizeCanvas
      );

      window.removeEventListener(
        'mousemove',
        handleMouseMove
      );
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
}
