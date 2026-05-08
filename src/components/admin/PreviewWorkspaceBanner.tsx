import { Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePreviewWorkspace } from '@/contexts/PreviewWorkspaceContext';
import { useTenant } from '@/contexts/TenantContext';

export function PreviewWorkspaceBanner() {
  const { isPreview, exit } = usePreviewWorkspace();
  const { currentTenant } = useTenant();
  if (!isPreview) return null;
  return (
    <div className="sticky top-0 z-[60] border-b bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 px-3 sm:px-4 py-2 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <Eye className="h-4 w-4 text-amber-600 shrink-0" />
        <Badge variant="outline" className="rounded-full text-[10px] bg-amber-100 text-amber-700 border-amber-300 shrink-0">
          Super Admin Preview
        </Badge>
        <span className="text-xs sm:text-sm text-amber-800 dark:text-amber-200 truncate">
          Previewing <span className="font-semibold">{currentTenant?.name || '…'}</span> as the customer would see it.
        </span>
      </div>
      <Button size="sm" variant="outline" className="rounded-xl h-7 text-xs border-amber-300 shrink-0" onClick={exit}>
        <X className="h-3 w-3 mr-1" /> Exit
      </Button>
    </div>
  );
}
