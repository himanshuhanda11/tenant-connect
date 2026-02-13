import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from './TenantContext';

// Full theme palette for both light and dark
interface ThemePalette {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  border: string;
  input: string;
  ring: string;
  sidebarBackground: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
}

interface ThemeDefinition {
  id: string;
  name: string;
  light: ThemePalette;
  dark: ThemePalette;
}

// Helper to build light palette from a primary hue
function buildLightPalette(h: number, s: number, l: number): ThemePalette {
  return {
    background: '0 0% 98%',
    foreground: `${h} 15% 10%`,
    card: '0 0% 100%',
    cardForeground: `${h} 15% 10%`,
    popover: '0 0% 100%',
    popoverForeground: `${h} 15% 10%`,
    primary: `${h} ${s}% ${l}%`,
    primaryForeground: '0 0% 100%',
    secondary: `${h} 10% 96%`,
    secondaryForeground: `${h} 15% 10%`,
    muted: `${h} 10% 96%`,
    mutedForeground: `${h} 8% 46%`,
    accent: `${h} ${Math.round(s * 0.7)}% 94%`,
    accentForeground: `${h} ${s}% ${Math.max(l - 15, 20)}%`,
    border: `${h} 10% 90%`,
    input: `${h} 10% 90%`,
    ring: `${h} ${s}% ${l}%`,
    sidebarBackground: '0 0% 100%',
    sidebarForeground: `${h} 20% 12%`,
    sidebarPrimary: `${h} ${s}% ${l}%`,
    sidebarPrimaryForeground: '0 0% 100%',
    sidebarAccent: `${h} 10% 94%`,
    sidebarAccentForeground: `${h} 20% 10%`,
    sidebarBorder: `${h} 10% 90%`,
  };
}

function buildDarkPalette(h: number, s: number, l: number): ThemePalette {
  return {
    background: `${h} 20% 6%`,
    foreground: `${h} 8% 95%`,
    card: `${h} 20% 10%`,
    cardForeground: `${h} 8% 95%`,
    popover: `${h} 20% 10%`,
    popoverForeground: `${h} 8% 95%`,
    primary: `${h} ${s}% ${l}%`,
    primaryForeground: '0 0% 100%',
    secondary: `${h} 15% 16%`,
    secondaryForeground: `${h} 8% 95%`,
    muted: `${h} 15% 16%`,
    mutedForeground: `${h} 8% 55%`,
    accent: `${h} ${Math.round(s * 0.6)}% 15%`,
    accentForeground: `${h} ${s}% 60%`,
    border: `${h} 15% 18%`,
    input: `${h} 15% 18%`,
    ring: `${h} ${s}% ${l}%`,
    sidebarBackground: `${h} 25% 6%`,
    sidebarForeground: `${h} 8% 85%`,
    sidebarPrimary: `${h} ${s}% ${l}%`,
    sidebarPrimaryForeground: '0 0% 100%',
    sidebarAccent: `${h} 18% 12%`,
    sidebarAccentForeground: `${h} 8% 95%`,
    sidebarBorder: `${h} 18% 12%`,
  };
}

function theme(id: string, name: string, h: number, s: number, l: number): ThemeDefinition {
  return { id, name, light: buildLightPalette(h, s, l), dark: buildDarkPalette(h, s, l) };
}

// Special dark-first themes
function darkTheme(id: string, name: string, h: number, s: number, l: number): ThemeDefinition {
  const dark = buildDarkPalette(h, s, l);
  // For dark-first themes, the light mode is also dark-ish
  return {
    id,
    name,
    light: {
      ...dark,
      background: `${h} 18% 8%`,
      card: `${h} 18% 12%`,
      cardForeground: `${h} 8% 92%`,
      foreground: `${h} 8% 92%`,
      popover: `${h} 18% 12%`,
      popoverForeground: `${h} 8% 92%`,
      muted: `${h} 14% 15%`,
      mutedForeground: `${h} 8% 55%`,
      border: `${h} 14% 18%`,
      input: `${h} 14% 18%`,
      sidebarBackground: `${h} 22% 7%`,
      sidebarBorder: `${h} 14% 14%`,
      secondary: `${h} 14% 16%`,
      secondaryForeground: `${h} 8% 92%`,
    },
    dark,
  };
}

export const THEMES: ThemeDefinition[] = [
  theme('default', 'WhatsApp Green', 142, 70, 45),
  theme('ocean', 'Ocean Blue', 210, 80, 50),
  theme('royal', 'Royal Purple', 270, 65, 55),
  theme('sunset', 'Sunset Orange', 25, 90, 55),
  theme('rose', 'Rose Pink', 345, 75, 55),
  theme('teal', 'Teal', 175, 70, 40),
  theme('indigo', 'Indigo', 240, 60, 55),
  theme('amber', 'Amber Gold', 38, 92, 50),
  theme('emerald', 'Emerald', 160, 84, 39),
  theme('crimson', 'Crimson', 0, 72, 50),
  theme('slate', 'Slate', 215, 25, 40),
  theme('violet', 'Violet', 290, 60, 50),
  theme('cyan', 'Cyan', 190, 80, 45),
  theme('lime', 'Lime', 85, 70, 45),
  theme('fuchsia', 'Fuchsia', 310, 70, 55),
  theme('sky', 'Sky', 199, 89, 48),
  theme('bronze', 'Bronze', 30, 50, 45),
  theme('forest', 'Forest', 150, 50, 35),
  // Dark-first themes
  darkTheme('midnight', 'Midnight Dark', 230, 50, 45),
  theme('coral', 'Coral', 16, 80, 58),
];

