import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Network, 
  Shield, 
  Zap, 
  Search, 
  Database, 
  Lock, 
  Eye, 
  Terminal, 
  Globe,
  Wifi,
  Server,
  Bug,
  Key,
  FileSearch,
  ChevronRight,
  Copy,
  Play
} from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: React.ReactNode;
  command: string;
  parameters: ToolParameter[];
  examples: string[];
}

interface ToolParameter {
  name: string;
  description: string;
  required: boolean;
  placeholder: string;
  type: 'text' | 'ip' | 'port' | 'url' | 'file';
}

const pentestingTools: Tool[] = [
  {
    id: 'nmap',
    name: 'Nmap',
    category: 'Network Discovery',
    description: 'Network exploration and security auditing tool',
    icon: <Network className="w-5 h-5" />,
    command: 'nmap',
    parameters: [
      { name: 'target', description: 'Target IP or hostname', required: true, placeholder: '192.168.1.1', type: 'ip' },
      { name: 'ports', description: 'Port range', required: false, placeholder: '1-1000', type: 'text' },
      { name: 'scan_type', description: 'Scan type', required: false, placeholder: '-sS', type: 'text' }
    ],
    examples: [
      'nmap -sS -sV 192.168.1.0/24',
      'nmap -A -T4 target.com',
      'nmap -sU --top-ports 1000 192.168.1.1'
    ]
  },
  {
    id: 'sqlmap',
    name: 'SQLMap',
    category: 'Web Application',
    description: 'Automatic SQL injection detection and exploitation',
    icon: <Database className="w-5 h-5" />,
    command: 'sqlmap',
    parameters: [
      { name: 'url', description: 'Target URL', required: true, placeholder: 'http://example.com/page?id=1', type: 'url' },
      { name: 'data', description: 'POST data', required: false, placeholder: 'username=admin&password=test', type: 'text' },
      { name: 'cookie', description: 'HTTP Cookie header', required: false, placeholder: 'PHPSESSID=abc123', type: 'text' }
    ],
    examples: [
      'sqlmap -u "http://example.com/page?id=1" --dbs',
      'sqlmap -u "http://example.com/login" --data="user=admin&pass=test" --dump',
      'sqlmap -r request.txt --batch --tamper=space2comment'
    ]
  },
  {
    id: 'metasploit',
    name: 'Metasploit',
    category: 'Exploitation',
    description: 'Advanced exploitation framework',
    icon: <Zap className="w-5 h-5" />,
    command: 'msfconsole',
    parameters: [
      { name: 'exploit', description: 'Exploit module', required: true, placeholder: 'exploit/windows/smb/ms17_010_eternalblue', type: 'text' },
      { name: 'payload', description: 'Payload', required: false, placeholder: 'windows/x64/meterpreter/reverse_tcp', type: 'text' },
      { name: 'rhosts', description: 'Target hosts', required: true, placeholder: '192.168.1.100', type: 'ip' }
    ],
    examples: [
      'use exploit/windows/smb/ms17_010_eternalblue',
      'set RHOSTS 192.168.1.100',
      'set PAYLOAD windows/x64/meterpreter/reverse_tcp'
    ]
  },
  {
    id: 'burpsuite',
    name: 'Burp Suite',
    category: 'Web Application',
    description: 'Web application security testing platform',
    icon: <Globe className="w-5 h-5" />,
    command: 'burpsuite',
    parameters: [
      { name: 'proxy_port', description: 'Proxy port', required: false, placeholder: '8080', type: 'port' },
      { name: 'target_scope', description: 'Target scope', required: false, placeholder: '*.example.com', type: 'text' }
    ],
    examples: [
      'Set proxy to 127.0.0.1:8080',
      'Configure target scope: *.target.com',
      'Enable intercept and modify requests'
    ]
  },
  {
    id: 'nikto',
    name: 'Nikto',
    category: 'Web Application',
    description: 'Web server vulnerability scanner',
    icon: <Search className="w-5 h-5" />,
    command: 'nikto',
    parameters: [
      { name: 'host', description: 'Target host', required: true, placeholder: 'example.com', type: 'url' },
      { name: 'port', description: 'Port number', required: false, placeholder: '80', type: 'port' },
      { name: 'ssl', description: 'Use SSL', required: false, placeholder: '-ssl', type: 'text' }
    ],
    examples: [
      'nikto -h http://example.com',
      'nikto -h https://example.com -ssl',
      'nikto -h 192.168.1.100 -p 8080'
    ]
  },
  {
    id: 'dirb',
    name: 'DirBuster/Dirb',
    category: 'Web Application',
    description: 'Directory and file brute-forcer',
    icon: <FileSearch className="w-5 h-5" />,
    command: 'dirb',
    parameters: [
      { name: 'url', description: 'Target URL', required: true, placeholder: 'http://example.com/', type: 'url' },
      { name: 'wordlist', description: 'Wordlist path', required: false, placeholder: '/usr/share/dirb/wordlists/common.txt', type: 'file' },
      { name: 'extensions', description: 'File extensions', required: false, placeholder: '-X .php,.html,.txt', type: 'text' }
    ],
    examples: [
      'dirb http://example.com/',
      'dirb http://example.com/ /usr/share/dirb/wordlists/big.txt',
      'dirb http://example.com/ -X .php,.asp,.aspx'
    ]
  }
];

