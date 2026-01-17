import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  ChevronDown, 
  ChevronRight,
  Zap,
  Code,
  MessageSquare,
  Users,
  Settings,
  Webhook,
  Shield,
  BookOpen,
  Terminal,
  FileCode,
  AlertCircle
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DocSection {
  id: string;
  title: string;
  icon: React.ElementType;
  items: { id: string; title: string; badge?: string }[];
}

const sections: DocSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Zap,
    items: [
      { id: 'overview', title: 'Platform Overview' },
      { id: 'quickstart', title: 'Quickstart Guide', badge: 'Popular' },
      { id: 'connecting-whatsapp', title: 'Connecting WhatsApp' },
      { id: 'first-message', title: 'Send First Message' }
    ]
  },
  {
    id: 'api-reference',
    title: 'API Reference',
    icon: Code,
    items: [
      { id: 'authentication', title: 'Authentication' },
      { id: 'messages-api', title: 'Messages API' },
      { id: 'templates-api', title: 'Templates API' },
      { id: 'contacts-api', title: 'Contacts API' },
      { id: 'webhooks-api', title: 'Webhooks API' },
      { id: 'rate-limits', title: 'Rate Limits', badge: 'Important' }
    ]
  },
  {
    id: 'messaging',
    title: 'Messaging',
    icon: MessageSquare,
    items: [
      { id: 'message-types', title: 'Message Types' },
      { id: 'template-messages', title: 'Template Messages' },
      { id: '24hr-window', title: '24-Hour Window' },
      { id: 'media-messages', title: 'Media Messages' },
      { id: 'interactive', title: 'Interactive Messages' }
    ]
  },
  {
    id: 'sdks',
    title: 'SDKs & Libraries',
    icon: FileCode,
    items: [
      { id: 'sdk-javascript', title: 'JavaScript SDK', badge: 'New' },
      { id: 'sdk-python', title: 'Python SDK' },
      { id: 'sdk-php', title: 'PHP SDK' },
      { id: 'sdk-go', title: 'Go SDK' }
    ]
  },
  {
    id: 'integrations',
    title: 'Integrations',
    icon: Webhook,
    items: [
      { id: 'webhook-setup', title: 'Webhook Setup' },
      { id: 'crm-integration', title: 'CRM Integration' },
      { id: 'zapier', title: 'Zapier Connection' },
      { id: 'custom-integrations', title: 'Custom Integrations' }
    ]
  },
  {
    id: 'team',
    title: 'Team & Permissions',
    icon: Users,
    items: [
      { id: 'roles', title: 'Role-Based Access' },
      { id: 'invites', title: 'Inviting Members' },
      { id: 'assignment', title: 'Conversation Assignment' },
      { id: 'audit-logs', title: 'Audit Logs' }
    ]
  },
  {
    id: 'security',
    title: 'Security',
    icon: Shield,
    items: [
      { id: 'encryption', title: 'Data Encryption' },
      { id: 'compliance', title: 'Compliance (GDPR)' },
      { id: 'api-security', title: 'API Security' }
    ]
  },
  {
    id: 'errors',
    title: 'Error Handling',
    icon: AlertCircle,
    items: [
      { id: 'error-codes', title: 'Error Codes' },
      { id: 'troubleshooting', title: 'Troubleshooting' },
      { id: 'status-page', title: 'Status Page' }
    ]
  }
];

interface DocsSidebarProps {
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

export function DocsSidebar({ activeSection, onSectionChange }: DocsSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['getting-started', 'api-reference']);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <ScrollArea className="h-[calc(100vh-180px)]">
      <nav className="space-y-1 pr-4">
        {sections.map((section) => {
          const Icon = section.icon;
          const isExpanded = expandedSections.includes(section.id);
          
          return (
            <div key={section.id}>
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{section.title}</span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              
              {isExpanded && (
                <div className="ml-6 mt-1 space-y-1">
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onSectionChange(item.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-1.5 text-sm rounded-md transition-colors",
                        activeSection === item.id
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                      )}
                    >
                      <span>{item.title}</span>
                      {item.badge && (
                        <span className={cn(
                          "text-[10px] font-medium px-1.5 py-0.5 rounded",
                          item.badge === 'New' ? "bg-green-500/20 text-green-600" :
                          item.badge === 'Popular' ? "bg-blue-500/20 text-blue-600" :
                          "bg-amber-500/20 text-amber-600"
                        )}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </ScrollArea>
  );
}
