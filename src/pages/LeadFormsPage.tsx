import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeadFormsList } from '@/components/lead-forms/LeadFormsList';
import { LeadFormRulesPanel } from '@/components/lead-forms/LeadFormRulesPanel';
import { WebhookHealthPanel } from '@/components/lead-forms/WebhookHealthPanel';
import { LeadEventsLog } from '@/components/lead-forms/LeadEventsLog';
import { SEO } from '@/components/seo';
import { FileText, Zap, Activity, ScrollText, ArrowDownToLine } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLeadForms, useLeadFormRules, useLeadEvents, useWebhookHealth } from '@/hooks/useLeadForms';

export default function LeadFormsPage() {
  const [activeTab, setActiveTab] = useState('forms');
  const { forms } = useLeadForms();
  const { rules } = useLeadFormRules();
  const { events } = useLeadEvents();
  const { subscriptions } = useWebhookHealth();

  const stats = [
    { label: 'Connected Forms', value: forms.length, icon: FileText, color: 'text-blue-500' },
    { label: 'Active Rules', value: rules.filter(r => r.enabled).length, icon: Zap, color: 'text-amber-500' },
    { label: 'Leads Captured', value: events.filter(e => e.status === 'success').length, icon: ArrowDownToLine, color: 'text-emerald-500' },
    { label: 'Webhooks Active', value: subscriptions.filter(s => s.is_subscribed).length, icon: Activity, color: 'text-purple-500' },
  ];

  return (
    <DashboardLayout>
      <SEO title="Lead Forms - AiReatro" description="Manage Meta lead form integrations" />
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Meta Lead Forms</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Capture leads from Facebook & Instagram forms into WhatsApp automatically.
            </p>
          </div>
          <Badge variant="outline" className="w-fit text-xs px-3 py-1 border-primary/30 text-primary bg-primary/5">
            <Activity className="h-3 w-3 mr-1.5" />
            Live Integration
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border/60 bg-card p-4 flex items-center gap-3"
            >
              <div className={`w-9 h-9 rounded-lg bg-muted/80 flex items-center justify-center ${stat.color}`}>
                <stat.icon className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-foreground leading-none">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50 h-10 p-1 w-full sm:w-auto grid grid-cols-4 sm:flex">
            <TabsTrigger value="forms" className="text-xs sm:text-sm gap-1.5">
              <FileText className="h-3.5 w-3.5 hidden sm:block" />
              Forms
            </TabsTrigger>
            <TabsTrigger value="rules" className="text-xs sm:text-sm gap-1.5">
              <Zap className="h-3.5 w-3.5 hidden sm:block" />
              Rules
            </TabsTrigger>
            <TabsTrigger value="webhook" className="text-xs sm:text-sm gap-1.5">
              <Activity className="h-3.5 w-3.5 hidden sm:block" />
              Health
            </TabsTrigger>
            <TabsTrigger value="logs" className="text-xs sm:text-sm gap-1.5">
              <ScrollText className="h-3.5 w-3.5 hidden sm:block" />
              Logs
            </TabsTrigger>
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
