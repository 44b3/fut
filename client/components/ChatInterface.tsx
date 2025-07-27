import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, Shield, Terminal, Zap, Lock, Eye, AlertTriangle, CheckCircle, Activity, RefreshCw, History, Save, Download, Trash2, Settings } from 'lucide-react';
import { ChatMessage as APIChatMessage, ChatRequest, ChatResponse } from '@shared/api';
import { MessageContent } from './CodeBlock';
import { ToolsPanel } from './ToolsPanel';
import { MatrixRain } from './MatrixRain';
import { SessionHistory } from './SessionHistory';

interface Message {
  id: string;
  content: string;
  type: 'user' | 'ai';
  timestamp: Date;
}

interface SecurityFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const securityFeatures: SecurityFeature[] = [
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Penetration Testing",
    description: "Advanced red team methodologies and vulnerability assessment"
  },
  {
    icon: <Terminal className="w-6 h-6" />,
    title: "Security Automation",
    description: "Automated security scanning and exploitation frameworks"
  },
  {
    icon: <Eye className="w-6 h-6" />,
    title: "Threat Intelligence",
    description: "Real-time threat analysis and security intelligence"
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: "Secure Code Review",
    description: "Source code analysis for security vulnerabilities"
  }
];

const allExampleQueries = [
  "Help me with SQL injection testing strategies",
  "Generate a custom payload for XSS testing",
  "Analyze this network configuration for vulnerabilities",
  "Create a red team engagement plan",
  "Show me advanced Nmap scanning techniques",
  "Generate a reverse shell payload for Windows",
  "Help with privilege escalation on Linux systems",
  "Create a phishing email template for testing",
  "Explain CSRF attack vectors and prevention",
  "Generate a buffer overflow exploit skeleton",
  "Help with wireless network penetration testing",
  "Show me directory traversal attack payloads",
  "Create a password spraying attack strategy",
  "Analyze web application authentication bypasses",
  "Generate LDAP injection test cases",
  "Help with Active Directory enumeration",
  "Show me XML external entity (XXE) payloads",
  "Create a comprehensive port scanning script",
  "Help with Docker container security assessment",
  "Generate subdomain enumeration commands"
];

