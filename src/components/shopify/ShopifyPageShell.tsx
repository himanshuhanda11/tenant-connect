import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface ShopifyPageShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  backTo?: string;
  backLabel?: string;
  actions?: React.ReactNode;
  isLoading?: boolean;
  error?: string | null;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const MAX_WIDTH_MAP = {
  sm: 'max-w-3xl',
  md: 'max-w-4xl',
  lg: 'max-w-5xl',
  xl: 'max-w-6xl',
  '2xl': 'max-w-7xl',
};

export function ShopifyPageShell({
  children,
  title,
  subtitle,
  icon: Icon,
  backTo,
  backLabel = 'Back',
  actions,
  isLoading,
  error,
  maxWidth = 'lg',
}: ShopifyPageShellProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className={`container mx-auto px-4 py-6 ${MAX_WIDTH_MAP[maxWidth]} space-y-6`}>
          {backTo && <Skeleton className="h-8 w-32" />}
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className={`container mx-auto px-4 py-6 ${MAX_WIDTH_MAP[maxWidth]}`}>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            {backTo && (
              <Button variant="outline" onClick={() => navigate(backTo)}>
                <ArrowLeft className="h-4 w-4 mr-2" /> {backLabel}
              </Button>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={`container mx-auto px-4 py-6 ${MAX_WIDTH_MAP[maxWidth]}`}>
        {/* Back navigation */}
        {backTo && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(backTo)}
            className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {backLabel}
          </Button>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 min-w-0">
            {Icon && (
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-primary" />
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold truncate">{title}</h1>
              {subtitle && <p className="text-sm text-muted-foreground truncate">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>

        {children}
      </div>
    </DashboardLayout>
  );
}

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function ShopifyEmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-muted-foreground/50" />
      </div>
      <h3 className="text-base font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
      {action}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ElementType;
  iconColor?: string;
  valueColor?: string;
}

export function ShopifyStatCard({ label, value, icon: Icon, iconColor = 'text-primary', valueColor }: StatCardProps) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="h-9 w-9 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
            <Icon className={`h-4.5 w-4.5 ${iconColor}`} />
          </div>
        )}
        <div className="min-w-0">
          <p className={`text-xl font-bold tabular-nums ${valueColor || ''}`}>{value}</p>
          <p className="text-xs text-muted-foreground truncate">{label}</p>
        </div>
      </div>
    </div>
  );
}
