import React from 'react';
import { 
  Building2, 
  MessageSquare, 
  Inbox, 
  Zap, 
  Puzzle, 
  Users, 
  Shield, 
  CreditCard,
  FileCheck,
  Code,
  Bell,
  Settings2,
  Phone,
  Bot,
  Palette,
  UserCircle,
  HandMetal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTenant } from '@/contexts/TenantContext';

interface SettingsSection {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  disabled?: boolean;
}

const settingsSections: SettingsSection[] = [
  { id: 'profile', label: 'My Profile', icon: UserCircle },
  { id: 'workspace', label: 'Workspace', icon: Building2 },
  { id: 'whatsapp', label: 'WhatsApp Number', icon: Phone },
  { id: 'messaging', label: 'Messaging', icon: MessageSquare },
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'autoreply', label: 'Auto-Reply', icon: Bot },
  { id: 'automation', label: 'Automation', icon: Zap },
  { id: 'integrations', label: 'Integrations', icon: Puzzle },
  { id: 'team', label: 'Team & Permissions', icon: Users },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'billing', label: 'Billing & Usage', icon: CreditCard },
  { id: 'compliance', label: 'Compliance', icon: FileCheck },
  { id: 'developer', label: 'Developer', icon: Code, badge: 'API' },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'advanced', label: 'Advanced', icon: Settings2 },
];

const agentSections = ['profile', 'appearance'];

interface SettingsSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function SettingsSidebar({ activeSection, onSectionChange }: SettingsSidebarProps) {
  const { currentRole } = useTenant();
  const isAgent = currentRole === 'agent';
  const visibleSections = isAgent 
    ? settingsSections.filter(s => agentSections.includes(s.id))
    : settingsSections;

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-card hidden lg:block">
      <div className="sticky top-0">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary" />
            Settings
          </h2>
        </div>
        <nav className="p-2 space-y-1">
          {visibleSections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <button
                key={section.id}
                onClick={() => !section.disabled && onSectionChange(section.id)}
                disabled={section.disabled}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-primary/10 text-primary border-l-2 border-primary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  section.disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left">{section.label}</span>
                {section.badge && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                    {section.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

export function SettingsMobileNav({ activeSection, onSectionChange }: SettingsSidebarProps) {
  const { currentRole } = useTenant();
  const isAgent = currentRole === 'agent';
  const visibleSections = isAgent 
    ? settingsSections.filter(s => agentSections.includes(s.id))
    : settingsSections;

  const currentSection = visibleSections.find(s => s.id === activeSection);
  const Icon = currentSection?.icon || Settings2;
  
  return (
    <div className="lg:hidden border-b border-border bg-card sticky top-0 z-10">
      {/* Current section header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
        <Icon className="w-4 h-4 text-primary" />
        <span className="font-medium text-sm">{currentSection?.label || 'Settings'}</span>
      </div>
      
      {/* Scrollable navigation */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-1 p-2 min-w-max">
          {visibleSections.map((section) => {
            const SectionIcon = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <button
                key={section.id}
                onClick={() => !section.disabled && onSectionChange(section.id)}
                disabled={section.disabled}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all touch-manipulation",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted/80",
                  section.disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <SectionIcon className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">{section.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
