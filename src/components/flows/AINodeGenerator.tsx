import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Sparkles, Wand2, ArrowRight, Loader2, CheckCircle2, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AINodeGeneratorProps {
  onGenerate: (nodes: GeneratedNode[]) => void;
}

interface GeneratedNode {
  type: string;
  label: string;
  config: Record<string, unknown>;
}

const PROMPT_SUGGESTIONS = [
  "Welcome new leads and ask about their requirements",
  "Qualify leads by asking budget and timeline",
  "Book an appointment with available time slots",
  "Handle after-hours messages with auto-reply",
  "Collect feedback after a purchase",
];

export function AINodeGenerator({ onGenerate }: AINodeGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedNodes, setGeneratedNodes] = useState<GeneratedNode[] | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a description of your flow');
      return;
    }

    setLoading(true);

    // Simulate AI generation (in production, this would call an edge function)
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockNodes: GeneratedNode[] = [
      {
        type: 'text-buttons',
        label: 'Welcome Message',
        config: {
          message: "Hi {{first_name}}! 👋 Thanks for reaching out. I'm here to help you with your inquiry.",
          buttons: ['Get Started', 'Talk to Human'],
        },
      },
      {
        type: 'condition',
        label: 'Check Response',
        config: {
          conditions: [
            { field: 'last_message', operator: 'contains', value: 'human' },
          ],
        },
      },
      {
        type: 'list-message',
        label: 'Service Options',
        config: {
          message: 'What would you like help with today?',
          items: ['Product Inquiry', 'Pricing', 'Support', 'Other'],
        },
      },
      {
        type: 'assign-agent',
        label: 'Hand to Human',
        config: {
          strategy: 'round_robin',
          message: "I'll connect you with a team member right away!",
        },
      },
    ];

    setGeneratedNodes(mockNodes);
    setLoading(false);
    toast.success('Flow generated! Review and add to canvas.');
  };

  const handleAddToCanvas = () => {
    if (generatedNodes) {
      onGenerate(generatedNodes);
      setGeneratedNodes(null);
      setPrompt('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Pro Badge */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20">
        <Sparkles className="h-5 w-5 text-violet-600" />
        <div className="flex-1">
          <p className="text-sm font-medium text-violet-700">AI Flow Generator</p>
          <p className="text-xs text-violet-600">Describe your flow in plain English</p>
        </div>
        <Badge variant="secondary" className="bg-violet-100 text-violet-700">Pro</Badge>
      </div>

      {/* Prompt Input */}
      <div className="space-y-2">
        <Textarea
          placeholder="Describe what you want your flow to do... e.g., 'Welcome new leads, ask about their budget, then route high-value leads to sales team'"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[100px] resize-none"
        />
        <div className="flex flex-wrap gap-1.5">
          {PROMPT_SUGGESTIONS.slice(0, 3).map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setPrompt(suggestion)}
              className="text-xs px-2 py-1 rounded-full bg-muted hover:bg-muted/80 transition-colors"
            >
              {suggestion.slice(0, 40)}...
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={loading || !prompt.trim()}
        className="w-full gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating Flow...
          </>
        ) : (
          <>
            <Wand2 className="h-4 w-4" />
            Generate Flow with AI
          </>
        )}
      </Button>

      {/* Generated Nodes Preview */}
      {generatedNodes && (
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Generated {generatedNodes.length} nodes</span>
          </div>
          
          <div className="space-y-2">
            {generatedNodes.map((node, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                  {idx + 1}
                </div>
                <div className="flex-1 p-2 rounded-lg bg-muted text-sm">
                  <span className="font-medium">{node.label}</span>
                  <span className="text-muted-foreground ml-2">({node.type})</span>
                </div>
                {idx < generatedNodes.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleAddToCanvas} className="flex-1 gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Add to Canvas
            </Button>
            <Button variant="outline" onClick={() => setGeneratedNodes(null)}>
              Discard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
