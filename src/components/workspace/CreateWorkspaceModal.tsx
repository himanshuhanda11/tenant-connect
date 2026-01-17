import React, { useState } from 'react';
import { Loader2, Building2, MessageSquare, Headphones, Megaphone, TestTube, Wifi, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

interface CreateWorkspaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateWorkspace: (name: string, purpose: string, connectNow: boolean) => Promise<void>;
  isCreating: boolean;
}

const purposes = [
  { value: 'sales', label: 'Sales', icon: MessageSquare, description: 'Lead generation & conversion' },
  { value: 'support', label: 'Support', icon: Headphones, description: 'Customer service & help' },
  { value: 'marketing', label: 'Marketing', icon: Megaphone, description: 'Campaigns & promotions' },
  { value: 'demo', label: 'Demo / Test', icon: TestTube, description: 'Testing & development' },
];

export default function CreateWorkspaceModal({
  open,
  onOpenChange,
  onCreateWorkspace,
  isCreating,
}: CreateWorkspaceModalProps) {
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('sales');
  const [connectNow, setConnectNow] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onCreateWorkspace(name.trim(), purpose, connectNow);
    setName('');
    setPurpose('sales');
    setConnectNow(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-emerald-500/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Create workspace</DialogTitle>
              <DialogDescription className="text-sm">
                Set up a new workspace for your business
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Workspace Name */}
          <div className="space-y-2">
            <Label htmlFor="workspace-name" className="text-sm font-medium">
              Workspace name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="workspace-name"
              placeholder="e.g., My Brand Support"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11"
              autoFocus
            />
          </div>

          {/* Purpose Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Workspace purpose</Label>
            <div className="grid grid-cols-2 gap-3">
              {purposes.map((p) => {
                const Icon = p.icon;
                const isSelected = purpose === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPurpose(p.value)}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/30 hover:bg-muted/50"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                      isSelected ? "bg-primary/10" : "bg-muted"
                    )}>
                      <Icon className={cn("w-4 h-4", isSelected ? "text-primary" : "text-muted-foreground")} />
                    </div>
                    <div>
                      <p className={cn("font-medium text-sm", isSelected ? "text-primary" : "text-foreground")}>
                        {p.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{p.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* WhatsApp Setup Option */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">WhatsApp setup</Label>
            <RadioGroup value={connectNow ? 'now' : 'later'} onValueChange={(v) => setConnectNow(v === 'now')}>
              <div className={cn(
                "flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all",
                connectNow ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
              )}>
                <RadioGroupItem value="now" id="connect-now" />
                <div className="flex items-center gap-2 flex-1">
                  <Wifi className={cn("w-4 h-4", connectNow ? "text-primary" : "text-muted-foreground")} />
                  <Label htmlFor="connect-now" className="cursor-pointer font-medium text-sm">
                    Connect WhatsApp now
                  </Label>
                </div>
              </div>
              <div className={cn(
                "flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all",
                !connectNow ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
              )}>
                <RadioGroupItem value="later" id="connect-later" />
                <div className="flex items-center gap-2 flex-1">
                  <Clock className={cn("w-4 h-4", !connectNow ? "text-primary" : "text-muted-foreground")} />
                  <Label htmlFor="connect-later" className="cursor-pointer font-medium text-sm">
                    Do it later
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={!name.trim() || isCreating}
              className="w-full h-11 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/20"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating workspace...
                </>
              ) : (
                'Create workspace'
              )}
            </Button>
          </div>

          {/* Footer Microcopy */}
          <p className="text-xs text-center text-muted-foreground">
            Each workspace is linked to one WhatsApp Business API number.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
