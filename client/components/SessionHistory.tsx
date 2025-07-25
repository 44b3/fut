import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  History, 
  MessageSquare, 
  Search, 
  Clock, 
  Download, 
  Trash2, 
  ArrowLeft,
  Calendar,
  User,
  Bot,
  Eye,
  X
} from 'lucide-react';
import { MessageContent } from './CodeBlock';

interface Message {
  id: string;
  content: string;
  type: 'user' | 'ai';
  timestamp: Date;
}

interface SessionData {
  sessionId: string;
  messages: Message[];
  timestamp: string;
  title: string;
}

interface SessionHistoryProps {
  onClose: () => void;
  onLoadSession: (sessionId: string, messages: Message[]) => void;
}

export function SessionHistory({ onClose, onLoadSession }: SessionHistoryProps) {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAllSessions();
  }, []);

  const loadAllSessions = () => {
    try {
      const saved = localStorage.getItem('cyberai-chat-history');
      if (saved) {
        const history = JSON.parse(saved);
        const sessionList: SessionData[] = Object.keys(history).map(sessionId => {
          const sessionData = history[sessionId];
          return {
            sessionId,
            messages: (sessionData.messages || []).map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            })),
            timestamp: sessionData.timestamp,
            title: sessionData.title || 'Untitled Session'
          };
        });

        // Sort by timestamp, most recent first
        sessionList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setSessions(sessionList);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const saved = localStorage.getItem('cyberai-chat-history');
      if (saved) {
        const history = JSON.parse(saved);
        delete history[sessionId];
        localStorage.setItem('cyberai-chat-history', JSON.stringify(history));
        loadAllSessions();
        if (selectedSession?.sessionId === sessionId) {
          setSelectedSession(null);
        }
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const exportSession = (session: SessionData, e: React.MouseEvent) => {
    e.stopPropagation();
    const exportData = {
      sessionId: session.sessionId,
      title: session.title,
      timestamp: session.timestamp,
      messages: session.messages,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cyberai-session-${session.sessionId}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadSessionIntoChat = (session: SessionData) => {
    onLoadSession(session.sessionId, session.messages);
    onClose();
  };

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.messages.some(msg => 
      msg.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getSessionPreview = (messages: Message[]) => {
    const firstUserMessage = messages.find(msg => msg.type === 'user');
    return firstUserMessage ? firstUserMessage.content.slice(0, 100) + '...' : 'No messages';
  };

  if (selectedSession) {
    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col">
        {/* Session Detail Header */}
        <div className="border-b border-border bg-card/80 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSession(null)}
                className="hover:bg-primary/10"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h2 className="text-xl font-semibold text-foreground">{selectedSession.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {formatDate(selectedSession.timestamp)} • {selectedSession.messages.length} messages
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadSessionIntoChat(selectedSession)}
                className="hover:bg-primary/10"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Load Session
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="hover:bg-primary/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Session Messages */}
        <div className="flex-1 overflow-y-auto p-6 cyber-matrix relative">
          <div className="max-w-4xl mx-auto space-y-6">
            {selectedSession.messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type === 'ai' && (
                  <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Bot className="w-6 h-6 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-3xl p-4 rounded-xl ${
                    message.type === 'user'
                      ? 'bg-primary/90 text-primary-foreground ml-12'
                      : 'bg-card/80 border border-border'
                  }`}
                >
                  {message.type === 'ai' ? (
                    <MessageContent content={message.content} />
                  ) : (
                    <p className="whitespace-pre-wrap font-mono">{message.content}</p>
                  )}
                  <div className="text-xs opacity-70 mt-2 font-mono">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                {message.type === 'user' && (
                  <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-accent" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col">
      {/* History Header */}
      <div className="border-b border-border bg-card/80 p-4 cyber-grid">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <History className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Session History</h1>
              <p className="text-sm text-muted-foreground">Browse and manage your chat sessions</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="hover:bg-primary/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search sessions and messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-6 cyber-matrix relative">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading sessions...</p>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchTerm ? 'No matching sessions' : 'No sessions found'}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Try a different search term' : 'Start a conversation to create your first session'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSessions.map((session) => (
                <Card
                  key={session.sessionId}
                  className="p-4 hover:bg-card/80 transition-colors cursor-pointer border-border group"
                  onClick={() => setSelectedSession(session)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <MessageSquare className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {session.title}
                        </h3>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {getSessionPreview(session.messages)}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(session.timestamp)}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {session.messages.length} messages
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSession(session);
                        }}
                        className="h-8 w-8 p-0 hover:bg-primary/10"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => exportSession(session, e)}
                        className="h-8 w-8 p-0 hover:bg-primary/10"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => deleteSession(session.sessionId, e)}
                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