export type ThemeId = string;
export type ThemeMode = 'light' | 'dark' | 'system';
export type Density = 'comfortable' | 'compact';
export type BorderRadius = 'small' | 'medium' | 'large';

interface WorkspaceAppearance {
  theme: ThemeId;
  mode: ThemeMode;
  accent_color: string | null;
  sidebar_color: string | null;
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
  sidebar_color: null,
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

function hexToHsl(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

// Apply full palette to root
function applyPalette(root: HTMLElement, palette: ThemePalette) {
  root.style.setProperty('--background', palette.background);
  root.style.setProperty('--foreground', palette.foreground);
  root.style.setProperty('--card', palette.card);
  root.style.setProperty('--card-foreground', palette.cardForeground);
  root.style.setProperty('--popover', palette.popover);
  root.style.setProperty('--popover-foreground', palette.popoverForeground);
  root.style.setProperty('--primary', palette.primary);
  root.style.setProperty('--primary-foreground', palette.primaryForeground);
  root.style.setProperty('--secondary', palette.secondary);
  root.style.setProperty('--secondary-foreground', palette.secondaryForeground);
  root.style.setProperty('--muted', palette.muted);
  root.style.setProperty('--muted-foreground', palette.mutedForeground);
  root.style.setProperty('--accent', palette.accent);
  root.style.setProperty('--accent-foreground', palette.accentForeground);
  root.style.setProperty('--border', palette.border);
  root.style.setProperty('--input', palette.input);
  root.style.setProperty('--ring', palette.ring);
  root.style.setProperty('--sidebar-background', palette.sidebarBackground);
  root.style.setProperty('--sidebar-foreground', palette.sidebarForeground);
  root.style.setProperty('--sidebar-primary', palette.sidebarPrimary);
  root.style.setProperty('--sidebar-primary-foreground', palette.sidebarPrimaryForeground);
  root.style.setProperty('--sidebar-accent', palette.sidebarAccent);
  root.style.setProperty('--sidebar-accent-foreground', palette.sidebarAccentForeground);
  root.style.setProperty('--sidebar-border', palette.sidebarBorder);
  root.style.setProperty('--sidebar-ring', palette.sidebarPrimary);
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
            sidebar_color: (data as any).sidebar_color ?? null,
            density: data.density as Density,
            border_radius: data.border_radius as BorderRadius,
            reduce_motion: data.reduce_motion,
          });
        } else {
          setAppearanceState(defaultAppearance);
        }
      });
  }, [currentTenant?.id]);

  // Apply theme to DOM — FULL PALETTE
  useEffect(() => {
    const root = document.documentElement;
    
    // Dark mode class
    if (resolvedMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Find theme and apply full palette
    const themeDef = THEMES.find(t => t.id === appearance.theme) || THEMES[0];
    const palette = resolvedMode === 'dark' ? themeDef.dark : themeDef.light;
    applyPalette(root, palette);

    // Apply custom sidebar color override
    if (appearance.sidebar_color) {
      const hex = appearance.sidebar_color;
      // Convert hex to HSL for CSS variables
      const hsl = hexToHsl(hex);
      if (hsl) {
        const [h, s, l] = hsl;
        const hslStr = `${h} ${s}% ${l}%`;
        root.style.setProperty('--sidebar-background', hslStr);
        // Derive sidebar foreground based on luminance
        const fgLight = l < 50;
        root.style.setProperty('--sidebar-foreground', fgLight ? `${h} 10% 95%` : `${h} 20% 10%`);
        root.style.setProperty('--sidebar-accent', fgLight ? `${h} ${Math.min(s + 10, 100)}% ${Math.min(l + 8, 100)}%` : `${h} 10% ${Math.max(l - 5, 0)}%`);
        root.style.setProperty('--sidebar-accent-foreground', fgLight ? `${h} 10% 95%` : `${h} 20% 10%`);
        root.style.setProperty('--sidebar-border', fgLight ? `${h} ${Math.min(s, 30)}% ${Math.min(l + 12, 100)}%` : `${h} 10% ${Math.max(l - 8, 0)}%`);
      }
    }

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
          sidebar_color: newAppearance.sidebar_color,
          density: newAppearance.density,
          border_radius: newAppearance.border_radius,
          reduce_motion: newAppearance.reduce_motion,
        } as any, { onConflict: 'workspace_id' });

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
