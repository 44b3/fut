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
      // Create trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0f0'; // Matrix green
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        if (messageColumns[i] && currentMessages[i]) {
          // Draw educational message
          const message = currentMessages[i];
          const charIndex = Math.floor(messageProgress[i]) % message.length;
          const char = message[charIndex];
          
          // Bright white for message head
          ctx.fillStyle = '#fff';
          ctx.fillText(char, i * fontSize, drops[i] * fontSize);
          
          // Green for message tail
          ctx.fillStyle = '#0f0';
          for (let j = 1; j < 6; j++) {
            const prevCharIndex = (Math.floor(messageProgress[i]) - j + message.length) % message.length;
            const prevChar = message[prevCharIndex];
            const alpha = 1 - (j * 0.15);
            ctx.fillStyle = `rgba(0, 255, 0, ${alpha})`;
            ctx.fillText(prevChar, i * fontSize, (drops[i] - j) * fontSize);
          }
          
          messageProgress[i] += 0.1;
        } else {
          // Draw random matrix characters
          const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
          
          // Bright character at head
          ctx.fillStyle = '#fff';
          ctx.fillText(char, i * fontSize, drops[i] * fontSize);
          
          // Fading trail
          for (let j = 1; j < 8; j++) {
            const alpha = 1 - (j * 0.12);
            ctx.fillStyle = `rgba(0, 255, 0, ${alpha})`;
            const trailChar = matrixChars[Math.floor(Math.random() * matrixChars.length)];
            ctx.fillText(trailChar, i * fontSize, (drops[i] - j) * fontSize);
          }
        }

        // Move drop down
        drops[i]++;

        // Reset drop when it goes off screen
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
          
          // Maybe switch to/from message mode
          if (Math.random() < 0.1) {
            messageColumns[i] = !messageColumns[i];
            if (messageColumns[i]) {
              currentMessages[i] = educationalMessages[Math.floor(Math.random() * educationalMessages.length)];
              messageProgress[i] = 0;
            }
          }
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
