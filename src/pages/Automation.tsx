import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Plus } from 'lucide-react';

export default function Automation() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Automation</h1>
            <p className="text-muted-foreground">
              Create rules to automate responses and actions
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Rule
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Automation Rules</CardTitle>
            <CardDescription>
              Set up triggers and actions for automatic responses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Zap className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium">No automation rules yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Create rules to automate your workflow
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
