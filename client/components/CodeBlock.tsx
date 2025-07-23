import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

export function CodeBlock({ code, language = 'text', filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple syntax highlighting for common languages
  const highlightCode = (code: string, lang: string) => {
    if (lang === 'javascript' || lang === 'js') {
      return code
        .replace(/(function|const|let|var|if|else|for|while|return|import|export|class|extends)/g, 
          '<span class="text-purple-400 font-semibold">$1</span>')
        .replace(/('.*?'|".*?")/g, '<span class="text-green-400">$1</span>')
        .replace(/(\/\/.*$)/gm, '<span class="text-gray-500 italic">$1</span>')
        .replace(/(\d+)/g, '<span class="text-blue-400">$1</span>');
    }
    
    if (lang === 'python' || lang === 'py') {
      return code
        .replace(/(def|class|if|elif|else|for|while|import|from|return|try|except|with|as)/g, 
          '<span class="text-purple-400 font-semibold">$1</span>')
        .replace(/('.*?'|".*?")/g, '<span class="text-green-400">$1</span>')
        .replace(/(#.*$)/gm, '<span class="text-gray-500 italic">$1</span>')
        .replace(/(\d+)/g, '<span class="text-blue-400">$1</span>');
    }
    
    if (lang === 'bash' || lang === 'shell') {
      return code
        .replace(/(sudo|chmod|chown|ls|cd|mkdir|rm|cp|mv|grep|find|wget|curl|ssh|scp)/g, 
          '<span class="text-cyan-400 font-semibold">$1</span>')
        .replace(/(-[\w-]+)/g, '<span class="text-yellow-400">$1</span>')
        .replace(/(#.*$)/gm, '<span class="text-gray-500 italic">$1</span>')
        .replace(/(\$\w+)/g, '<span class="text-green-400">$1</span>');
    }

    if (lang === 'sql') {
      return code
        .replace(/(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TABLE|DATABASE|INDEX|UNION|JOIN|LEFT|RIGHT|INNER|OUTER)/gi, 
          '<span class="text-purple-400 font-semibold">$1</span>')
        .replace(/('.*?'|".*?")/g, '<span class="text-green-400">$1</span>')
        .replace(/(--.*$)/gm, '<span class="text-gray-500 italic">$1</span>');
    }

    // Default: just highlight strings and comments
    return code
      .replace(/('.*?'|".*?")/g, '<span class="text-green-400">$1</span>')
      .replace(/(\/\/.*$|#.*$)/gm, '<span class="text-gray-500 italic">$1</span>');
  };

  return (
    <div className="relative group my-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-card border-b border-border px-4 py-2 rounded-t-lg">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary" />
          <span className="text-sm font-mono text-muted-foreground">
            {filename || language || 'code'}
          </span>
          {language && (
            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
              {language}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover-glow"
        >
          {copied ? (
            <Check className="w-3 h-3 text-green-400" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </Button>
      </div>

      {/* Code content */}
      <div className="bg-card/50 border border-border border-t-0 rounded-b-lg overflow-hidden">
        <pre className="p-4 overflow-x-auto text-sm">
          <code 
            className="font-mono text-foreground"
            dangerouslySetInnerHTML={{ 
              __html: highlightCode(code, language) 
            }}
          />
        </pre>
      </div>
    </div>
  );
}

// Component to format message content with code blocks
export function MessageContent({ content }: { content: string }) {
  // Split content by code blocks (```language\ncode\n```)
  const parts = content.split(/(```[\s\S]*?```)/g);
  
  return (
    <div className="space-y-2">
      {parts.map((part, index) => {
        if (part.startsWith('```')) {
          // Extract language and code
          const lines = part.slice(3, -3).split('\n');
          const language = lines[0].trim();
          const code = lines.slice(1).join('\n').trim();
          
          return (
            <CodeBlock 
              key={index} 
              code={code} 
              language={language || 'text'}
            />
          );
        } else if (part.includes('`') && !part.startsWith('```')) {
          // Handle inline code
          const inlineCodeRegex = /`([^`]+)`/g;
          const segments = part.split(inlineCodeRegex);
          
          return (
            <div key={index} className="whitespace-pre-wrap">
              {segments.map((segment, segIndex) => 
                segIndex % 2 === 1 ? (
                  <code 
                    key={segIndex}
                    className="bg-card/50 border border-border px-2 py-1 rounded text-sm font-mono text-primary mx-1"
                  >
                    {segment}
                  </code>
                ) : (
                  <span key={segIndex}>{segment}</span>
                )
              )}
            </div>
          );
        } else {
          // Regular text
          return (
            <div key={index} className="whitespace-pre-wrap">
              {part}
            </div>
          );
        }
      })}
    </div>
  );
}
