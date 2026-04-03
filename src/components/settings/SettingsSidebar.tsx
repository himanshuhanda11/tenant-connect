import React, { useState } from 'react';
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
  ChevronDown,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTenant } from '@/contexts/TenantContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface SettingsSection {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  disabled?: boolean;
  group: string;
}

const settingsSections: SettingsSection[] = [
  { id: 'profile', label: 'My Profile', icon: UserCircle, group: 'Account' },
  { id: 'workspace', label: 'Workspace', icon: Building2, group: 'Account' },
  { id: 'appearance', label: 'Appearance', icon: Palette, group: 'Account' },
  { id: 'notifications', label: 'Notifications', icon: Bell, group: 'Account' },
  { id: 'whatsapp', label: 'WhatsApp Number', icon: Phone, group: 'Channels' },
  { id: 'messaging', label: 'Messaging', icon: MessageSquare, group: 'Channels' },
  { id: 'greetings', label: 'WhatsApp Greetings', icon: HandMetal, group: 'Channels' },
  { id: 'inbox', label: 'Inbox', icon: Inbox, group: 'Workspace' },
  { id: 'autoreply', label: 'Auto-Reply', icon: Bot, group: 'Workspace' },
  { id: 'automation', label: 'Automation', icon: Zap, group: 'Workspace' },
  { id: 'integrations', label: 'Integrations', icon: Puzzle, group: 'Workspace' },
  { id: 'team', label: 'Team & Permissions', icon: Users, group: 'Admin' },
  { id: 'security', label: 'Security', icon: Shield, group: 'Admin' },
  { id: 'billing', label: 'Billing & Usage', icon: CreditCard, group: 'Admin' },
  { id: 'compliance', label: 'Compliance', icon: FileCheck, group: 'Admin' },
  { id: 'developer', label: 'Developer', icon: Code, badge: 'API', group: 'Admin' },
  { id: 'advanced', label: 'Advanced', icon: Settings2, group: 'Admin' },
];

const agentSections = ['profile', 'appearance'];

const sectionGroups = ['Account', 'Channels', 'Workspace', 'Admin'];

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

  const groups = sectionGroups
    .map(g => ({ name: g, items: visibleSections.filter(s => s.group === g) }))
    .filter(g => g.items.length > 0);

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-card hidden lg:block">
      <div className="sticky top-0 h-full overflow-y-auto">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary" />
            Settings
          </h2>
        </div>
        <nav className="p-2 space-y-4">
          {groups.map(group => (
            <div key={group.name}>
              <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                {group.name}
              </p>
              <div className="space-y-0.5">
                {group.items.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => !section.disabled && onSectionChange(section.id)}
                      disabled={section.disabled}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                        isActive 
                          ? "bg-primary/10 text-primary" 
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
              </div>
            </div>
          ))}
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
  const [open, setOpen] = useState(false);

  const currentSection = visibleSections.find(s => s.id === activeSection);
  const CurrentIcon = currentSection?.icon || Settings2;

  const groups = sectionGroups
    .map(g => ({ name: g, items: visibleSections.filter(s => s.group === g) }))
    .filter(g => g.items.length > 0);

  return (
    <div className="lg:hidden sticky top-0 z-20">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="w-full flex items-center justify-between px-4 py-3 bg-card border-b border-border active:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2.5">
              <CurrentIcon className="w-4.5 h-4.5 text-primary" />
              <span className="font-semibold text-sm text-foreground">{currentSection?.label || 'Settings'}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[75vh] rounded-t-2xl p-0">
          <SheetHeader className="px-4 pt-4 pb-2 border-b border-border">
            <SheetTitle className="flex items-center gap-2 text-base">
              <Settings2 className="w-4.5 h-4.5 text-primary" />
              Settings
            </SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto flex-1 p-3 space-y-4" style={{ maxHeight: 'calc(75vh - 60px)' }}>
            {groups.map(group => (
              <div key={group.name}>
                <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  {group.name}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((section) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    return (
                      <button
                        key={section.id}
                        onClick={() => {
                          if (!section.disabled) {
                            onSectionChange(section.id);
                            setOpen(false);
                          }
                        }}
                        disabled={section.disabled}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.98] touch-manipulation",
                          isActive 
                            ? "bg-primary/10 text-primary" 
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          section.disabled && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <Icon className="w-4.5 h-4.5 shrink-0" />
                        <span className="flex-1 text-left">{section.label}</span>
                        {section.badge && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                            {section.badge}
                          </span>
                        )}
                        {isActive && <Check className="w-4 h-4 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
