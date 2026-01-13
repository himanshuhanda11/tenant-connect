// Static guide content for seeding and fallback
export interface StaticGuide {
  slug: string;
  title: string;
  category: string;
  sidebarKey?: string;
  summary: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  readingTime: number;
  sections: {
    type: 'what_is' | 'when_to_use' | 'how_it_works' | 'common_mistakes' | 'tips';
    title: string;
    content: string;
  }[];
  examples?: {
    title: string;
    description?: string;
    code: string;
    isGood: boolean;
  }[];
  relatedSlugs?: string[];
}

export const GUIDE_CATEGORIES = [
  { slug: 'messaging', name: 'Messaging', icon: '💬', description: 'Learn how to manage conversations and contacts' },
  { slug: 'marketing', name: 'Marketing', icon: '📣', description: 'Send campaigns and automate outreach' },
  { slug: 'channels', name: 'Channels', icon: '📱', description: 'Connect and manage phone numbers' },
  { slug: 'platform', name: 'Platform', icon: '⚙️', description: 'Configure your workspace and team' },
  { slug: 'compliance', name: 'Compliance', icon: '✅', description: 'WhatsApp policies and best practices' },
];

export const STATIC_GUIDES: StaticGuide[] = [
  {
    slug: 'templates-guide',
    title: 'WhatsApp Message Templates',
    category: 'marketing',
    sidebarKey: 'templates',
    summary: 'Learn how to create, submit, and manage WhatsApp templates for outbound messaging.',
    difficulty: 'beginner',
    readingTime: 8,
    sections: [
      {
        type: 'what_is',
        title: 'What are Templates?',
        content: 'Templates are pre-approved message formats required by WhatsApp to send outbound messages to customers outside the 24-hour messaging window. Every promotional, transactional, or notification message must use an approved template.'
      },
      {
        type: 'when_to_use',
        title: 'When Should I Use Templates?',
        content: '• Sending order confirmations and updates\n• Promotional messages and offers\n• Appointment reminders\n• OTP and authentication codes\n• Follow-up messages after 24 hours\n• Bulk campaign messages'
      },
      {
        type: 'how_it_works',
        title: 'How Template Approval Works',
        content: '1. **Create a draft** - Design your template with header, body, footer, and buttons\n2. **Internal review** - Get approval from your team manager (optional)\n3. **Submit to Meta** - Send the template for WhatsApp review\n4. **Wait for review** - Meta reviews within 24-48 hours\n5. **Approved or rejected** - If rejected, fix issues and resubmit'
      },
      {
        type: 'common_mistakes',
        title: 'Common Mistakes',
        content: '❌ Using promotional language in Utility templates\n❌ Including banned words like "free money", "guaranteed"\n❌ Misleading job or visa promises\n❌ Incorrect variable formatting (use {{1}}, {{2}})\n❌ Missing variable examples\n❌ Button URLs without https://'
      },
      {
        type: 'tips',
        title: 'Tips for Approval',
        content: '✅ Keep language simple and clear\n✅ Add realistic variable examples\n✅ Choose the correct category (Utility vs Marketing)\n✅ Avoid ALL CAPS and excessive punctuation\n✅ Include clear opt-out instructions for marketing\n✅ Test your template thoroughly before submitting'
      }
    ],
    examples: [
      {
        title: 'Good Order Confirmation',
        description: 'Clear, professional, uses variables correctly',
        code: 'Hi {{1}},\n\nYour order #{{2}} has been confirmed! 🎉\n\nItems: {{3}}\nTotal: {{4}}\n\nTrack your order anytime.',
        isGood: true
      },
      {
        title: 'Bad Promotional Template',
        description: 'Uses banned words and misleading claims',
        code: 'GUARANTEED FREE MONEY!!! 💰💰💰\n\nYou have WON a prize! Click NOW to claim your GUARANTEED reward!!!',
        isGood: false
      }
    ],
    relatedSlugs: ['template-categories', 'why-templates-rejected', 'campaigns-guide']
  },
  {
    slug: 'inbox-guide',
    title: 'Managing Your Inbox',
    category: 'messaging',
    sidebarKey: 'inbox',
    summary: 'Master the central inbox to handle all customer conversations efficiently.',
    difficulty: 'beginner',
    readingTime: 6,
    sections: [
      {
        type: 'what_is',
        title: 'What is the Inbox?',
        content: 'The Inbox is your central hub for managing all WhatsApp conversations. It displays messages from all connected phone numbers in one place, allowing your team to respond quickly and efficiently.'
      },
      {
        type: 'when_to_use',
        title: 'When to Use the Inbox',
        content: '• Responding to customer inquiries\n• Following up on leads\n• Handling support requests\n• Sending quick replies and templates\n• Assigning conversations to team members'
      },
      {
        type: 'how_it_works',
        title: 'Key Features',
        content: '**Conversation List** - See all active chats sorted by recent activity\n\n**Message Thread** - Full conversation history with the customer\n\n**Contact Panel** - Customer details, tags, and notes\n\n**Quick Actions** - Send templates, assign agents, add tags\n\n**24-Hour Window** - Visual indicator showing when free-form messaging expires'
      },
      {
        type: 'tips',
        title: 'Productivity Tips',
        content: '✅ Use keyboard shortcuts for faster navigation\n✅ Set up quick reply templates for common questions\n✅ Use tags to categorize and prioritize conversations\n✅ Assign conversations to the right team member\n✅ Add notes for context when handing off conversations'
      }
    ],
    relatedSlugs: ['contacts-management', 'tags-and-segments', 'templates-guide']
  },
  {
    slug: 'campaigns-guide',
    title: 'Sending Bulk Campaigns',
    category: 'marketing',
    sidebarKey: 'campaigns',
    summary: 'Learn how to create and send effective WhatsApp marketing campaigns.',
    difficulty: 'intermediate',
    readingTime: 10,
    sections: [
      {
        type: 'what_is',
        title: 'What are Campaigns?',
        content: 'Campaigns allow you to send bulk WhatsApp messages to targeted groups of contacts using approved templates. Use campaigns for promotions, announcements, updates, and re-engagement.'
      },
      {
        type: 'when_to_use',
        title: 'Campaign Use Cases',
        content: '• Product launches and promotions\n• Flash sales and limited-time offers\n• Event invitations and reminders\n• Newsletter and updates\n• Customer re-engagement\n• Seasonal greetings'
      },
      {
        type: 'how_it_works',
        title: 'Creating a Campaign',
        content: '1. **Name your campaign** - Give it a descriptive name\n2. **Select template** - Choose an approved marketing template\n3. **Choose audience** - Target contacts by tags or segments\n4. **Fill variables** - Map contact fields to template variables\n5. **Schedule or send** - Send immediately or schedule for later\n6. **Monitor results** - Track delivery, read, and reply rates'
      },
      {
        type: 'common_mistakes',
        title: 'Avoid These Mistakes',
        content: '❌ Sending to contacts without opt-in\n❌ Using Utility templates for marketing content\n❌ Not testing variable mapping\n❌ Sending at inappropriate times\n❌ Overloading customers with too many messages'
      },
      {
        type: 'tips',
        title: 'Best Practices',
        content: '✅ Always get explicit opt-in consent\n✅ Segment your audience for relevant messaging\n✅ Include clear unsubscribe options\n✅ A/B test different messages\n✅ Analyze results and iterate\n✅ Respect quiet hours and time zones'
      }
    ],
    relatedSlugs: ['templates-guide', 'tags-and-segments', 'automation-workflows']
  },
  {
    slug: 'contacts-management',
    title: 'Managing Contacts',
    category: 'messaging',
    sidebarKey: 'contacts',
    summary: 'Organize and manage your customer database effectively.',
    difficulty: 'beginner',
    readingTime: 5,
    sections: [
      {
        type: 'what_is',
        title: 'What is the Contacts Module?',
        content: 'The Contacts module is your customer database. It stores all customer information, conversation history, and allows you to segment and organize your audience for targeted messaging.'
      },
      {
        type: 'how_it_works',
        title: 'Key Features',
        content: '**Contact Profiles** - Name, phone, email, and custom attributes\n\n**Conversation History** - View all past messages\n\n**Tags & Segments** - Organize contacts into groups\n\n**Timeline** - Track all interactions and changes\n\n**Import/Export** - Bulk upload and download contacts'
      },
      {
        type: 'tips',
        title: 'Organization Tips',
        content: '✅ Use consistent naming conventions\n✅ Keep contact data up to date\n✅ Apply relevant tags consistently\n✅ Add notes for important context\n✅ Set up custom attributes for your business needs'
      }
    ],
    relatedSlugs: ['tags-and-segments', 'inbox-guide', 'campaigns-guide']
  },
  {
    slug: 'automation-workflows',
    title: 'Automation Workflows',
    category: 'marketing',
    sidebarKey: 'automation',
    summary: 'Automate repetitive tasks and create smart messaging workflows.',
    difficulty: 'advanced',
    readingTime: 12,
    sections: [
      {
        type: 'what_is',
        title: 'What is Automation?',
        content: 'Automation allows you to create rules that automatically perform actions based on triggers. Send welcome messages, auto-apply tags, assign conversations, and more - all without manual intervention.'
      },
      {
        type: 'when_to_use',
        title: 'Automation Use Cases',
        content: '• Welcome message for new contacts\n• Auto-reply outside business hours\n• Keyword-based responses\n• Lead qualification and routing\n• Follow-up sequences\n• Tag-based workflows'
      },
      {
        type: 'how_it_works',
        title: 'Building an Automation',
        content: '1. **Choose a trigger** - What starts the automation (new contact, keyword, tag added)\n2. **Set conditions** - Optional filters (time, contact attributes)\n3. **Define actions** - What happens (send template, add tag, assign agent)\n4. **Test thoroughly** - Make sure it works as expected\n5. **Activate** - Turn on the automation'
      },
      {
        type: 'tips',
        title: 'Best Practices',
        content: '✅ Start simple and build complexity gradually\n✅ Test automations before activating\n✅ Monitor performance and adjust\n✅ Document your automation logic\n✅ Have a manual override option'
      }
    ],
    relatedSlugs: ['templates-guide', 'tags-and-segments', 'campaigns-guide']
  },
  {
    slug: 'tags-and-segments',
    title: 'Tags and Segmentation',
    category: 'messaging',
    sidebarKey: 'tags',
    summary: 'Organize contacts and conversations with custom labels for better targeting.',
    difficulty: 'beginner',
    readingTime: 5,
    sections: [
      {
        type: 'what_is',
        title: 'What are Tags?',
        content: 'Tags are custom labels you can apply to contacts and conversations. Use them to categorize, prioritize, and segment your audience for targeted messaging and better organization.'
      },
      {
        type: 'how_it_works',
        title: 'Using Tags Effectively',
        content: '**Lifecycle Tags** - Lead, Customer, VIP, Churned\n\n**Intent Tags** - Interested, Needs Demo, Ready to Buy\n\n**Priority Tags** - High, Medium, Low\n\n**Source Tags** - Website, Campaign, Referral\n\n**Custom Tags** - Any label specific to your business'
      },
      {
        type: 'tips',
        title: 'Best Practices',
        content: '✅ Create a tagging taxonomy before starting\n✅ Use consistent naming conventions\n✅ Review and clean up tags periodically\n✅ Train your team on proper tag usage\n✅ Use tag rules for automatic tagging'
      }
    ],
    relatedSlugs: ['contacts-management', 'campaigns-guide', 'automation-workflows']
  },
  {
    slug: 'phone-numbers-setup',
    title: 'Phone Number Setup',
    category: 'channels',
    sidebarKey: 'phone-numbers',
    summary: 'Connect and manage your WhatsApp Business phone numbers.',
    difficulty: 'intermediate',
    readingTime: 8,
    sections: [
      {
        type: 'what_is',
        title: 'What are Phone Numbers?',
        content: 'Phone numbers are your WhatsApp Business identities. Each phone number can send and receive messages independently. You can connect multiple numbers to serve different purposes or regions.'
      },
      {
        type: 'how_it_works',
        title: 'Connecting a Phone Number',
        content: '1. **Start the connection** - Click "Add Phone Number"\n2. **Facebook Login** - Authenticate with your Facebook Business account\n3. **Select WABA** - Choose or create a WhatsApp Business Account\n4. **Choose number** - Select an existing or new phone number\n5. **Complete setup** - Verify and configure the number'
      },
      {
        type: 'tips',
        title: 'Management Tips',
        content: '✅ Use different numbers for different purposes\n✅ Monitor quality ratings regularly\n✅ Keep display names professional and accurate\n✅ Set up proper business profiles'
      }
    ],
    relatedSlugs: ['templates-guide', 'inbox-guide', 'team-management']
  },
  {
    slug: 'team-management',
    title: 'Team Management',
    category: 'platform',
    sidebarKey: 'team',
    summary: 'Invite team members and manage roles and permissions.',
    difficulty: 'beginner',
    readingTime: 5,
    sections: [
      {
        type: 'what_is',
        title: 'Team Roles',
        content: 'Manage your team with role-based access control. Assign appropriate permissions to ensure security while enabling productivity.'
      },
      {
        type: 'how_it_works',
        title: 'Available Roles',
        content: '**Owner** - Full access, billing, can delete workspace\n\n**Admin** - Full access except billing and workspace deletion\n\n**Agent** - Can handle conversations, view contacts, use templates'
      },
      {
        type: 'tips',
        title: 'Best Practices',
        content: '✅ Follow least-privilege principle\n✅ Regularly audit team access\n✅ Remove access promptly when team members leave\n✅ Use descriptive display names'
      }
    ],
    relatedSlugs: ['inbox-guide', 'workspace-settings']
  }
];

export function getStaticGuide(slug: string): StaticGuide | undefined {
  return STATIC_GUIDES.find(g => g.slug === slug);
}

export function getStaticGuidesByCategory(category: string): StaticGuide[] {
  return STATIC_GUIDES.filter(g => g.category === category);
}

export function getStaticGuideBySidebarKey(key: string): StaticGuide | undefined {
  return STATIC_GUIDES.find(g => g.sidebarKey === key);
}