export function ToolsPanel({ onCommandGenerated }: { onCommandGenerated: (command: string) => void }) {
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [parameters, setParameters] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const categories = Array.from(new Set(pentestingTools.map(tool => tool.category)));
  const filteredTools = pentestingTools.filter(tool => 
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateCommand = (tool: Tool) => {
    let command = tool.command;
    
    tool.parameters.forEach(param => {
      const value = parameters[param.name];
      if (value && value.trim()) {
        if (param.name === 'target' || param.name === 'host' || param.name === 'url') {
          command += ` ${value}`;
        } else if (param.name === 'rhosts') {
          command += ` RHOSTS=${value}`;
        } else {
          command += ` --${param.name}=${value}`;
        }
      }
    });
    
    return command;
  };

  const handleParameterChange = (paramName: string, value: string) => {
    setParameters(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  const handleCopyCommand = (command: string) => {
    navigator.clipboard.writeText(command);
  };

  const handleUseCommand = (command: string) => {
    onCommandGenerated(`Show me how to use: ${command}`);
  };

  return (
    <div className="w-80 border-l border-border bg-card/50 backdrop-blur-sm flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card/80">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-primary" />
          Pentest Tools
        </h2>
        <Input
          placeholder="Search tools..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="text-sm"
        />
      </div>

      {/* Tools List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {categories.map(category => {
          const categoryTools = filteredTools.filter(tool => tool.category === category);
          if (categoryTools.length === 0) return null;

          return (
            <div key={category} className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                {category}
              </h3>
              {categoryTools.map(tool => (
                <Card
                  key={tool.id}
                  className={`p-3 cursor-pointer hover:bg-card/80 transition-colors border ${
                    selectedTool?.id === tool.id ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                  onClick={() => setSelectedTool(tool)}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-primary">{tool.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-foreground">{tool.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">{tool.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Card>
              ))}
            </div>
          );
        })}
      </div>

      {/* Tool Configuration */}
      {selectedTool && (
        <div className="border-t border-border bg-card/80 p-4 space-y-4 max-h-96 overflow-y-auto">
          <div>
            <h3 className="font-medium text-foreground flex items-center gap-2 mb-2">
              {selectedTool.icon}
              {selectedTool.name}
            </h3>
            <p className="text-xs text-muted-foreground mb-3">{selectedTool.description}</p>
          </div>

          {/* Parameters */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Parameters</h4>
            {selectedTool.parameters.map(param => (
              <div key={param.name} className="space-y-1">
                <label className="text-xs text-muted-foreground flex items-center gap-1">
                  {param.description}
                  {param.required && <Badge variant="destructive" className="text-xs px-1 py-0">Required</Badge>}
                </label>
                <Input
                  placeholder={param.placeholder}
                  value={parameters[param.name] || ''}
                  onChange={(e) => handleParameterChange(param.name, e.target.value)}
                  className="text-sm h-8"
                />
              </div>
            ))}
          </div>

          {/* Generated Command */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Generated Command</h4>
            <div className="bg-background/50 p-2 rounded border font-mono text-xs">
              {generateCommand(selectedTool)}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopyCommand(generateCommand(selectedTool))}
                className="flex-1 h-8 text-xs"
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </Button>
              <Button
                size="sm"
                onClick={() => handleUseCommand(generateCommand(selectedTool))}
                className="flex-1 h-8 text-xs"
              >
                <Play className="w-3 h-3 mr-1" />
                Use
              </Button>
            </div>
          </div>

          {/* Examples */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Examples</h4>
            <div className="space-y-1">
              {selectedTool.examples.map((example, index) => (
                <div
                  key={index}
                  className="bg-background/30 p-2 rounded text-xs font-mono cursor-pointer hover:bg-background/50 transition-colors"
                  onClick={() => handleUseCommand(example)}
                >
                  {example}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
