import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Settings, BarChart3, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export function BillingQuickActions() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
          <Button variant="outline" className="h-auto py-3 flex-col gap-1.5 text-xs" asChild>
            <Link to="/team/members">
              <Users className="h-4 w-4 text-primary" />
              Manage Team
            </Link>
          </Button>
          <Button variant="outline" className="h-auto py-3 flex-col gap-1.5 text-xs" asChild>
            <Link to="/add-ons">
              <Settings className="h-4 w-4 text-primary" />
              Add-ons
            </Link>
          </Button>
          <Button variant="outline" className="h-auto py-3 flex-col gap-1.5 text-xs" asChild>
            <Link to="/team/audit">
              <FileText className="h-4 w-4 text-primary" />
              Audit Logs
            </Link>
          </Button>
          <Button variant="outline" className="h-auto py-3 flex-col gap-1.5 text-xs" asChild>
            <Link to="/analytics">
              <BarChart3 className="h-4 w-4 text-primary" />
              Analytics
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
