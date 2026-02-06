import { useState, useEffect, createContext, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, X } from 'lucide-react';

interface ImpersonationState {
  workspaceId: string | null;
  workspaceName: string | null;
  start: (id: string, name: string) => void;
  stop: () => void;
  active: boolean;
}

const ImpersonationContext = createContext<ImpersonationState>({
  workspaceId: null,
  workspaceName: null,
  start: () => {},
  stop: () => {},
  active: false,
});

export function useImpersonation() {
  return useContext(ImpersonationContext);
}

export function ImpersonationProvider({ children }: { children: React.ReactNode }) {
  const [workspaceId, setWorkspaceId] = useState<string | null>(() =>
    localStorage.getItem('impersonation_workspace_id')
  );
  const [workspaceName, setWorkspaceName] = useState<string | null>(() =>
    localStorage.getItem('impersonation_workspace_name')
  );

  const start = (id: string, name: string) => {
    localStorage.setItem('impersonation_workspace_id', id);
    localStorage.setItem('impersonation_workspace_name', name);
    setWorkspaceId(id);
    setWorkspaceName(name);
  };

  const stop = () => {
    localStorage.removeItem('impersonation_workspace_id');
    localStorage.removeItem('impersonation_workspace_name');
    setWorkspaceId(null);
    setWorkspaceName(null);
  };

  return (
    <ImpersonationContext.Provider
      value={{ workspaceId, workspaceName, start, stop, active: !!workspaceId }}
    >
      {children}
    </ImpersonationContext.Provider>
  );
}

export function ImpersonationBanner() {
  const { active, workspaceName, workspaceId, stop } = useImpersonation();

  if (!active) return null;

  return (
    <div className="sticky top-0 z-50 border-b bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Eye className="h-4 w-4 text-amber-600" />
        <Badge variant="outline" className="rounded-full text-[10px] bg-amber-100 text-amber-700 border-amber-300">
          Read-only
        </Badge>
        <span className="text-sm text-amber-800 dark:text-amber-200">
          Viewing workspace <span className="font-semibold">{workspaceName || workspaceId}</span> as customer (impersonation mode).
        </span>
      </div>
      <Button size="sm" variant="outline" className="rounded-xl h-7 text-xs border-amber-300" onClick={stop}>
        <X className="h-3 w-3 mr-1" />
        Exit
      </Button>
    </div>
  );
}
