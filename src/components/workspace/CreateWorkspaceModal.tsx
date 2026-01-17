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
  { value: 'sales', label: 'Sales', icon: MessageSquare },
  { value: 'support', label: 'Support', icon: Headphones },
  { value: 'marketing', label: 'Marketing', icon: Megaphone },
  { value: 'demo', label: 'Demo / Test', icon: TestTube },
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
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <DialogTitle className="text-lg">Create workspace</DialogTitle>
              <DialogDescription className="text-xs">
                Set up a new workspace for your business
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Workspace Name */}
          <div className="space-y-1.5">
            <Label htmlFor="workspace-name" className="text-sm font-medium">
              Workspace name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="workspace-name"
              placeholder="e.g., My Brand Support"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10"
              autoFocus
            />
          </div>

          {/* Purpose Selection - Compact Grid */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Purpose</Label>
            <div className="grid grid-cols-2 gap-2">
              {purposes.map((p) => {
                const Icon = p.icon;
                const isSelected = purpose === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPurpose(p.value)}
                    className={cn(
                      "flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all",
                      isSelected
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    <Icon className={cn("w-4 h-4", isSelected ? "text-green-600" : "text-gray-400")} />
                    <span className={cn("text-sm font-medium", isSelected ? "text-green-700" : "text-gray-700")}>
                      {p.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* WhatsApp Setup Option - Compact */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">WhatsApp setup</Label>
            <RadioGroup 
              value={connectNow ? 'now' : 'later'} 
              onValueChange={(v) => setConnectNow(v === 'now')}
              className="grid grid-cols-2 gap-2"
            >
              <div className={cn(
                "flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all",
                connectNow ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
              )}>
                <RadioGroupItem value="now" id="connect-now" className="sr-only" />
                <Wifi className={cn("w-4 h-4", connectNow ? "text-green-600" : "text-gray-400")} />
                <Label htmlFor="connect-now" className={cn(
                  "cursor-pointer text-sm font-medium",
                  connectNow ? "text-green-700" : "text-gray-700"
                )}>
                  Connect now
                </Label>
              </div>
              <div className={cn(
                "flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all",
                !connectNow ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
              )}>
                <RadioGroupItem value="later" id="connect-later" className="sr-only" />
                <Clock className={cn("w-4 h-4", !connectNow ? "text-green-600" : "text-gray-400")} />
                <Label htmlFor="connect-later" className={cn(
                  "cursor-pointer text-sm font-medium",
                  !connectNow ? "text-green-700" : "text-gray-700"
                )}>
                  Do it later
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!name.trim() || isCreating}
            className="w-full h-10 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create workspace'
            )}
          </Button>

          {/* Footer Microcopy */}
          <p className="text-xs text-center text-gray-400">
            Each workspace is linked to one WhatsApp Business API number.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
