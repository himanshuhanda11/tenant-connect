import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, ShieldAlert } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCurrentRolePermissions } from '@/hooks/useCurrentRolePermissions';

interface RequirePermissionProps {
  anyOf: readonly string[];
  children: ReactNode;
}

export function RequirePermission({ anyOf, children }: RequirePermissionProps) {
  const { loading, hasAnyPermission } = useCurrentRolePermissions();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-4xl p-4 sm:p-6">
          <Card className="rounded-2xl border-border/50">
            <CardContent className="flex min-h-[280px] items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Checking access...
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (hasAnyPermission(anyOf)) {
    return <>{children}</>;
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl p-4 sm:p-6">
        <Card className="rounded-2xl border-border/50">
          <CardContent className="flex min-h-[320px] flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <ShieldAlert className="h-7 w-7 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-semibold text-foreground">Access restricted</h1>
              <p className="max-w-md text-sm text-muted-foreground">
                Your current role does not have permission to open this Meta Ads section.
              </p>
            </div>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/dashboard">Back to dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}