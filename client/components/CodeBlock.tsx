import React, { useState } from 'react';
import { Copy, Check, Terminal, FileCode, Code2, Play } from 'lucide-react';
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

  // Advanced syntax highlighting with better colors and patterns
  const highlightCode = (code: string, lang: string) => {
    let highlighted = code;

    if (lang === 'html') {
      highlighted = highlighted
        .replace(/(&lt;!DOCTYPE[^&]*&gt;)/g, '<span class="text-purple-300 font-semibold">$1</span>')
        .replace(/(&lt;\/?)([a-zA-Z0-9-]+)([^&]*?)(&gt;)/g,
          '<span class="text-blue-300">$1</span><span class="text-cyan-300 font-semibold">$2</span><span class="text-green-300">$3</span><span class="text-blue-300">$4</span>')
        .replace(/([\w-]+)=("[^"]*"|'[^']*')/g,
          '<span class="text-yellow-300">$1</span>=<span class="text-green-400">$2</span>')
        .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="text-gray-400 italic">$1</span>');
    }

    else if (lang === 'javascript' || lang === 'js') {
      highlighted = highlighted
        .replace(/\b(function|const|let|var|if|else|for|while|return|import|export|class|extends|async|await|try|catch|finally|throw|new|this|super|static|get|set)\b/g,
          '<span class="text-purple-400 font-semibold">$1</span>')
        .replace(/\b(true|false|null|undefined|NaN|Infinity)\b/g,
          '<span class="text-orange-400 font-semibold">$1</span>')
        .replace(/('.*?'|".*?"|`.*?`)/g, '<span class="text-green-400">$1</span>')
        .replace(/(\/\/.*$)/gm, '<span class="text-gray-400 italic">$1</span>')
        .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-gray-400 italic">$1</span>')
        .replace(/\b(\d+\.?\d*)\b/g, '<span class="text-cyan-300">$1</span>')
        .replace(/\b([A-Z][a-zA-Z0-9]*)\(/g, '<span class="text-yellow-300 font-semibold">$1</span>(');
    }

    else if (lang === 'python' || lang === 'py') {
      highlighted = highlighted
        .replace(/\b(def|class|if|elif|else|for|while|import|from|return|try|except|with|as|pass|break|continue|global|nonlocal|lambda|yield|raise|assert|del|in|is|not|and|or)\b/g,
          '<span class="text-purple-400 font-semibold">$1</span>')
        .replace(/\b(True|False|None)\b/g,
          '<span class="text-orange-400 font-semibold">$1</span>')
        .replace(/('.*?'|".*?"|'''[\s\S]*?'''|"""[\s\S]*?""")/g, '<span class="text-green-400">$1</span>')
        .replace(/(#.*$)/gm, '<span class="text-gray-400 italic">$1</span>')
        .replace(/\b(\d+\.?\d*)\b/g, '<span class="text-cyan-300">$1</span>')
        .replace(/@\w+/g, '<span class="text-yellow-300">$&</span>');
    }

    else if (lang === 'bash' || lang === 'shell') {
      highlighted = highlighted
        .replace(/\b(sudo|chmod|chown|ls|cd|mkdir|rm|cp|mv|grep|find|wget|curl|ssh|scp|apt|yum|systemctl|service|ps|kill|top|htop|vim|nano|cat|less|more|head|tail|awk|sed)\b/g,
          '<span class="text-cyan-400 font-semibold">$1</span>')
        .replace(/(-[\w-]+|--[\w-]+)/g, '<span class="text-yellow-400">$1</span>')
        .replace(/(#.*$)/gm, '<span class="text-gray-400 italic">$1</span>')
        .replace(/(\$\w+|\$\{[^}]*\})/g, '<span class="text-green-400 font-semibold">$1</span>')
        .replace(/^(\$|#)\s*/gm, '<span class="text-purple-400 font-bold">$1</span> ');
    }

    else if (lang === 'sql') {
      highlighted = highlighted
        .replace(/\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TABLE|DATABASE|INDEX|UNION|JOIN|LEFT|RIGHT|INNER|OUTER|GROUP|ORDER|BY|HAVING|LIMIT|OFFSET|AS|ON|INTO|VALUES|SET)\b/gi,
          '<span class="text-purple-400 font-semibold">$1</span>')
        .replace(/\b(VARCHAR|INT|INTEGER|BIGINT|SMALLINT|DECIMAL|FLOAT|DOUBLE|BOOLEAN|DATE|TIME|TIMESTAMP|TEXT|BLOB|NULL|NOT|PRIMARY|KEY|FOREIGN|REFERENCES|UNIQUE|AUTO_INCREMENT)\b/gi,
          '<span class="text-orange-400 font-semibold">$1</span>')
        .replace(/('.*?'|".*?")/g, '<span class="text-green-400">$1</span>')
        .replace(/(--.*$)/gm, '<span class="text-gray-400 italic">$1</span>')
        .replace(/\b(\d+\.?\d*)\b/g, '<span class="text-cyan-300">$1</span>');
    }

    else if (lang === 'css') {
      highlighted = highlighted
        .replace(/([.#]?[\w-]+)\s*\{/g, '<span class="text-yellow-300 font-semibold">$1</span> {')
        .replace(/([\w-]+)\s*:/g, '<span class="text-cyan-400">$1</span>:')
        .replace(/:\s*([^;}\n]+)/g, ': <span class="text-green-400">$1</span>')
        .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-gray-400 italic">$1</span>');
    }

    // Default: basic highlighting
    else {
      highlighted = highlighted
        .replace(/('.*?'|".*?")/g, '<span class="text-green-400">$1</span>')
        .replace(/(\/\/.*$|#.*$)/gm, '<span class="text-gray-400 italic">$1</span>')
        .replace(/\b(\d+\.?\d*)\b/g, '<span class="text-cyan-300">$1</span>');
    }

    return highlighted;
  };

  const getLanguageIcon = (lang: string) => {
    switch (lang.toLowerCase()) {
      case 'html': return <FileCode className="w-4 h-4 text-orange-400" />;
      case 'javascript':
      case 'js': return <Code2 className="w-4 h-4 text-yellow-400" />;
      case 'python':
      case 'py': return <Terminal className="w-4 h-4 text-blue-400" />;
      case 'bash':
      case 'shell': return <Terminal className="w-4 h-4 text-green-400" />;
      case 'sql': return <FileCode className="w-4 h-4 text-purple-400" />;
      default: return <Code2 className="w-4 h-4 text-primary" />;
    }
  };

  const getLanguageColor = (lang: string) => {
    switch (lang.toLowerCase()) {
      case 'html': return 'border-orange-400/30 bg-orange-400/10 text-orange-300';
      case 'javascript':
      case 'js': return 'border-yellow-400/30 bg-yellow-400/10 text-yellow-300';
      case 'python':
      case 'py': return 'border-blue-400/30 bg-blue-400/10 text-blue-300';
      case 'bash':
      case 'shell': return 'border-green-400/30 bg-green-400/10 text-green-300';
      case 'sql': return 'border-purple-400/30 bg-purple-400/10 text-purple-300';
      default: return 'border-primary/30 bg-primary/10 text-primary';
    }
  };

  // Add line numbers
  const lines = code.split('\n');
  const highlightedCode = highlightCode(code, language);
  const highlightedLines = highlightedCode.split('\n');

  return (
    <div className="relative group my-6 rounded-xl overflow-hidden border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between bg-card/90 border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3">
          {getLanguageIcon(language)}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                {filename || `${language || 'code'}`}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full border font-mono ${getLanguageColor(language)}`}>
                {language?.toUpperCase() || 'TXT'}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {lines.length} lines • {code.length} characters
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {language === 'html' && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs opacity-70 hover:opacity-100 transition-opacity"
            >
              <Play className="w-3 h-3 mr-1" />
              Preview
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-8 w-8 p-0 opacity-70 hover:opacity-100 transition-all hover:bg-primary/10 hover:text-primary"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Enhanced Code Content */}
      <div className="relative bg-gradient-to-br from-background/95 to-background/80">
        <pre className="overflow-x-auto text-sm leading-relaxed">
          <div className="flex">
            {/* Line Numbers */}
            <div className="select-none py-4 pl-4 pr-3 text-muted-foreground/50 bg-card/20 border-r border-border/30 font-mono text-xs leading-relaxed">
              {lines.map((_, i) => (
                <div key={i} className="text-right">
                  {(i + 1).toString().padStart(3, ' ')}
                </div>
              ))}
            </div>

            {/* Code Lines */}
            <div className="flex-1 py-4 px-4">
              <code className="font-mono text-sm text-foreground">
                {highlightedLines.map((line, i) => (
                  <div
                    key={i}
                    className="leading-relaxed hover:bg-primary/5 px-2 -mx-2 rounded transition-colors"
                    dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }}
                  />
                ))}
              </code>
            </div>
          </div>
        </pre>
      </div>

      {/* Subtle bottom accent */}
      <div className="h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
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
