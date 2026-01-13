export interface SidebarItemMeta {
  key: string;
  description: string;
  helpSlug: string;
}

export const sidebarDescriptions: Record<string, SidebarItemMeta> = {
  dashboard: {
    key: 'dashboard',
    description: 'Overview of your messaging performance and key metrics at a glance.',
    helpSlug: 'getting-started-dashboard'
  },
  inbox: {
    key: 'inbox',
    description: 'Central inbox to reply to all WhatsApp messages from customers in real time.',
    helpSlug: 'inbox-guide'
  },
  contacts: {
    key: 'contacts',
    description: 'Manage your customer database with detailed profiles and conversation history.',
    helpSlug: 'contacts-management'
  },
  tags: {
    key: 'tags',
    description: 'Organize contacts and conversations with custom labels for better segmentation.',
    helpSlug: 'tags-and-segments'
  },
  'user-attributes': {
    key: 'user-attributes',
    description: 'Define custom fields to capture additional customer information.',
    helpSlug: 'user-attributes'
  },
  'phone-numbers': {
    key: 'phone-numbers',
    description: 'Connect and manage your WhatsApp Business phone numbers.',
    helpSlug: 'phone-numbers-setup'
  },
  templates: {
    key: 'templates',
    description: 'Create and manage WhatsApp message templates that must be approved by Meta.',
    helpSlug: 'templates-guide'
  },
  campaigns: {
    key: 'campaigns',
    description: 'Send bulk messages to targeted segments using approved templates.',
    helpSlug: 'campaigns-guide'
  },
  automation: {
    key: 'automation',
    description: 'Automatically send messages or apply actions based on user behavior.',
    helpSlug: 'automation-workflows'
  },
  team: {
    key: 'team',
    description: 'Invite team members and manage roles and permissions.',
    helpSlug: 'team-management'
  },
  billing: {
    key: 'billing',
    description: 'View your subscription, usage, and manage payment methods.',
    helpSlug: 'billing-and-plans'
  },
  settings: {
    key: 'settings',
    description: 'Configure workspace settings, integrations, and preferences.',
    helpSlug: 'workspace-settings'
  }
};

export function getDescriptionForRoute(path: string): SidebarItemMeta | undefined {
  const key = path.replace('/', '').split('/')[0];
  return sidebarDescriptions[key];
}
