import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SettingsSidebar, SettingsMobileNav } from '@/components/settings/SettingsSidebar';
import { ProfileSettings } from '@/components/settings/sections/ProfileSettings';
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
import { WhatsAppGreetingSettings } from '@/components/settings/sections/WhatsAppGreetingSettings';
import { useTenant } from '@/contexts/TenantContext';

export default function Settings() {
  const { currentRole } = useTenant();
  const isAgent = currentRole === 'agent';
  const [searchParams] = useSearchParams();
  const sectionParam = searchParams.get('section');
  const [activeSection, setActiveSection] = useState(sectionParam || (isAgent ? 'profile' : 'workspace'));

  useEffect(() => {
    if (sectionParam) setActiveSection(sectionParam);
  }, [sectionParam]);

  const renderContent = () => {
    switch (activeSection) {
      case 'profile': return <ProfileSettings />;
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
      case 'greetings': return <WhatsAppGreetingSettings />;
      default: return <WorkspaceSettings />;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col lg:flex-row h-full lg:-m-0 -m-0">
        <SettingsSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        
        <div className="flex-1 flex flex-col min-h-0 w-full">
          <SettingsMobileNav activeSection={activeSection} onSectionChange={setActiveSection} />
          
          <div className="flex-1 overflow-y-auto p-3 sm:p-6">
            <div className="max-w-4xl mx-auto">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
