import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, RefreshCw, Plus, Loader2 } from 'lucide-react';

export default function Templates() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Templates</h1>
            <p className="text-muted-foreground">
              Manage your WhatsApp message templates
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync from Meta
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Message Templates</CardTitle>
            <CardDescription>
              Templates approved by Meta for sending outside the 24-hour window
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium">No templates yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Sync templates from Meta or create new ones
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
