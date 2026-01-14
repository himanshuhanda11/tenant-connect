import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SettingsSidebar, SettingsMobileNav } from '@/components/settings/SettingsSidebar';
import { WorkspaceSettings } from '@/components/settings/sections/WorkspaceSettings';
import { MessagingSettings } from '@/components/settings/sections/MessagingSettings';
import { InboxSettings } from '@/components/settings/sections/InboxSettings';
import { SecuritySettings } from '@/components/settings/sections/SecuritySettings';
import { NotificationSettings } from '@/components/settings/sections/NotificationSettings';
import { DeveloperSettings } from '@/components/settings/sections/DeveloperSettings';
import { AdvancedSettings } from '@/components/settings/sections/AdvancedSettings';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Zap, Puzzle, Users, CreditCard, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

function PlaceholderSection({ title, icon: Icon, description, link }: { 
  title: string; 
  icon: React.ElementType; 
  description: string;
  link?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          Configure {title.toLowerCase()} settings for your workspace.
        </p>
        {link && (
          <Button asChild variant="outline">
            <Link to={link}>Go to {title}</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function Settings() {
  const [activeSection, setActiveSection] = useState('workspace');

  const renderContent = () => {
    switch (activeSection) {
      case 'workspace':
        return <WorkspaceSettings />;
      case 'messaging':
        return <MessagingSettings />;
      case 'inbox':
        return <InboxSettings />;
      case 'automation':
        return <PlaceholderSection title="Automation" icon={Zap} description="Configure automation workflows and triggers" link="/automation" />;
      case 'integrations':
        return <PlaceholderSection title="Integrations" icon={Puzzle} description="Connect third-party apps and services" link="/integrations" />;
      case 'team':
        return <PlaceholderSection title="Team & Permissions" icon={Users} description="Manage team members and roles" link="/team" />;
      case 'security':
        return <SecuritySettings />;
      case 'billing':
        return <PlaceholderSection title="Billing & Usage" icon={CreditCard} description="Manage subscription and view usage" link="/billing" />;
      case 'compliance':
        return <PlaceholderSection title="Compliance" icon={FileCheck} description="Data privacy and compliance settings" link="/compliance" />;
      case 'developer':
        return <DeveloperSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'advanced':
        return <AdvancedSettings />;
      default:
        return <WorkspaceSettings />;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-full -m-6">
        <SettingsSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        
        <div className="flex-1 flex flex-col min-h-0">
          <SettingsMobileNav activeSection={activeSection} onSectionChange={setActiveSection} />
          
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
