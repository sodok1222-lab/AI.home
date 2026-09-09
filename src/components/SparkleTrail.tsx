'use client';

import { useEffect, useRef } from 'react';

export default function SparkleTrail() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const sparkles: {
            x: number;
            y: number;
            size: number;
            speedX: number;
            speedY: number;
            alpha: number;
            decay: number;
            color: string;
            twinkle: number;
            twinkleSpeed: number;
            wave: number;
        }[] = [];

        const colors = ['#8c98c4', '#eeeffc'];

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        function createSparkle(x: number, y: number) {
            sparkles.push({
                x,
                y,
                size: Math.random() * 2.5 + 1,

                // 천천히 움직이는 속도
                speedX: Math.random() * 0.6 - 0.3,
                speedY: Math.random() * -0.8 - 0.2,

                alpha: 1,

                // 천천히 사라짐
                decay: Math.random() * 0.008 + 0.004,

                // 두 가지 색상 중 랜덤
                color: colors[Math.floor(Math.random() * colors.length)],

                // 반짝임
                twinkle: Math.random() * Math.PI * 2,
                twinkleSpeed: Math.random() * 0.08 + 0.03,

                // 좌우 흔들림
                wave: Math.random() * Math.PI * 2
            });
        }

        function handleMouseMove(e: MouseEvent) {
            // 반짝이가 너무 많이 생기지 않도록 70% 확률
            if (Math.random() < 0.7) {
                createSparkle(e.clientX, e.clientY);
            }
        }

        window.addEventListener('mousemove', handleMouseMove);

        function animate() {
            ctx.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );

            for (let i = sparkles.length - 1; i >= 0; i--) {
                const sparkle = sparkles[i];

                // 천천히 이동
                sparkle.x += sparkle.speedX;
                sparkle.y += sparkle.speedY;

                // 살짝 좌우로 흔들림
                sparkle.wave += 0.02;
                sparkle.x += Math.sin(sparkle.wave) * 0.15;

                // 천천히 사라짐
                sparkle.alpha -= sparkle.decay;

                // 조금씩 작아짐
                if (sparkle.size > 0.2) {
                    sparkle.size -= 0.015;
                }

                // 반짝반짝
                sparkle.twinkle += sparkle.twinkleSpeed;

                const twinkleAlpha =
                    sparkle.alpha *
                    (0.65 + Math.sin(sparkle.twinkle) * 0.35);

                ctx.save();

                ctx.globalAlpha = twinkleAlpha;

                // 은은한 빛
                ctx.shadowBlur = 10;
                ctx.shadowColor = sparkle.color;

                // ✨ 반짝이 모양
                ctx.beginPath();

                ctx.moveTo(
                    sparkle.x,
                    sparkle.y - sparkle.size * 3
                );

                ctx.lineTo(
                    sparkle.x + sparkle.size * 0.7,
                    sparkle.y - sparkle.size * 0.7
                );

                ctx.lineTo(
                    sparkle.x + sparkle.size * 3,
                    sparkle.y
                );

                ctx.lineTo(
                    sparkle.x + sparkle.size * 0.7,
                    sparkle.y + sparkle.size * 0.7
                );

                ctx.lineTo(
                    sparkle.x,
                    sparkle.y + sparkle.size * 3
                );

                ctx.lineTo(
                    sparkle.x - sparkle.size * 0.7,
                    sparkle.y + sparkle.size * 0.7
                );

                ctx.lineTo(
                    sparkle.x - sparkle.size * 3,
                    sparkle.y
                );

                ctx.lineTo(
                    sparkle.x - sparkle.size * 0.7,
                    sparkle.y - sparkle.size * 0.7
                );

                ctx.closePath();

                ctx.fillStyle = sparkle.color;
                ctx.fill();

                ctx.restore();

                // 수명이 끝난 반짝이 삭제
                if (
                    sparkle.alpha <= 0 ||
                    sparkle.size <= 0.2
                ) {
                    sparkles.splice(i, 1);
                }
            }

            requestAnimationFrame(animate);
        }

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: 'none',
                zIndex: 9999
            }}
        />
    );
}
