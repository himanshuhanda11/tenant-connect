import { ExternalLink, Download, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SDK {
  name: string;
  language: string;
  version: string;
  description: string;
  installCommand: string;
  githubUrl: string;
  docsUrl: string;
  icon: string;
  status: 'stable' | 'beta' | 'alpha';
}

const sdks: SDK[] = [
  {
    name: 'JavaScript SDK',
    language: 'JavaScript / TypeScript',
    version: 'v2.3.1',
    description: 'Full-featured SDK for Node.js and browser environments.',
    installCommand: 'npm install @aireatro/sdk',
    githubUrl: '#',
    docsUrl: '#',
    icon: '🟨',
    status: 'stable'
  },
  {
    name: 'Python SDK',
    language: 'Python 3.8+',
    version: 'v1.5.0',
    description: 'Pythonic SDK with async support and type hints.',
    installCommand: 'pip install aireatro',
    githubUrl: '#',
    docsUrl: '#',
    icon: '🐍',
    status: 'stable'
  },
  {
    name: 'PHP SDK',
    language: 'PHP 8.0+',
    version: 'v1.2.0',
    description: 'Composer package for PHP applications.',
    installCommand: 'composer require aireatro/sdk',
    githubUrl: '#',
    docsUrl: '#',
    icon: '🐘',
    status: 'stable'
  },
  {
    name: 'Go SDK',
    language: 'Go 1.18+',
    version: 'v0.9.0',
    description: 'Lightweight Go module with context support.',
    installCommand: 'go get github.com/aireatro/go-sdk',
    githubUrl: '#',
    docsUrl: '#',
    icon: '🔵',
    status: 'beta'
  }
];

const statusColors = {
  stable: 'bg-green-500/20 text-green-600 border-green-500/30',
  beta: 'bg-amber-500/20 text-amber-600 border-amber-500/30',
  alpha: 'bg-red-500/20 text-red-600 border-red-500/30'
};

export function SDKCards() {
  const copyCommand = (command: string) => {
    navigator.clipboard.writeText(command);
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {sdks.map((sdk) => (
        <div 
          key={sdk.name}
          className="rounded-xl border border-border/50 bg-card p-5 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{sdk.icon}</span>
              <div>
                <h4 className="font-semibold text-foreground">{sdk.name}</h4>
                <p className="text-xs text-muted-foreground">{sdk.language}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {sdk.version}
              </Badge>
              <Badge className={`text-xs border ${statusColors[sdk.status]}`}>
                {sdk.status}
              </Badge>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            {sdk.description}
          </p>

          {/* Install command */}
          <div 
            className="flex items-center justify-between bg-slate-950 rounded-lg px-3 py-2 mb-4 group cursor-pointer hover:bg-slate-900 transition-colors"
            onClick={() => copyCommand(sdk.installCommand)}
          >
            <code className="text-xs text-slate-300 font-mono">{sdk.installCommand}</code>
            <span className="text-xs text-slate-500 group-hover:text-slate-300 transition-colors">
              Click to copy
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs">
              <Github className="w-3.5 h-3.5" />
              GitHub
            </Button>
            <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs">
              <ExternalLink className="w-3.5 h-3.5" />
              Docs
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
