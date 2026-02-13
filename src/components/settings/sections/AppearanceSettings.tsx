import React from 'react';
import { Palette, Sun, Moon, Monitor, Maximize2, Minimize2, SquareIcon, CircleIcon, Check, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTheme, THEMES, type ThemeMode, type Density, type BorderRadius } from '@/contexts/ThemeContext';
import { useTenant } from '@/contexts/TenantContext';

const modeOptions: { value: ThemeMode; label: string; icon: React.ElementType }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

const densityOptions: { value: Density; label: string; icon: React.ElementType; desc: string }[] = [
  { value: 'comfortable', label: 'Comfortable', icon: Maximize2, desc: 'Spacious layout with more breathing room' },
  { value: 'compact', label: 'Compact', icon: Minimize2, desc: 'Tighter layout to show more content' },
];

const radiusOptions: { value: BorderRadius; label: string; preview: string }[] = [
  { value: 'small', label: 'Small', preview: 'rounded-sm' },
  { value: 'medium', label: 'Medium', preview: 'rounded-lg' },
  { value: 'large', label: 'Large', preview: 'rounded-2xl' },
];

export function AppearanceSettings() {
  const { appearance, setAppearance, saving } = useTheme();
  const { currentRole } = useTenant();
  const canEdit = currentRole === 'owner' || currentRole === 'admin';

  return (
    <div className="space-y-6">
      {/* Color Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Color Mode
          </CardTitle>
          <CardDescription>Choose between light, dark, or system-synced appearance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {modeOptions.map(opt => {
              const Icon = opt.icon;
              const active = appearance.mode === opt.value;
              return (
                <button
                  key={opt.value}
                  disabled={!canEdit}
                  onClick={() => setAppearance({ mode: opt.value })}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                    active
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-muted-foreground/30",
                    !canEdit && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Icon className={cn("w-6 h-6", active ? "text-primary" : "text-muted-foreground")} />
                  <span className={cn("text-sm font-medium", active ? "text-primary" : "text-muted-foreground")}>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Theme Palette */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Theme
          </CardTitle>
          <CardDescription>Select a color theme for your workspace</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
            {THEMES.map(theme => {
              const active = appearance.theme === theme.id;
              return (
                <button
                  key={theme.id}
                  disabled={!canEdit}
                  onClick={() => setAppearance({ theme: theme.id })}
                  className={cn(
                    "group relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                    active
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-muted-foreground/30",
                    !canEdit && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div
                    className="w-8 h-8 rounded-full shadow-inner ring-2 ring-background"
                    style={{ backgroundColor: `hsl(${theme.light.primary})` }}
                  />
                  {active && (
                    <div className="absolute top-1.5 right-1.5">
                      <Check className="w-3.5 h-3.5 text-primary" />
                    </div>
                  )}
                  <span className="text-[11px] font-medium text-muted-foreground truncate w-full text-center">
                    {theme.name}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* UI Density */}
      <Card>
        <CardHeader>
          <CardTitle>UI Density</CardTitle>
          <CardDescription>Control spacing throughout the interface</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {densityOptions.map(opt => {
              const Icon = opt.icon;
              const active = appearance.density === opt.value;
              return (
                <button
                  key={opt.value}
                  disabled={!canEdit}
                  onClick={() => setAppearance({ density: opt.value })}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all",
                    active ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30",
                    !canEdit && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Icon className={cn("w-5 h-5 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
                  <div>
                    <p className={cn("text-sm font-medium", active && "text-primary")}>{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Border Radius */}
      <Card>
        <CardHeader>
          <CardTitle>Border Radius</CardTitle>
          <CardDescription>Choose the roundness of UI elements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {radiusOptions.map(opt => {
              const active = appearance.border_radius === opt.value;
              return (
                <button
                  key={opt.value}
                  disabled={!canEdit}
                  onClick={() => setAppearance({ border_radius: opt.value })}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 border-2 transition-all",
                    opt.preview,
                    active ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30",
                    !canEdit && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className={cn("w-10 h-7 bg-primary/20 border border-primary/30", opt.preview)} />
                  <span className={cn("text-sm font-medium", active ? "text-primary" : "text-muted-foreground")}>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Accessibility */}
      <Card>
        <CardHeader>
          <CardTitle>Accessibility</CardTitle>
          <CardDescription>Motion and animation preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Reduce Motion</Label>
              <p className="text-sm text-muted-foreground">Disable animations and transitions for accessibility</p>
            </div>
            <Switch
              checked={appearance.reduce_motion}
              onCheckedChange={(v) => setAppearance({ reduce_motion: v })}
              disabled={!canEdit}
            />
          </div>
        </CardContent>
      </Card>

      {saving && (
        <p className="text-xs text-muted-foreground text-center animate-pulse">Saving preferences…</p>
      )}
    </div>
  );
}
