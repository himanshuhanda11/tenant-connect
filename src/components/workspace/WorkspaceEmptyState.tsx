import React from 'react';
import { Sparkles, ArrowUp } from 'lucide-react';
import workspaceEmptyIllustration from '@/assets/workspace-empty-illustration.png';

export default function WorkspaceEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
      <img 
        src={workspaceEmptyIllustration} 
        alt="Create your first workspace" 
        className="w-40 h-40 sm:w-52 sm:h-52 object-contain mb-6"
        loading="lazy"
        decoding="async"
      />
      
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
