/**
 * Super-admin "Preview workspace" mode.
 *
 * When a super admin opens a customer's dashboard in a new tab via
 * `/dashboard?preview_workspace=<tenant_id>`, this provider:
 *   - reads the id (from URL or sessionStorage, scoped per-tab),
 *   - persists it in sessionStorage so it survives navigation in that tab only,
 *   - exposes { previewTenantId, isPreview, exit }.
 *
 * The TenantContext consumes this to override `currentTenant` with the
 * previewed workspace. The super admin's auth session is reused as-is
 * (read access already covered by platform-admin RLS policies).
 */
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const KEY = 'preview_workspace_id';

interface Ctx {
  previewTenantId: string | null;
  isPreview: boolean;
  exit: () => void;
}

const PreviewWorkspaceContext = createContext<Ctx>({
  previewTenantId: null,
  isPreview: false,
  exit: () => {},
});

export function PreviewWorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [previewTenantId, setPreviewTenantId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const url = new URL(window.location.href);
      const fromUrl = url.searchParams.get('preview_workspace');
      if (fromUrl) {
        sessionStorage.setItem(KEY, fromUrl);
        // Strip the param so it isn't propagated by client-side navigation.
        url.searchParams.delete('preview_workspace');
        window.history.replaceState({}, '', url.toString());
        return fromUrl;
      }
      return sessionStorage.getItem(KEY);
    } catch {
      return null;
    }
  });

  const exit = () => {
    try { sessionStorage.removeItem(KEY); } catch {}
    setPreviewTenantId(null);
    // Close this tab if it was opened from admin; otherwise just reload.
    if (window.opener) window.close();
    else window.location.href = '/control/workspaces';
  };

  // Re-sync if another component clears it.
  useEffect(() => {
    const handler = () => setPreviewTenantId(sessionStorage.getItem(KEY));
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const value = useMemo(
    () => ({ previewTenantId, isPreview: !!previewTenantId, exit }),
    [previewTenantId]
  );

  return (
    <PreviewWorkspaceContext.Provider value={value}>
      {children}
    </PreviewWorkspaceContext.Provider>
  );
}

export function usePreviewWorkspace() {
  return useContext(PreviewWorkspaceContext);
}
