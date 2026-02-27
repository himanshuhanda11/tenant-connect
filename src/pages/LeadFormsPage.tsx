import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeadFormsList } from '@/components/lead-forms/LeadFormsList';
import { LeadFormRulesPanel } from '@/components/lead-forms/LeadFormRulesPanel';
import { WebhookHealthPanel } from '@/components/lead-forms/WebhookHealthPanel';
import { LeadEventsLog } from '@/components/lead-forms/LeadEventsLog';

export default function LeadFormsPage() {
  const [activeTab, setActiveTab] = useState('forms');

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lead Forms</h1>
          <p className="text-muted-foreground mt-1">
            Connect Meta Lead Forms to automatically capture leads into your inbox and trigger WhatsApp automations.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50">
            <TabsTrigger value="forms">Forms</TabsTrigger>
            <TabsTrigger value="rules">Automation Rules</TabsTrigger>
            <TabsTrigger value="webhook">Webhook Health</TabsTrigger>
            <TabsTrigger value="logs">Event Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="forms" className="mt-4">
            <LeadFormsList />
          </TabsContent>

          <TabsContent value="rules" className="mt-4">
            <LeadFormRulesPanel />
          </TabsContent>

          <TabsContent value="webhook" className="mt-4">
            <WebhookHealthPanel />
          </TabsContent>

          <TabsContent value="logs" className="mt-4">
            <LeadEventsLog />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
