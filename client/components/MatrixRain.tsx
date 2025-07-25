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

    // Matrix rain configuration - optimized for performance
    const fontSize = 16; // Larger font for fewer columns
    const columns = Math.min(Math.floor(canvas.width / fontSize), 60); // Limit max columns
    const drops: number[] = new Array(columns).fill(0);

    // Initialize drops at random positions
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -200; // Shorter off-screen distance
    }

    function draw() {
      // Create subtle trail effect - less frequent clearing for performance
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      // Process only every other column for performance
      for (let i = 0; i < drops.length; i += Math.random() > 0.7 ? 2 : 1) {
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Skip if off-screen
        if (y < -fontSize || y > canvas.height + fontSize) {
          drops[i] += 1.2;
          continue;
        }

        // Draw random matrix character - single char only for performance
        const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];

        // Very subtle head character
        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.fillText(char, x, y);

        // Simplified trail - only 2 trail chars for performance
        if (Math.random() > 0.6) { // Don't draw trail for every column
          ctx.fillStyle = 'rgba(0, 255, 65, 0.06)';
          const trailChar = matrixChars[Math.floor(Math.random() * matrixChars.length)];
          ctx.fillText(trailChar, x, y - fontSize);

          ctx.fillStyle = 'rgba(0, 255, 65, 0.03)';
          ctx.fillText(matrixChars[Math.floor(Math.random() * matrixChars.length)], x, y - fontSize * 2);
        }

        // Move drop down
        drops[i] += 1.2;

        // Reset drop when it goes off screen
        if (drops[i] * fontSize > canvas.height + 50) {
          drops[i] = Math.random() * -50;
        }
      }
    }

    // Start animation - slower for subtle background effect
    const interval = setInterval(draw, 80); // 12.5 FPS for subtle effect

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
      style={{ zIndex: 1 }}
    />
  );
}
