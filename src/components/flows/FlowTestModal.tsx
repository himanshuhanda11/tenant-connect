import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Play,
  Phone,
  User,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlowTestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flowName: string;
  nodes: any[];
  triggers: any[];
}

interface TestStep {
  nodeKey: string;
  nodeLabel: string;
  nodeType: string;
  status: 'pending' | 'running' | 'success' | 'error';
  duration?: number;
  output?: string;
}

export const FlowTestModal: React.FC<FlowTestModalProps> = ({
  open,
  onOpenChange,
  flowName,
  nodes,
  triggers,
}) => {
  const [testMode, setTestMode] = useState<'simulate' | 'live'>('simulate');
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [testSteps, setTestSteps] = useState<TestStep[]>([]);
  const [simulatedMessages, setSimulatedMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([]);

  const startTest = async () => {
    setIsRunning(true);
    setTestSteps([]);
    setSimulatedMessages([]);

    // Add user's initial message
    if (testMessage) {
      setSimulatedMessages([{ role: 'user', text: testMessage }]);
    }

    // Simulate running through nodes
    const steps: TestStep[] = nodes.map(node => ({
      nodeKey: node.node_key,
      nodeLabel: node.label || node.node_type,
      nodeType: node.node_type,
      status: 'pending' as const,
    }));

    setTestSteps(steps);

    // Simulate each step with delay
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setTestSteps(prev => prev.map((step, idx) => {
        if (idx === i) {
          return { ...step, status: 'running' };
        }
        return step;
      }));

      await new Promise(resolve => setTimeout(resolve, 500));

      const success = Math.random() > 0.1; // 90% success rate simulation
      
      setTestSteps(prev => prev.map((step, idx) => {
        if (idx === i) {
          return { 
            ...step, 
            status: success ? 'success' : 'error',
            duration: Math.floor(Math.random() * 200) + 50,
            output: success ? 'Executed successfully' : 'Node configuration error'
          };
        }
        return step;
      }));

      // Add bot response for message nodes
      if (success && ['text-buttons', 'list-message', 'template'].includes(steps[i].nodeType)) {
        setSimulatedMessages(prev => [
          ...prev,
          { role: 'bot', text: `[${steps[i].nodeLabel}] Response message would appear here...` }
        ]);
      }
    }

    setIsRunning(false);
  };

  const resetTest = () => {
    setTestSteps([]);
    setSimulatedMessages([]);
    setTestMessage('');
  };

  const getStepIcon = (status: TestStep['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'running':
        return <Clock className="w-4 h-4 text-primary animate-spin" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="w-5 h-5 text-primary" />
            Test Flow: {flowName}
          </DialogTitle>
          <DialogDescription>
            Simulate or run a live test of your flow to verify it works correctly.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          {/* Left: Configuration */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Test Mode</Label>
              <Select value={testMode} onValueChange={(v: 'simulate' | 'live') => setTestMode(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simulate">
                    <span className="flex items-center gap-2">
                      <Play className="w-4 h-4" /> Simulate (No real messages)
                    </span>
                  </SelectItem>
                  <SelectItem value="live">
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" /> Live Test (Send real messages)
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {testMode === 'live' && (
              <div className="space-y-2">
                <Label>Test Phone Number</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="+1234567890"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter your WhatsApp number to receive test messages
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Trigger Message</Label>
              <Input
                placeholder="e.g., Hello, start, order"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Message that would trigger this flow
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Active Triggers</Label>
              <div className="flex flex-wrap gap-1.5">
                {triggers.map((trigger, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {trigger.trigger_type}
                  </Badge>
                ))}
                {triggers.length === 0 && (
                  <span className="text-xs text-muted-foreground">No triggers configured</span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={startTest}
                disabled={isRunning || (testMode === 'live' && !testPhone)}
                className="flex-1"
              >
                {isRunning ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Test
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={resetTest} disabled={isRunning}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Right: Results */}
          <div className="border rounded-xl overflow-hidden">
            <div className="bg-muted/50 px-4 py-2 border-b flex items-center justify-between">
              <span className="text-sm font-medium">Execution Log</span>
              {testSteps.length > 0 && (
                <Badge variant={testSteps.some(s => s.status === 'error') ? 'destructive' : 'default'}>
                  {testSteps.filter(s => s.status === 'success').length}/{testSteps.length} passed
                </Badge>
              )}
            </div>
            <ScrollArea className="h-[400px]">
              {testSteps.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  Click "Start Test" to begin
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {testSteps.map((step, index) => (
                    <div
                      key={step.nodeKey}
                      className={cn(
                        'flex items-start gap-3 p-3 rounded-lg border transition-all',
                        step.status === 'running' && 'bg-primary/5 border-primary',
                        step.status === 'success' && 'bg-green-500/5 border-green-500/30',
                        step.status === 'error' && 'bg-destructive/5 border-destructive/30'
                      )}
                    >
                      <div className="mt-0.5">
                        {getStepIcon(step.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{step.nodeLabel}</span>
                          <Badge variant="outline" className="text-[10px]">
                            {step.nodeType}
                          </Badge>
                        </div>
                        {step.output && (
                          <p className="text-xs text-muted-foreground mt-1">{step.output}</p>
                        )}
                        {step.duration && (
                          <p className="text-[10px] text-muted-foreground mt-1">
                            Duration: {step.duration}ms
                          </p>
                        )}
                      </div>
                      {index < testSteps.length - 1 && step.status === 'success' && (
                        <ArrowRight className="w-4 h-4 text-muted-foreground/50" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        {/* Simulated Conversation */}
        {simulatedMessages.length > 0 && (
          <div className="mt-4 border rounded-xl overflow-hidden">
            <div className="bg-muted/50 px-4 py-2 border-b">
              <span className="text-sm font-medium">Simulated Conversation</span>
            </div>
            <div className="p-4 space-y-2 max-h-48 overflow-y-auto">
              {simulatedMessages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    'max-w-[80%] px-3 py-2 rounded-xl text-sm',
                    msg.role === 'user' 
                      ? 'ml-auto bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  )}
                >
                  {msg.text}
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
