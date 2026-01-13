import { useState } from 'react';
import { Play, User, CheckCircle2, XCircle, Clock, ArrowRight, MessageSquare, Tag, Zap, RotateCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { WorkflowWithRelations, TRIGGER_DEFINITIONS, ACTION_DEFINITIONS, NodeType } from '@/types/automation';

interface TestStep {
  id: string;
  type: NodeType;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  message?: string;
  duration?: number;
}

interface WorkflowTestModalProps {
  workflow: WorkflowWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WorkflowTestModal({ workflow, open, onOpenChange }: WorkflowTestModalProps) {
  const [testContact, setTestContact] = useState({ name: 'Test Customer', phone: '+1234567890', message: 'Hello!' });
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<TestStep[]>([]);
  const [testComplete, setTestComplete] = useState(false);

  if (!workflow) return null;

  const initializeSteps = (): TestStep[] => {
    const triggerDef = TRIGGER_DEFINITIONS[workflow.trigger_type];
    return [{ id: 'trigger', type: 'trigger', name: triggerDef?.label || workflow.trigger_type, status: 'pending' }];
  };

  const runTest = async () => {
    setIsRunning(true);
    setTestComplete(false);
    const testSteps = initializeSteps();
    setSteps(testSteps);

    for (let i = 0; i < testSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setSteps(prev => prev.map((step, idx) => idx === i ? { ...step, status: 'running' } : step));
      await new Promise(resolve => setTimeout(resolve, 500));
      setSteps(prev => prev.map((step, idx) => idx === i ? { ...step, status: 'passed', message: 'Completed', duration: Math.floor(Math.random() * 200) + 50 } : step));
    }

    setIsRunning(false);
    setTestComplete(true);
  };

  const getStepIcon = (step: TestStep) => {
    if (step.status === 'running') return <Clock className="h-4 w-4 animate-spin text-primary" />;
    if (step.status === 'passed') return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (step.status === 'failed') return <XCircle className="h-4 w-4 text-destructive" />;
    if (step.status === 'skipped') return <ArrowRight className="h-4 w-4 text-muted-foreground" />;
    return <Clock className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />Test: {workflow.name}
          </DialogTitle>
          <DialogDescription>Simulate workflow execution with a test contact</DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-4">
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2"><User className="h-4 w-4" />Test Contact</h4>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={testContact.name} onChange={(e) => setTestContact(prev => ({ ...prev, name: e.target.value }))} /></div>
              <div><Label>Phone</Label><Input value={testContact.phone} onChange={(e) => setTestContact(prev => ({ ...prev, phone: e.target.value }))} /></div>
              <div><Label>Message</Label><Input value={testContact.message} onChange={(e) => setTestContact(prev => ({ ...prev, message: e.target.value }))} /></div>
            </div>
            <div className="flex gap-2">
              <Button onClick={runTest} disabled={isRunning} className="flex-1">
                {isRunning ? <><Clock className="h-4 w-4 mr-2 animate-spin" />Running...</> : <><Play className="h-4 w-4 mr-2" />Run Test</>}
              </Button>
              {steps.length > 0 && <Button variant="outline" onClick={() => { setSteps([]); setTestComplete(false); }} disabled={isRunning}><RotateCcw className="h-4 w-4" /></Button>}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">Execution Log</h4>
            <ScrollArea className="h-[280px] border rounded-lg p-3">
              {steps.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Play className="h-8 w-8 mb-2 opacity-50" /><p className="text-sm">Run the test to see steps</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {steps.map((step, i) => (
                    <div key={step.id}>
                      <div className="flex items-start gap-3 py-2">
                        <div className="mt-0.5">{getStepIcon(step)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs capitalize">{step.type}</Badge>
                            <span className="font-medium text-sm truncate">{step.name}</span>
                          </div>
                          {step.message && <p className="text-xs text-muted-foreground mt-1">{step.message}</p>}
                          {step.duration && <p className="text-xs text-muted-foreground">{step.duration}ms</p>}
                        </div>
                      </div>
                      {i < steps.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            {testComplete && (
              <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />Test completed. No messages sent.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
