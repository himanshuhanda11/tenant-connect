import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, Plus } from 'lucide-react';
import { QuickGuide, quickGuides } from '@/components/help/QuickGuide';

export default function Campaigns() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Quick Guide */}
        <QuickGuide {...quickGuides.campaigns} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Campaigns</h1>
            <p className="text-muted-foreground">
              Create and manage broadcast campaigns
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Campaigns</CardTitle>
            <CardDescription>
              Send bulk messages to your contacts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Send className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium">No campaigns yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Create your first campaign to engage with contacts
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
