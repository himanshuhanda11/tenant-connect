import React from 'react';
import { Lightbulb } from 'lucide-react';

interface WorkspaceTipProps {
  message?: string;
}

export function WorkspaceTip({ message = "Each workspace is associated with one WhatsApp Business API number." }: WorkspaceTipProps) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30">
      <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/50">
        <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
      </div>
      <p className="text-sm text-amber-800 dark:text-amber-200">
        {message}
      </p>
    </div>
  );
}
