import React, { useEffect, useRef, useState } from 'react';

// Cybersecurity-themed character sets
const cyberCharsets = {
  binary: ['0', '1'],
  hex: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'],
  katakana: ['ア', 'カ', 'サ', 'タ', 'ナ', 'ハ', 'マ', 'ヤ', 'ラ', 'ワ', 'ガ', 'ザ', 'ダ', 'バ', 'パ'],
  symbols: ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '+', '=', '{', '}', '[', ']', '|', '\\', ':', ';', '"', "'", '<', '>', ',', '.', '?', '/'],
  commands: ['ls', 'cd', 'rm', 'su', 'id', 'ps', 'nc', 'sh'],
  protocols: ['TCP', 'UDP', 'SSH', 'FTP', 'SQL', 'XSS', 'XXE', 'RCE']
};

// Cybersecurity coded messages that randomly appear
const codedMessages = [
  'BREACH_DETECTED',
  'INTRUSION_ALERT',
  'FIREWALL_BYPASSED',
  'ROOT_ACCESS_GRANTED',
  'PAYLOAD_DEPLOYED',
  'SHELL_ESTABLISHED',
  'ENCRYPTION_BROKEN',
  'BACKDOOR_ACTIVE',
  'PRIVILEGE_ESCALATED',
  'NETWORK_COMPROMISED',
  'ZERO_DAY_EXPLOITED',
  'SQL_INJECTION_SUCCESS',
  'XSS_VECTOR_FOUND',
  'BUFFER_OVERFLOW',
  'REVERSE_SHELL_ACTIVE',
  'CREDENTIALS_HARVESTED',
  'LATERAL_MOVEMENT',
  'PERSISTENCE_ESTABLISHED',
  'DATA_EXFILTRATION',
  'CLEANUP_INITIATED'
];

interface MatrixColumn {
  x: number;
  y: number;
  speed: number;
  chars: string[];
  isMessage: boolean;
  messageIndex: number;
  charIndex: number;
  opacity: number;
  length: number;
}

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [columns, setColumns] = useState<MatrixColumn[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize columns
    const columnWidth = 20;
    const numColumns = Math.floor(canvas.width / columnWidth);
    const initialColumns: MatrixColumn[] = [];

    for (let i = 0; i < numColumns; i++) {
      const isMessage = Math.random() < 0.05; // 5% chance for coded message
      initialColumns.push({
        x: i * columnWidth,
        y: Math.random() * canvas.height,
        speed: Math.random() * 2 + 1,
        chars: isMessage ? [] : getRandomChars(),
        isMessage,
        messageIndex: isMessage ? Math.floor(Math.random() * codedMessages.length) : 0,
        charIndex: 0,
        opacity: Math.random() * 0.8 + 0.2,
        length: Math.random() * 20 + 10
      });
    }

    setColumns(initialColumns);

    function getRandomChars(): string[] {
      const charsetKeys = Object.keys(cyberCharsets) as (keyof typeof cyberCharsets)[];
      const randomCharset = cyberCharsets[charsetKeys[Math.floor(Math.random() * charsetKeys.length)]];
      return Array.from({ length: 20 }, () => 
        randomCharset[Math.floor(Math.random() * randomCharset.length)]
      );
    }

    function animate() {
      if (!ctx || !canvas) return;

      // Clear canvas with slight trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw columns
      columns.forEach((column, index) => {
        // Update position
        column.y += column.speed;

        // Reset column when it goes off screen
        if (column.y > canvas.height + 100) {
          column.y = -100;
          column.x = index * columnWidth;
          column.isMessage = Math.random() < 0.05; // 5% chance for new message
          if (column.isMessage) {
            column.messageIndex = Math.floor(Math.random() * codedMessages.length);
            column.charIndex = 0;
            column.chars = [];
          } else {
            column.chars = getRandomChars();
          }
          column.opacity = Math.random() * 0.8 + 0.2;
          column.length = Math.random() * 20 + 10;
        }

        // Draw column
        if (column.isMessage) {
          drawMessageColumn(ctx, column);
        } else {
          drawCharColumn(ctx, column);
        }
      });

      requestAnimationFrame(animate);
    }

    function drawMessageColumn(ctx: CanvasRenderingContext2D, column: MatrixColumn) {
      const message = codedMessages[column.messageIndex];
      const fontSize = 14;
      
      ctx.font = `${fontSize}px 'Courier New', monospace`;
      ctx.textAlign = 'center';

      for (let i = 0; i < column.length; i++) {
        const y = column.y - i * fontSize;
        if (y < -fontSize || y > canvas!.height + fontSize) continue;

        const charOpacity = Math.max(0, column.opacity - (i * 0.05));
        
        if (i === 0) {
          // Head character - bright white
          ctx.fillStyle = `rgba(255, 255, 255, ${charOpacity})`;
        } else if (i < 5) {
          // Recent characters - bright green
          ctx.fillStyle = `rgba(0, 255, 0, ${charOpacity})`;
        } else {
          // Tail characters - dim green
          ctx.fillStyle = `rgba(0, 255, 0, ${charOpacity * 0.5})`;
        }

        // Display message characters sequentially
        const charIndex = (column.charIndex + i) % message.length;
        const char = message[charIndex];
        
        ctx.fillText(char, column.x + 10, y);
      }

      // Advance message
      column.charIndex = (column.charIndex + 0.1) % message.length;
    }

    function drawCharColumn(ctx: CanvasRenderingContext2D, column: MatrixColumn) {
      const fontSize = 14;
      
      ctx.font = `${fontSize}px 'Courier New', monospace`;
      ctx.textAlign = 'center';

      for (let i = 0; i < column.length; i++) {
        const y = column.y - i * fontSize;
        if (y < -fontSize || y > canvas!.height + fontSize) continue;

        const charOpacity = Math.max(0, column.opacity - (i * 0.05));
        
        if (i === 0) {
          // Head character - bright white
          ctx.fillStyle = `rgba(255, 255, 255, ${charOpacity})`;
        } else if (i < 3) {
          // Recent characters - bright green
          ctx.fillStyle = `rgba(0, 255, 65, ${charOpacity})`;
        } else {
          // Tail characters - dim green
          ctx.fillStyle = `rgba(0, 255, 65, ${charOpacity * 0.6})`;
        }

        // Random character from the column's charset
        const char = column.chars[i % column.chars.length];
        ctx.fillText(char, column.x + 10, y);

        // Occasionally change characters for dynamic effect
        if (Math.random() < 0.005) {
          const charsetKeys = Object.keys(cyberCharsets) as (keyof typeof cyberCharsets)[];
          const randomCharset = cyberCharsets[charsetKeys[Math.floor(Math.random() * charsetKeys.length)]];
          column.chars[i] = randomCharset[Math.floor(Math.random() * randomCharset.length)];
        }
      }
    }

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{
        width: '100%',
        height: '100%',
        zIndex: 1
      }}
    />
  );
}
