import React, { useEffect, useRef } from 'react';

// Educational cybersecurity messages in leet speak
const educationalMessages = [
  // Basic Security Concepts
  'u53 57r0ng p455w0rd5',        // use strong passwords
  'up d473 y0ur 5y573m',         // update your system
  '3n4bl3 2f4 4u7h',            // enable 2fa auth
  'd0n7 cl1ck 5u5 l1nk5',       // don't click sus links
  'k33p 50f7w4r3 up d473d',     // keep software updated
  
  // Penetration Testing Terms
  'p0r7 5c4nn1ng 4c71v3',       // port scanning active
  '5ql 1nj3c710n f0und',        // sql injection found
  'x55 vulner4b1l17y',          // xss vulnerability
  'pr1v353 35c4l4710n',         // privesc escalation
  'r3v3r53 5h3ll 3574bl15h3d',  // reverse shell established
  
  // Security Tools
  'nm4p 5c4n c0mpl373',         // nmap scan complete
  'bUrp 5u173 pr0xy',           // burp suite proxy
  'm374sp10l7 3xpl017',         // metasploit exploit
  'w1r35h4rk c4p7ur3',          // wireshark capture
  'j0hn 7h3 r1pp3r crck',       // john the ripper crack
  
  // Network Security
  'f1r3w4ll byp455',            // firewall bypass
  'n37w0rk 1n7ru510n',          // network intrusion
  'p4ck37 5n1ff1ng',            // packet sniffing
  'm17m 4774ck d373c73d',       // mitm attack detected
  'dn5 p0150n1ng',              // dns poisoning
  
  // Web Security
  'cr055 5173 5cr1p71ng',       // cross site scripting
  'c5rf 4774ck v3c70r',         // csrf attack vector
  'c0mm4nd 1nj3c710n',          // command injection
  'f1l3 upl04d byp455',         // file upload bypass
  'd1r3c70ry 7r4v3r54l',        // directory traversal
  
  // Crypto & Forensics
  'h45h cr4ck1ng',              // hash cracking
  'd474 3xf1l7r4710n',          // data exfiltration
  'k3yl0gg3r d373c73d',         // keylogger detected
  'r0077k17 1n574ll3d',         // rootkit installed
  '5734g4n0gr4phy h1dd3n'       // steganography hidden
];

const matrixChars = [
  '0', '1', 'A', 'B', 'C', 'D', 'E', 'F',
  'ア', 'カ', 'サ', 'タ', 'ナ', 'ハ', 'マ', 'ヤ',
  '!', '@', '#', '$', '%', '^', '&', '*',
  '|', '\\', '/', '-', '+', '=', '~', '`'
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

    // Matrix rain configuration
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = new Array(columns).fill(0);
    const messageColumns: boolean[] = new Array(columns).fill(false);
    const currentMessages: string[] = new Array(columns).fill('');
    const messageProgress: number[] = new Array(columns).fill(0);

    // Initialize some columns as message columns
    for (let i = 0; i < columns; i++) {
      if (Math.random() < 0.08) { // 8% chance for message column
        messageColumns[i] = true;
        currentMessages[i] = educationalMessages[Math.floor(Math.random() * educationalMessages.length)];
      }
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
