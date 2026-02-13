import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SettingsSidebar, SettingsMobileNav } from '@/components/settings/SettingsSidebar';
import { WorkspaceSettings } from '@/components/settings/sections/WorkspaceSettings';
import { WhatsAppNumberSettings } from '@/components/settings/sections/WhatsAppNumberSettings';
import { MessagingSettings } from '@/components/settings/sections/MessagingSettings';
import { InboxSettings } from '@/components/settings/sections/InboxSettings';
import { AutomationSettings } from '@/components/settings/sections/AutomationSettings';
import { IntegrationsSettings } from '@/components/settings/sections/IntegrationsSettings';
import { TeamPermissionsSettings } from '@/components/settings/sections/TeamPermissionsSettings';
import { SecuritySettings } from '@/components/settings/sections/SecuritySettings';
import { BillingSettings } from '@/components/settings/sections/BillingSettings';
import { ComplianceSettings } from '@/components/settings/sections/ComplianceSettings';
import { DeveloperSettings } from '@/components/settings/sections/DeveloperSettings';
import { NotificationSettings } from '@/components/settings/sections/NotificationSettings';
import { AdvancedSettings } from '@/components/settings/sections/AdvancedSettings';
import { AutoReplySettings } from '@/components/settings/sections/AutoReplySettings';
import { AppearanceSettings } from '@/components/settings/sections/AppearanceSettings';

export default function Settings() {
  const [activeSection, setActiveSection] = useState('workspace');

  const renderContent = () => {
    switch (activeSection) {
      case 'workspace': return <WorkspaceSettings />;
      case 'whatsapp': return <WhatsAppNumberSettings />;
      case 'messaging': return <MessagingSettings />;
      case 'inbox': return <InboxSettings />;
      case 'autoreply': return <AutoReplySettings />;
      case 'automation': return <AutomationSettings />;
      case 'integrations': return <IntegrationsSettings />;
      case 'team': return <TeamPermissionsSettings />;
      case 'security': return <SecuritySettings />;
      case 'billing': return <BillingSettings />;
      case 'compliance': return <ComplianceSettings />;
      case 'developer': return <DeveloperSettings />;
      case 'notifications': return <NotificationSettings />;
      case 'advanced': return <AdvancedSettings />;
      case 'appearance': return <AppearanceSettings />;
      default: return <WorkspaceSettings />;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col lg:flex-row h-full -m-4 sm:-m-6">
        <SettingsSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        
        <div className="flex-1 flex flex-col min-h-0 w-full">
          <SettingsMobileNav activeSection={activeSection} onSectionChange={setActiveSection} />
          
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
