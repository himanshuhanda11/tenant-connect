export interface SidebarItemMeta {
  key: string;
  description: string;
  helpSlug: string;
}

export const sidebarDescriptions: Record<string, SidebarItemMeta> = {
  dashboard: {
    key: 'dashboard',
    description: 'Overview of your messaging performance and key metrics at a glance.',
    helpSlug: 'inbox-guide'
  },
  inbox: {
    key: 'inbox',
    description: 'Central inbox to reply to all WhatsApp messages from customers in real time.',
    helpSlug: 'inbox'
  },
  contacts: {
    key: 'contacts',
    description: 'Manage your customer database with detailed profiles and conversation history.',
    helpSlug: 'contacts-tags'
  },
  tags: {
    key: 'tags',
    description: 'Organize contacts and conversations with custom labels for better segmentation.',
    helpSlug: 'contacts-tags'
  },
  'user-attributes': {
    key: 'user-attributes',
    description: 'Define custom fields to capture additional customer information.',
    helpSlug: 'contacts-tags'
  },
  'phone-numbers': {
    key: 'phone-numbers',
    description: 'Connect and manage your WhatsApp Business phone numbers.',
    helpSlug: 'inbox'
  },
  templates: {
    key: 'templates',
    description: 'Create and manage WhatsApp message templates that must be approved by Meta.',
    helpSlug: 'templates'
  },
  campaigns: {
    key: 'campaigns',
    description: 'Send bulk messages to targeted segments using approved templates.',
    helpSlug: 'templates'
  },
  automation: {
    key: 'automation',
    description: 'Automatically send messages or apply actions based on user behavior.',
    helpSlug: 'automation'
  },
  'meta-ads-overview': {
    key: 'meta-ads-overview',
    description: 'Overview of your Meta Ads performance and Click-to-WhatsApp leads.',
    helpSlug: 'meta-ads'
  },
  'meta-ads-setup': {
    key: 'meta-ads-setup',
    description: 'Connect your Meta Ad Account to track Click-to-WhatsApp campaigns.',
    helpSlug: 'meta-ads'
  },
  'meta-ads-manager': {
    key: 'meta-ads-manager',
    description: 'View your Click-to-WhatsApp ads and their performance metrics.',
    helpSlug: 'meta-ads'
  },
  'meta-ads-analytics': {
    key: 'meta-ads-analytics',
    description: 'Analyze lead performance, conversion rates, and ROI from Meta Ads.',
    helpSlug: 'meta-ads'
  },
  'meta-ads-attribution': {
    key: 'meta-ads-attribution',
    description: 'Configure how leads are attributed to specific ads and campaigns.',
    helpSlug: 'meta-ads'
  },
  'meta-ads-automations': {
    key: 'meta-ads-automations',
    description: 'Set up automatic responses and routing for Click-to-WhatsApp leads.',
    helpSlug: 'meta-ads'
  },
  'meta-ads-settings': {
    key: 'meta-ads-settings',
    description: 'Configure Meta Ads tracking settings and default behaviors.',
    helpSlug: 'meta-ads'
  },
  team: {
    key: 'team',
    description: 'Invite team members and manage roles and permissions.',
    helpSlug: 'inbox'
  },
  billing: {
    key: 'billing',
    description: 'View your subscription, usage, and manage payment methods.',
    helpSlug: 'inbox'
  },
  settings: {
    key: 'settings',
    description: 'Configure workspace settings, integrations, and preferences.',
    helpSlug: 'inbox'
  },
  help: {
    key: 'help',
    description: 'Browse guides and documentation to get the most out of the platform.',
    helpSlug: ''
  }
};

export function getDescriptionForRoute(path: string): SidebarItemMeta | undefined {
  const key = path.replace('/', '').split('/')[0];
  return sidebarDescriptions[key];
}
