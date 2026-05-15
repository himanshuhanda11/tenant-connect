import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SettingsSidebar, SettingsMobileNav } from '@/components/settings/SettingsSidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { useTenant } from '@/contexts/TenantContext';

const ProfileSettings = lazy(() => import('@/components/settings/sections/ProfileSettings').then(m => ({ default: m.ProfileSettings })));
const WorkspaceSettings = lazy(() => import('@/components/settings/sections/WorkspaceSettings').then(m => ({ default: m.WorkspaceSettings })));
const WhatsAppNumberSettings = lazy(() => import('@/components/settings/sections/WhatsAppNumberSettings').then(m => ({ default: m.WhatsAppNumberSettings })));
const MessagingSettings = lazy(() => import('@/components/settings/sections/MessagingSettings').then(m => ({ default: m.MessagingSettings })));
const InboxSettings = lazy(() => import('@/components/settings/sections/InboxSettings').then(m => ({ default: m.InboxSettings })));
const AutomationSettings = lazy(() => import('@/components/settings/sections/AutomationSettings').then(m => ({ default: m.AutomationSettings })));
const IntegrationsSettings = lazy(() => import('@/components/settings/sections/IntegrationsSettings').then(m => ({ default: m.IntegrationsSettings })));
const TeamPermissionsSettings = lazy(() => import('@/components/settings/sections/TeamPermissionsSettings').then(m => ({ default: m.TeamPermissionsSettings })));
const SecuritySettings = lazy(() => import('@/components/settings/sections/SecuritySettings').then(m => ({ default: m.SecuritySettings })));
const BillingSettings = lazy(() => import('@/components/settings/sections/BillingSettings').then(m => ({ default: m.BillingSettings })));
const ComplianceSettings = lazy(() => import('@/components/settings/sections/ComplianceSettings').then(m => ({ default: m.ComplianceSettings })));
const DeveloperSettings = lazy(() => import('@/components/settings/sections/DeveloperSettings').then(m => ({ default: m.DeveloperSettings })));
const NotificationSettings = lazy(() => import('@/components/settings/sections/NotificationSettings').then(m => ({ default: m.NotificationSettings })));
const AdvancedSettings = lazy(() => import('@/components/settings/sections/AdvancedSettings').then(m => ({ default: m.AdvancedSettings })));
const AutoReplySettings = lazy(() => import('@/components/settings/sections/AutoReplySettings').then(m => ({ default: m.AutoReplySettings })));
const AppearanceSettings = lazy(() => import('@/components/settings/sections/AppearanceSettings').then(m => ({ default: m.AppearanceSettings })));


function SectionFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
      <div className="space-y-3 pt-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}

export default function Settings() {
  const { currentRole } = useTenant();
  const isAgent = currentRole === 'agent';
  const [searchParams] = useSearchParams();
  const sectionParam = searchParams.get('section');
  const [activeSection, setActiveSection] = useState(sectionParam || (isAgent ? 'profile' : 'workspace'));

  useEffect(() => {
    setActiveSection(sectionParam || (isAgent ? 'profile' : 'workspace'));
  }, [sectionParam, isAgent]);

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
      case 'greetings': return <ProfileSettings />;
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
              <Suspense fallback={<SectionFallback />}>
                {renderContent()}
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
