import React, { useEffect, useRef } from 'react';

// Subtle matrix characters for unreadable background effect
const matrixChars = [
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
  'ア', 'イ', 'ウ', 'エ', 'オ', 'カ', 'キ', 'ク', 'ケ', 'コ',
  'サ', 'シ', 'ス', 'セ', 'ソ', 'タ', 'チ', 'ツ', 'テ', 'ト',
  '!', '@', '#', '$', '%', '^', '&', '*', '(', ')',
  '|', '\\', '/', '-', '+', '=', '~', '`', '[', ']'
];

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Matrix rain configuration - smaller, more frequent for subtle effect
    const fontSize = 12;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = new Array(columns).fill(0);

    // Initialize drops at random positions
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -500; // Start some drops off-screen
    }

    function draw() {
      // Create subtle trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        // Draw random matrix character
        const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];

        // Very subtle head character - dim white
        ctx.fillStyle = `rgba(255, 255, 255, 0.15)`;
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);

        // Very subtle green trail
        for (let j = 1; j < 6; j++) {
          const alpha = Math.max(0, 0.08 - (j * 0.015));
          ctx.fillStyle = `rgba(0, 255, 65, ${alpha})`;
          const trailChar = matrixChars[Math.floor(Math.random() * matrixChars.length)];
          ctx.fillText(trailChar, i * fontSize, (drops[i] - j) * fontSize);
        }

        // Move drop down slowly
        drops[i] += 0.8;

        // Reset drop when it goes off screen
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.98) {
          drops[i] = Math.random() * -100; // Reset to random off-screen position
        }
      }
    }

    // Start animation
    const interval = setInterval(draw, 50); // 20 FPS for smooth effect

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}
