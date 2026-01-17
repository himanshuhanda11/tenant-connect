import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CodeExample {
  language: string;
  label: string;
  code: string;
}

interface CodeBlockProps {
  examples: CodeExample[];
  title?: string;
}

export function CodeBlock({ examples, title }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState(examples[0]?.language || '');

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeExample = examples.find(e => e.language === activeTab) || examples[0];

  return (
    <div className="rounded-xl border border-border/50 overflow-hidden bg-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          {title && <span className="text-xs text-slate-400 font-mono">{title}</span>}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-slate-400 hover:text-white hover:bg-slate-800"
          onClick={() => copyToClipboard(activeExample.code)}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 mr-1.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 mr-1.5" />
              Copy
            </>
          )}
        </Button>
      </div>

      {/* Tabs */}
      {examples.length > 1 && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-slate-900">
          <TabsList className="bg-transparent border-b border-slate-800 rounded-none h-auto p-0 w-full justify-start">
            {examples.map((example) => (
              <TabsTrigger
                key={example.language}
                value={example.language}
                className={cn(
                  "rounded-none border-b-2 border-transparent px-4 py-2 text-xs font-medium",
                  "data-[state=active]:border-primary data-[state=active]:text-white data-[state=active]:bg-transparent",
                  "text-slate-400 hover:text-slate-300"
                )}
              >
                {example.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/* Code */}
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm font-mono">
          <code className="text-slate-300 whitespace-pre">{activeExample.code}</code>
        </pre>
      </div>
    </div>
  );
}
