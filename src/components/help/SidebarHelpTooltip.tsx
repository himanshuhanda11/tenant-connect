import { Link } from 'react-router-dom';
import { Info, ExternalLink } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SidebarHelpTooltipProps {
  description: string;
  helpUrl: string;
}

export function SidebarHelpTooltip({ description, helpUrl }: SidebarHelpTooltipProps) {
  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <button className="p-0.5 rounded hover:bg-sidebar-accent transition-colors">
          <Info className="h-3.5 w-3.5 text-sidebar-foreground/40 hover:text-sidebar-foreground/70" />
        </button>
      </TooltipTrigger>
      <TooltipContent 
        side="right" 
        align="start"
        className="max-w-[280px] p-3"
      >
        <p className="text-sm mb-2">{description}</p>
        <Link 
          to={helpUrl}
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          Learn more
          <ExternalLink className="h-3 w-3" />
        </Link>
      </TooltipContent>
    </Tooltip>
  );
}
