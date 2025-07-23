import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, Shield, Terminal, Zap, Lock, Eye, AlertTriangle, CheckCircle } from 'lucide-react';

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

const exampleQueries = [
  "Help me with SQL injection testing strategies",
  "Generate a custom payload for XSS testing",
  "Analyze this network configuration for vulnerabilities",
  "Create a red team engagement plan"
];

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm your cybersecurity AI assistant specialized in red team operations and security testing. I can help you with penetration testing, vulnerability assessment, security automation, and threat analysis. What specific security challenge can I assist you with today?",
        type: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
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
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">CyberAI</h1>
                <p className="text-sm text-muted-foreground">Red Team Security Assistant</p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="flex items-center gap-1 text-sm text-cyber-500">
                <div className="w-2 h-2 bg-cyber-500 rounded-full animate-pulse"></div>
                Active
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
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="max-w-4xl mx-auto">
                {/* Welcome Section */}
                <div className="text-center mb-8">
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
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {securityFeatures.map((feature, index) => (
                    <Card key={index} className="p-4 bg-card/50 border-border hover:bg-card/80 transition-colors">
                      <div className="text-primary mb-3">{feature.icon}</div>
                      <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </Card>
                  ))}
                </div>

                {/* Example Queries */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Try asking:</h3>
                  <div className="grid gap-2">
                    {exampleQueries.map((query, index) => (
                      <button
                        key={index}
                        onClick={() => handleExampleQuery(query)}
                        className="text-left p-3 rounded-lg border border-border hover:bg-card/50 transition-colors text-muted-foreground hover:text-foreground"
                      >
                        {query}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.type === 'ai' && (
                      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                        <Shield className="w-5 h-5 text-primary-foreground" />
                      </div>
                    )}
                    <div
                      className={`max-w-3xl p-4 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground ml-12'
                          : 'bg-card border border-border'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <div className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                    {message.type === 'user' && (
                      <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                        <Terminal className="w-5 h-5 text-accent-foreground" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="max-w-3xl p-4 rounded-lg bg-card border border-border">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-border bg-card/50 backdrop-blur-sm p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about penetration testing, vulnerability assessment, or security research..."
                  className="flex-1 bg-background border-border focus:border-primary"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <AlertTriangle className="w-3 h-3" />
                For educational and authorized testing purposes only. Always follow responsible disclosure practices.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