// Function to get randomized queries
const getRandomQueries = (count: number = 4) => {
  const shuffled = [...allExampleQueries].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [showToolsPanel, setShowToolsPanel] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [exampleQueries, setExampleQueries] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize randomized queries and load chat history
  useEffect(() => {
    setExampleQueries(getRandomQueries());
    loadChatHistory();
  }, []);

  // Auto-save chat history
  useEffect(() => {
    if (messages.length > 0 && currentSessionId) {
      saveChatHistory();
    }
  }, [messages, currentSessionId]);

  const loadChatHistory = () => {
    try {
      const saved = localStorage.getItem('cyberai-chat-history');
      const sessionId = localStorage.getItem('cyberai-current-session');

      if (saved && sessionId) {
        const history = JSON.parse(saved);
        if (history[sessionId]) {
          // Restore messages with proper Date objects for timestamps
          const restoredMessages = (history[sessionId].messages || []).map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          setMessages(restoredMessages);
          setCurrentSessionId(sessionId);
          return;
        }
      }

      // Create new session
      const newSessionId = `session-${Date.now()}`;
      setCurrentSessionId(newSessionId);
      localStorage.setItem('cyberai-current-session', newSessionId);
    } catch (error) {
      console.error('Error loading chat history:', error);
      const newSessionId = `session-${Date.now()}`;
      setCurrentSessionId(newSessionId);
    }
  };

  const saveChatHistory = () => {
    try {
      const saved = localStorage.getItem('cyberai-chat-history');
      const history = saved ? JSON.parse(saved) : {};

      history[currentSessionId] = {
        messages,
        timestamp: new Date().toISOString(),
        title: messages[0]?.content.slice(0, 50) || 'New Session'
      };

      localStorage.setItem('cyberai-chat-history', JSON.stringify(history));
      localStorage.setItem('cyberai-current-session', currentSessionId);
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  };

  const newSession = () => {
    const newSessionId = `session-${Date.now()}`;
    setCurrentSessionId(newSessionId);
    setMessages([]);
    setExampleQueries(getRandomQueries());
    localStorage.setItem('cyberai-current-session', newSessionId);
  };

  const exportSession = () => {
    const sessionData = {
      sessionId: currentSessionId,
      messages,
      timestamp: new Date().toISOString(),
      title: messages[0]?.content.slice(0, 50) || 'CyberAI Session'
    };

    const blob = new Blob([JSON.stringify(sessionData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cyberai-session-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const refreshQueries = () => {
    setExampleQueries(getRandomQueries());
  };

  const handleCommandGenerated = (command: string) => {
    setInput(command);
    setShowToolsPanel(false);
  };

  const handleLoadSession = (sessionId: string, sessionMessages: Message[]) => {
    setCurrentSessionId(sessionId);
    setMessages(sessionMessages);
    localStorage.setItem('cyberai-current-session', sessionId);
    setShowHistory(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      type: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Create AI message for streaming
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: Message = {
      id: aiMessageId,
      content: '',
      type: 'ai',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMessage]);

    try {
      // Convert messages to API format
      const apiMessages: APIChatMessage[] = messages
        .concat(userMessage)
        .map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        }));

      const chatRequest: ChatRequest = {
        messages: apiMessages
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chatRequest),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if it's a streaming response
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/event-stream')) {
        // Handle streaming response
        setIsStreaming(true);
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
          let streamedContent = '';

          while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim() !== '');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);

                try {
                  const parsed = JSON.parse(data);

                  if (parsed.content) {
                    streamedContent += parsed.content;

                    // Update the AI message in real-time
                    setMessages(prev => prev.map(msg =>
                      msg.id === aiMessageId
                        ? { ...msg, content: streamedContent }
                        : msg
                    ));
                  }

                  if (parsed.done) {
                    setIsStreaming(false);
                    break;
                  }

                  if (parsed.error) {
                    setIsStreaming(false);
                    throw new Error(parsed.error);
                  }
                } catch (parseError) {
                  // Skip malformed chunks
                  continue;
                }
              }
            }
          }
        }
        setIsStreaming(false);
      } else {
        // Fallback to non-streaming response
        const data: ChatResponse = await response.json();

        if (!data || typeof data.message !== 'string') {
          throw new Error('Invalid response format from server');
        }

        setMessages(prev => prev.map(msg =>
          msg.id === aiMessageId
            ? { ...msg, content: data.message }
            : msg
        ));
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setIsStreaming(false);

      let errorContent = "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.";

      if (error instanceof Error) {
        if (error.message.includes('JSON')) {
          errorContent = "There was an issue parsing the server response. Please try again.";
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorContent = "Network connection issue. Please check your connection and try again.";
        } else if (error.message.includes('500')) {
          errorContent = "Server is experiencing issues. Please try again in a moment.";
        }
      }

      // Update the AI message with error
      setMessages(prev => prev.map(msg =>
        msg.id === aiMessageId
          ? { ...msg, content: errorContent }
          : msg
      ));
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleExampleQuery = (query: string) => {
    setInput(query);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md cyber-grid">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center neon-glow">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  CyberAI
                  <Activity className="w-5 h-5 text-primary animate-pulse" />
                </h1>
                <p className="text-sm text-muted-foreground">Red Team Security Assistant • Deepseek R1T2 Chimera</p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(true)}
                  className="h-8 px-3 text-xs hover:bg-primary/10 hover:text-primary"
                >
                  <History className="w-3 h-3 mr-1" />
                  History
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowToolsPanel(!showToolsPanel)}
                  className={`h-8 px-3 text-xs hover:bg-primary/10 hover:text-primary ${showToolsPanel ? 'bg-primary/10 text-primary' : ''}`}
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Tools
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={newSession}
                  className="h-8 px-3 text-xs hover:bg-primary/10 hover:text-primary"
                >
                  <Terminal className="w-3 h-3 mr-1" />
                  New Session
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={exportSession}
                  disabled={messages.length === 0}
                  className="h-8 px-3 text-xs hover:bg-primary/10 hover:text-primary"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Export
                </Button>
              </div>
              <div className="flex items-center gap-2 text-sm text-primary">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse matrix-glow"></div>
                <span className="font-mono">ONLINE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 cyber-matrix relative">
            {/* Background overlay for enhanced depth */}
            <div className="absolute inset-0 cyber-circuit pointer-events-none"></div>
            <div className="absolute inset-0 cyber-hexagon pointer-events-none"></div>

            {/* Content wrapper with backdrop */}
            <div className="relative" style={{ zIndex: 10 }}>
              {messages.length === 0 ? (
              <div className="max-w-4xl mx-auto">
                {/* Welcome Section */}
                <div className="text-center mb-8 bg-background/20 rounded-2xl p-8">
                  <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-3xl font-bold text-foreground mb-2">
                    Welcome to CyberAI
                  </h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Your specialized AI assistant for cybersecurity, penetration testing, and red team operations. 
                    Ask me anything about security testing, vulnerability assessment, or threat analysis.
                  </p>
                </div>

                {/* Security Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 bg-background/15 rounded-2xl p-6">
                  {securityFeatures.map((feature, index) => (
                    <Card
                      key={index}
                      className="p-6 bg-card/60 border-border hover:bg-card/80 hover-glow scan-line group cursor-pointer"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="text-primary mb-4 group-hover:scale-110 transition-transform">
                        {feature.icon}
                      </div>
                      <h3 className="font-semibold text-foreground mb-3 text-lg">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </Card>
                  ))}
                </div>

                {/* Example Queries */}
                <div className="space-y-4 bg-background/15 rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                      <Terminal className="w-5 h-5 text-primary" />
                      Try asking:
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={refreshQueries}
                      className="h-8 px-3 text-xs hover:bg-primary/10 hover:text-primary"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Refresh
                    </Button>
                  </div>
                  <div className="grid gap-3">
                    {exampleQueries.map((query, index) => (
                      <button
                        key={`${query}-${index}`}
                        onClick={() => handleExampleQuery(query)}
                        className="text-left p-4 rounded-xl border border-border hover:bg-card/60 hover-glow transition-all text-muted-foreground hover:text-foreground group scan-line font-mono text-sm"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <span className="text-primary group-hover:text-accent transition-colors">$ </span>
                        {query}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-8 bg-background/8 rounded-2xl p-6">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 message-enter ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {message.type === 'ai' && (
                      <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0 neon-glow">
                        <Shield className="w-6 h-6 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-3xl p-6 rounded-xl shadow-lg ${
                        message.type === 'user'
                          ? 'bg-primary/90 text-primary-foreground ml-12 hover-glow'
                          : 'bg-card/80 border border-border backdrop-blur-sm'
                      }`}
                    >
                      {message.type === 'ai' ? (
                        <div>
                          <MessageContent content={message.content} />
                          {isStreaming && message.id === messages[messages.length - 1]?.id && (
                            <div className="flex items-center gap-2 mt-2">
                              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                              <span className="text-xs text-primary font-mono">7yp1ng 1n 1337 5p34k...</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap font-mono">{message.content}</p>
                      )}
                      <div className="text-xs opacity-70 mt-4 font-mono">
                        {new Date(message.timestamp).toLocaleTimeString()}
                        {message.type === 'ai' && (
                          <span className="ml-2 text-primary">• Deepseek R1T2</span>
                        )}
                      </div>
                    </div>
                    {message.type === 'user' && (
                      <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center flex-shrink-0 matrix-glow">
                        <Terminal className="w-6 h-6 text-accent" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-4 message-enter">
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0 neon-glow">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div className="max-w-3xl p-6 rounded-xl bg-card/80 border border-border backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          <div className="w-3 h-3 bg-primary rounded-full animate-bounce typing-indicator"></div>
                          <div className="w-3 h-3 bg-primary rounded-full animate-bounce typing-indicator" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-3 h-3 bg-primary rounded-full animate-bounce typing-indicator" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-muted-foreground font-mono">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-border bg-card/60 p-6 cyber-grid">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about penetration testing, vulnerability assessment, or security research..."
                    className="bg-background/50 border-border focus:border-primary text-lg py-6 px-4 rounded-xl font-mono hover-glow transition-all"
                    disabled={isLoading}
                  />
                  {input && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary text-sm font-mono">
                      {input.length}
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-6 rounded-xl hover-glow transition-all font-semibold"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  <span className="font-mono">For educational and authorized testing purposes only. Always follow responsible disclosure practices.</span>
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  Press <kbd className="px-2 py-1 bg-card/50 rounded text-primary">Enter</kbd> to send
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tools Panel */}
        {showToolsPanel && (
          <ToolsPanel onCommandGenerated={handleCommandGenerated} />
        )}
      </div>

      {/* Session History Modal */}
      {showHistory && (
        <SessionHistory
          onClose={() => setShowHistory(false)}
          onLoadSession={handleLoadSession}
        />
      )}
    </div>
  );
}
