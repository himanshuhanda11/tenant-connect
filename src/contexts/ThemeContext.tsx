import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from './TenantContext';

// 20 professional themes
export const THEMES = [
  { id: 'default', name: 'WhatsApp Green', primary: '142 70% 45%', accent: '142 60% 94%', accentFg: '142 70% 30%' },
  { id: 'ocean', name: 'Ocean Blue', primary: '210 80% 50%', accent: '210 60% 94%', accentFg: '210 80% 30%' },
  { id: 'royal', name: 'Royal Purple', primary: '270 65% 55%', accent: '270 50% 94%', accentFg: '270 65% 35%' },
  { id: 'sunset', name: 'Sunset Orange', primary: '25 90% 55%', accent: '25 70% 94%', accentFg: '25 90% 35%' },
  { id: 'rose', name: 'Rose Pink', primary: '345 75% 55%', accent: '345 60% 94%', accentFg: '345 75% 35%' },
  { id: 'teal', name: 'Teal', primary: '175 70% 40%', accent: '175 50% 93%', accentFg: '175 70% 25%' },
  { id: 'indigo', name: 'Indigo', primary: '240 60% 55%', accent: '240 50% 94%', accentFg: '240 60% 35%' },
  { id: 'amber', name: 'Amber Gold', primary: '38 92% 50%', accent: '38 70% 93%', accentFg: '38 92% 30%' },
  { id: 'emerald', name: 'Emerald', primary: '160 84% 39%', accent: '160 60% 93%', accentFg: '160 84% 25%' },
  { id: 'crimson', name: 'Crimson', primary: '0 72% 50%', accent: '0 55% 94%', accentFg: '0 72% 30%' },
  { id: 'slate', name: 'Slate', primary: '215 25% 40%', accent: '215 20% 94%', accentFg: '215 25% 25%' },
  { id: 'violet', name: 'Violet', primary: '290 60% 50%', accent: '290 45% 94%', accentFg: '290 60% 30%' },
  { id: 'cyan', name: 'Cyan', primary: '190 80% 45%', accent: '190 60% 93%', accentFg: '190 80% 28%' },
  { id: 'lime', name: 'Lime', primary: '85 70% 45%', accent: '85 55% 93%', accentFg: '85 70% 28%' },
  { id: 'fuchsia', name: 'Fuchsia', primary: '310 70% 55%', accent: '310 55% 94%', accentFg: '310 70% 35%' },
  { id: 'sky', name: 'Sky', primary: '199 89% 48%', accent: '199 65% 93%', accentFg: '199 89% 30%' },
  { id: 'bronze', name: 'Bronze', primary: '30 50% 45%', accent: '30 35% 93%', accentFg: '30 50% 28%' },
  { id: 'forest', name: 'Forest', primary: '150 50% 35%', accent: '150 35% 93%', accentFg: '150 50% 22%' },
  { id: 'midnight', name: 'Midnight', primary: '230 50% 45%', accent: '230 35% 93%', accentFg: '230 50% 28%' },
  { id: 'coral', name: 'Coral', primary: '16 80% 58%', accent: '16 60% 94%', accentFg: '16 80% 35%' },
] as const;

export type ThemeId = typeof THEMES[number]['id'];
export type ThemeMode = 'light' | 'dark' | 'system';
export type Density = 'comfortable' | 'compact';
export type BorderRadius = 'small' | 'medium' | 'large';

interface WorkspaceAppearance {
  theme: ThemeId;
  mode: ThemeMode;
  accent_color: string | null;
  density: Density;
  border_radius: BorderRadius;
  reduce_motion: boolean;
}

interface ThemeContextType {
  appearance: WorkspaceAppearance;
  setAppearance: (updates: Partial<WorkspaceAppearance>) => Promise<void>;
  saving: boolean;
  resolvedMode: 'light' | 'dark';
}

const defaultAppearance: WorkspaceAppearance = {
  theme: 'default',
  mode: 'system',
  accent_color: null,
  density: 'comfortable',
  border_radius: 'medium',
  reduce_motion: false,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const RADIUS_MAP: Record<BorderRadius, string> = {
  small: '0.375rem',
  medium: '0.625rem',
  large: '1rem',
};

function getSystemMode(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { currentTenant } = useTenant();
  const [appearance, setAppearanceState] = useState<WorkspaceAppearance>(defaultAppearance);
  const [saving, setSaving] = useState(false);
  const [systemMode, setSystemMode] = useState<'light' | 'dark'>(getSystemMode);

  // Listen for system theme changes
  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setSystemMode(mql.matches ? 'dark' : 'light');
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const resolvedMode = appearance.mode === 'system' ? systemMode : appearance.mode;

  // Fetch workspace appearance
  useEffect(() => {
    if (!currentTenant) return;
    
    supabase
      .from('workspace_appearance')
      .select('*')
      .eq('workspace_id', currentTenant.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setAppearanceState({
            theme: data.theme as ThemeId,
            mode: data.mode as ThemeMode,
            accent_color: data.accent_color,
            density: data.density as Density,
            border_radius: data.border_radius as BorderRadius,
            reduce_motion: data.reduce_motion,
          });
        } else {
          setAppearanceState(defaultAppearance);
        }
      });
  }, [currentTenant?.id]);

  // Apply theme to DOM
  useEffect(() => {
    const root = document.documentElement;
    
    // Dark mode class
    if (resolvedMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply theme colors
    const theme = THEMES.find(t => t.id === appearance.theme) || THEMES[0];
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--accent-foreground', theme.accentFg);
    root.style.setProperty('--ring', theme.primary);
    root.style.setProperty('--sidebar-primary', theme.primary);
    root.style.setProperty('--sidebar-ring', theme.primary);

    // Border radius
    root.style.setProperty('--radius', RADIUS_MAP[appearance.border_radius]);

    // Density
    if (appearance.density === 'compact') {
      root.classList.add('density-compact');
    } else {
      root.classList.remove('density-compact');
    }

    // Reduce motion
    if (appearance.reduce_motion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  }, [appearance, resolvedMode]);

  const setAppearance = useCallback(async (updates: Partial<WorkspaceAppearance>) => {
    if (!currentTenant) return;
    
    const newAppearance = { ...appearance, ...updates };
    setAppearanceState(newAppearance);
    setSaving(true);

    try {
      const { error } = await supabase
        .from('workspace_appearance')
        .upsert({
          workspace_id: currentTenant.id,
          theme: newAppearance.theme,
          mode: newAppearance.mode,
          accent_color: newAppearance.accent_color,
          density: newAppearance.density,
          border_radius: newAppearance.border_radius,
          reduce_motion: newAppearance.reduce_motion,
        }, { onConflict: 'workspace_id' });

      if (error) console.error('Failed to save appearance:', error);
    } finally {
      setSaving(false);
    }
  }, [currentTenant, appearance]);

  return (
    <ThemeContext.Provider value={{ appearance, setAppearance, saving, resolvedMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
