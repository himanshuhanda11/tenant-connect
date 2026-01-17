import React from 'react';
import { Building2, Sparkles, ArrowUp } from 'lucide-react';

export default function WorkspaceEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-emerald-500/10 flex items-center justify-center mb-6 border border-primary/10">
        <Building2 className="w-10 h-10 text-primary/40" />
      </div>
      
      <div className="text-center max-w-md">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-semibold text-foreground">Welcome! 🎉</h3>
        </div>
        
        <p className="text-muted-foreground mb-6">
          You don't have any workspaces yet. Create your first workspace above to get started with WhatsApp Business messaging.
        </p>

        <div className="inline-flex items-center gap-2 text-sm text-primary font-medium animate-bounce">
          <ArrowUp className="w-4 h-4" />
          <span>Create your first workspace</span>
        </div>
      </div>
    </div>
  );
}
