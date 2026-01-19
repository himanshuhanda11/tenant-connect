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
  { slug: 'meta-ads', name: 'Meta Ads', icon: '📢', description: 'Click-to-WhatsApp ads and lead tracking' },
  { slug: 'platform', name: 'Platform', icon: '⚙️', description: 'Configure your workspace and team' },
  { slug: 'compliance', name: 'Compliance', icon: '✅', description: 'WhatsApp policies and best practices' },
];

export const STATIC_GUIDES: StaticGuide[] = [
  // Dashboard Guide
  {
    slug: 'dashboard-guide',
    title: 'Understanding Your Dashboard',
    category: 'platform',
    sidebarKey: 'dashboard',
    summary: 'Master the dashboard to monitor performance, track KPIs, and identify areas for improvement.',
    difficulty: 'beginner',
    readingTime: 5,
    sections: [
      {
        type: 'what_is',
        title: 'What is the Dashboard?',
        content: 'The Dashboard is your command center for monitoring all messaging activity. It displays real-time KPIs, team performance metrics, inbox health, automation stats, and alerts that need your attention.'
      },
      {
        type: 'how_it_works',
        title: 'Key Widgets',
        content: '**KPI Cards** - Messages sent, delivered, read rates, response times\n\n**Inbox Health** - Open conversations, pending replies, SLA status\n\n**Agent Performance** - Response times and resolution rates per agent\n\n**Automation Stats** - Workflows triggered, messages sent automatically\n\n**Alerts Panel** - Issues requiring immediate attention'
      },
      {
        type: 'tips',
        title: 'Dashboard Tips',
        content: '✅ Check the dashboard daily for performance trends\n✅ Use date filters to compare periods\n✅ Set up alerts for critical metrics\n✅ Export reports for team reviews\n✅ Customize widgets based on your role'
      }
    ],
    relatedSlugs: ['inbox-guide', 'team-management', 'automation-workflows']
  },

  // Templates Guide
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

  // Inbox Guide
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

  // Campaigns Guide
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

  // Contacts Guide
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

  // Automation Guide
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

  // Tags Guide
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

  // User Attributes Guide
  {
    slug: 'user-attributes-guide',
    title: 'Custom User Attributes',
    category: 'messaging',
    sidebarKey: 'user-attributes',
    summary: 'Define custom fields to capture business-specific customer information.',
    difficulty: 'intermediate',
    readingTime: 6,
    sections: [
      {
        type: 'what_is',
        title: 'What are User Attributes?',
        content: 'User Attributes are custom fields you define to store additional information about contacts beyond the standard fields. Use them to capture industry-specific data like subscription plans, loyalty points, or preferences.'
      },
      {
        type: 'when_to_use',
        title: 'When to Use Attributes',
        content: '• Storing subscription or plan type\n• Tracking loyalty points or tier\n• Recording preferences and interests\n• Capturing lead source details\n• Storing order history summaries\n• Any business-specific data points'
      },
      {
        type: 'how_it_works',
        title: 'Creating Attributes',
        content: '1. **Define the attribute** - Name, type (text, number, date, dropdown)\n2. **Set validation** - Required, unique, default values\n3. **Configure visibility** - Which roles can view/edit\n4. **Map to templates** - Use in personalized messages\n5. **Import values** - Bulk update via CSV import'
      },
      {
        type: 'tips',
        title: 'Best Practices',
        content: '✅ Plan your attribute schema before creating\n✅ Use clear, descriptive names\n✅ Choose appropriate data types\n✅ Set sensible defaults where possible\n✅ Use dropdowns for limited options\n✅ Document what each attribute means'
      }
    ],
    relatedSlugs: ['contacts-management', 'tags-and-segments', 'campaigns-guide']
  },

  // Phone Numbers Guide
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

  // Team Guide
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
        content: '**Owner** - Full access, billing, can delete workspace\n\n**Admin** - Full access except billing and workspace deletion\n\n**Manager** - Can manage agents and view reports\n\n**Agent** - Can handle conversations, view contacts, use templates'
      },
      {
        type: 'tips',
        title: 'Best Practices',
        content: '✅ Follow least-privilege principle\n✅ Regularly audit team access\n✅ Remove access promptly when team members leave\n✅ Use descriptive display names\n✅ Set up teams for better organization'
      }
    ],
    relatedSlugs: ['inbox-guide', 'settings-guide', 'billing-guide']
  },

  // Billing Guide
  {
    slug: 'billing-guide',
    title: 'Billing & Usage',
    category: 'platform',
    sidebarKey: 'billing',
    summary: 'Understand your subscription, track usage, and manage payments.',
    difficulty: 'beginner',
    readingTime: 6,
    sections: [
      {
        type: 'what_is',
        title: 'How Billing Works',
        content: 'SMEKSH uses a subscription model with usage-based components. Your plan includes a base fee plus additional charges for messages, phone numbers, and team members beyond included limits.'
      },
      {
        type: 'how_it_works',
        title: 'Understanding Costs',
        content: '**Platform Fee** - Monthly subscription based on your plan\n\n**Conversation Fees** - Charged by Meta based on conversation type\n\n**Add-ons** - Extra team seats, phone numbers, automation runs\n\n**Overage** - Charges when exceeding plan limits'
      },
      {
        type: 'tips',
        title: 'Cost Management Tips',
        content: '✅ Monitor usage regularly in the dashboard\n✅ Set up alerts for usage thresholds\n✅ Choose the right plan for your volume\n✅ Understand Meta conversation pricing\n✅ Download invoices for accounting'
      }
    ],
    relatedSlugs: ['settings-guide', 'team-management']
  },

  // Settings Guide
  {
    slug: 'settings-guide',
    title: 'Workspace Settings',
    category: 'platform',
    sidebarKey: 'settings',
    summary: 'Configure your workspace, integrations, and preferences.',
    difficulty: 'beginner',
    readingTime: 8,
    sections: [
      {
        type: 'what_is',
        title: 'What are Settings?',
        content: 'Settings is your configuration hub for everything in your workspace. From messaging defaults to security policies, team permissions to integrations - all customization happens here.'
      },
      {
        type: 'how_it_works',
        title: 'Settings Sections',
        content: '**Workspace** - Name, logo, timezone, language\n\n**Messaging** - Default sender, rate limits, opt-in keywords\n\n**Inbox** - Assignment rules, SLA, working hours\n\n**Security** - 2FA, sessions, IP allowlist\n\n**Integrations** - Webhooks, CRM connections\n\n**Notifications** - Alerts and preferences'
      },
      {
        type: 'tips',
        title: 'Configuration Tips',
        content: '✅ Set up proper timezone and working hours first\n✅ Configure default sender for consistency\n✅ Enable 2FA for security\n✅ Set up webhooks for integrations\n✅ Review and update settings periodically'
      }
    ],
    relatedSlugs: ['team-management', 'billing-guide', 'automation-workflows']
  },

  // Meta Ads Guide
  {
    slug: 'meta-ads-guide',
    title: 'Meta Ads (Click-to-WhatsApp)',
    category: 'meta-ads',
    sidebarKey: 'meta-ads',
    summary: 'Connect Meta Ads, track CTWA leads, set up attribution, and automate responses for Click-to-WhatsApp campaigns.',
    difficulty: 'intermediate',
    readingTime: 15,
    sections: [
      {
        type: 'what_is',
        title: 'What is Meta Ads Integration?',
        content: 'Click-to-WhatsApp Ads (CTWA) are Meta ads that let users start WhatsApp conversations directly from Facebook or Instagram. SMEKSH captures these leads, tracks attribution to specific ads and campaigns, and can automatically respond and route leads.'
      },
      {
        type: 'when_to_use',
        title: 'When to Use Meta Ads',
        content: '• Running Click-to-WhatsApp ad campaigns\n• Tracking which ads generate WhatsApp leads\n• Automating welcome messages for ad leads\n• Routing hot leads to sales teams instantly\n• Measuring ad ROI with conversion tracking\n• Comparing campaign performance'
      },
      {
        type: 'how_it_works',
        title: 'How It Works',
        content: '1. **Connect Meta Account** - Authenticate with Facebook and grant read permissions\n2. **Select Ad Account & Page** - Choose which assets to track\n3. **Link WhatsApp Number** - Connect to your SMEKSH number\n4. **Enable Tracking** - Start attributing leads to ads\n5. **Set Up Automations** - Auto-respond and route leads\n6. **Analyze Performance** - View analytics and optimize'
      },
      {
        type: 'common_mistakes',
        title: 'Common Mistakes',
        content: '❌ Slow response times - Ad leads expect instant replies\n❌ No automation setup - Leads arrive silently without notification\n❌ Wrong attribution window - Missing leads or over-attributing\n❌ Spammy follow-ups - Hurts WhatsApp quality rating\n❌ Not tracking conversions - Can\'t calculate true ROI'
      },
      {
        type: 'tips',
        title: 'Tips for Success',
        content: '✅ Respond to ad leads within seconds using automations\n✅ Personalize welcome messages with campaign name\n✅ Tag leads by campaign for segmentation\n✅ Track conversions to calculate ROI\n✅ A/B test different welcome messages\n✅ Use round-robin routing for fair lead distribution'
      }
    ],
    examples: [
      {
        title: 'Welcome Automation',
        description: 'Auto-respond when ad lead arrives',
        code: 'Trigger: New Lead from Meta Ad\nActions:\n1. Add tag "Meta Lead"\n2. Add tag "Campaign: {{campaign_name}}"\n3. Assign to Sales Team (round robin)\n4. Send welcome template',
        isGood: true
      },
      {
        title: 'High-Intent Fast Lane',
        description: 'Route hot leads to priority queue',
        code: 'Trigger: First Message (contains "pricing" or "quote")\nActions:\n1. Set priority HIGH\n2. Assign to Sales Manager\n3. Send "pricing inquiry" template',
        isGood: true
      }
    ],
    relatedSlugs: ['automation-workflows', 'contacts-management', 'templates-guide']
  },

  // Integrations Guide
  {
    slug: 'integrations-guide',
    title: 'External Integrations',
    category: 'platform',
    sidebarKey: 'integrations',
    summary: 'Connect Shopify, Razorpay, Zapier, and other tools to automate WhatsApp messaging.',
    difficulty: 'intermediate',
    readingTime: 10,
    sections: [
      {
        type: 'what_is',
        title: 'What are Integrations?',
        content: 'Integrations allow you to connect external systems like e-commerce platforms (Shopify, WooCommerce), payment gateways (Razorpay, PayU), CRMs (LeadSquared), and automation tools (Zapier, Pabbly) to automatically trigger WhatsApp messages based on events in those systems.'
      },
      {
        type: 'when_to_use',
        title: 'When to Use Integrations',
        content: '• **Order Updates** - Send order confirmations when a Shopify order is created\n• **Payment Notifications** - Alert customers when Razorpay payment is captured\n• **Lead Nurturing** - Trigger flows when a new lead is added to LeadSquared\n• **Cart Recovery** - Send reminders for abandoned WooCommerce checkouts\n• **Cross-Platform Automation** - Connect any app via Zapier or Pabbly'
      },
      {
        type: 'how_it_works',
        title: 'How Integrations Work',
        content: '**1. Connect** - Choose an integration from the Integrations Hub and connect using API keys, OAuth, or webhooks.\n\n**2. Configure Webhook** - Copy the unique webhook URL and paste it into your external system settings.\n\n**3. Map Events to Actions** - For each event type (e.g., `shopify.orders.paid`), configure what action to take:\n   - Send a WhatsApp template\n   - Trigger an automation flow\n   - Assign an agent\n   - Add tags to the contact\n\n**4. Map Variables** - Connect payload fields (like `customer.first_name`) to template variables (like `{{first_name}}`).\n\n**5. Monitor** - Use the Event Debugger to see incoming events, check for errors, and retry failed events.'
      },
      {
        type: 'common_mistakes',
        title: 'Common Mistakes',
        content: '❌ Forgetting to add the webhook URL to the external system\n❌ Not testing the connection before going live\n❌ Incorrect variable mapping (wrong payload paths)\n❌ Using wrong phone field in payload\n❌ Not setting up opt-in status before sending marketing messages\n❌ Ignoring failed events in the debugger'
      },
      {
        type: 'tips',
        title: 'Integration Best Practices',
        content: '✅ **Test with sandbox first** - Use test orders/payments before going live\n✅ **Monitor the Event Debugger** - Check for failed events regularly\n✅ **Use conditions (Pro)** - Route high-value orders differently\n✅ **Set up fallback flows** - Handle cases where variable mapping fails\n✅ **Enable retry policies** - Automatically retry failed events\n✅ **Verify webhook signatures** - Keep your webhook secret secure'
      }
    ],
    examples: [
      {
        title: 'Shopify Order Confirmation',
        description: 'Send WhatsApp when order is created',
        code: 'Event: shopify.orders.create\nAction: Send Template "order_confirmation"\n\nVariable Mapping:\n  customer.first_name → {{first_name}}\n  id → {{order_id}}\n  total_price → {{order_total}}\n  order_status_url → {{tracking_link}}',
        isGood: true
      },
      {
        title: 'Razorpay Payment Success',
        description: 'Notify on successful payment',
        code: 'Event: razorpay.payment.captured\nAction: Send Template "payment_success"\n\nVariable Mapping:\n  payload.payment.entity.contact → Phone\n  payload.payment.entity.amount → {{amount}} (÷100)\n  payload.payment.entity.notes.name → {{name}}',
        isGood: true
      },
      {
        title: 'LeadSquared Lead Nurturing',
        description: 'Start flow for new leads',
        code: 'Event: leadsquared.lead.created\nAction: Trigger Flow "new_lead_welcome"\n\nVariable Mapping:\n  Phone → {{phone}}\n  FirstName → {{first_name}}\n  ProspectStage → {{lead_stage}}',
        isGood: true
      }
    ],
    relatedSlugs: ['automation-workflows', 'templates-guide', 'campaigns-guide']
  },

  // Auto-Form Rules Guide
  {
    slug: 'auto-form-rules-guide',
    title: 'Auto-Form Rules',
    category: 'marketing',
    sidebarKey: 'form-rules',
    summary: 'Automatically send WhatsApp Forms based on user intent, keywords, ad clicks, or entry source without any coding.',
    difficulty: 'intermediate',
    readingTime: 8,
    sections: [
      {
        type: 'what_is',
        title: 'What are Auto-Form Rules?',
        content: 'Auto-Form Rules let you automatically send WhatsApp Forms (interactive flows) to contacts based on triggers like first message, keywords, ad clicks, QR scans, or AI-detected intent. Unlike workflow automation, this is a simplified no-code interface specifically designed for form delivery.'
      },
      {
        type: 'when_to_use',
        title: 'When to Use Auto-Form Rules',
        content: '• **Lead Qualification** - Auto-send a qualification form when someone messages you first\n• **Ad Lead Capture** - Instantly send a data collection form when leads click your WhatsApp ads\n• **Keyword Triggers** - Send booking forms when users type "book", "appointment", or "schedule"\n• **QR Code Flows** - Trigger different forms based on QR code source (store, event, print ad)\n• **AI Intent Detection** - Let AI identify intent and send the appropriate form automatically'
      },
      {
        type: 'how_it_works',
        title: 'How Auto-Form Rules Work',
        content: '**1. Choose a Trigger (WHEN)**\n- First incoming message\n- Keyword detected\n- Click-to-WhatsApp ad click\n- QR code scan\n- Specific entry source\n- Tag added\n- Scheduled time\n- AI intent detected (Pro)\n\n**2. Set Conditions (IF)** - Optional filters\n- Message contains specific keywords\n- Source is from specific ad/link/QR\n- User is new or returning\n- Form not already filled\n- Business hours only\n\n**3. Configure Action (THEN)**\n- Select WhatsApp Form (Flow) to send\n- Add optional intro message\n- Set delay before sending (0-10 seconds)\n\n**4. Safety Controls**\n- Send once per user (prevent spam)\n- Stop if agent replies (human takeover)\n- Stop if user types free text\n- Cooldown period between sends\n- Fallback message if form fails'
      },
      {
        type: 'common_mistakes',
        title: 'Common Mistakes',
        content: '❌ No safety controls - sending forms multiple times to same user\n❌ Ignoring agent override - forms keep sending even when agent is chatting\n❌ No fallback message - user gets confused if form delivery fails\n❌ Too short cooldown - annoying users with repeated forms\n❌ Vague keyword triggers - matching unintended messages\n❌ Not testing the flow before activating'
      },
      {
        type: 'tips',
        title: 'Best Practices',
        content: '✅ Always enable "Send once per user" for initial qualification forms\n✅ Set up agent override so human reps can take over smoothly\n✅ Use specific keywords (not single letters or common words)\n✅ Add a brief intro message explaining the form\n✅ Set appropriate cooldown (24-48 hours minimum)\n✅ Test your form delivery before going live\n✅ Monitor completion rates and optimize'
      }
    ],
    examples: [
      {
        title: 'Lead Qualification on First Message',
        description: 'Send a qualification form to new contacts',
        code: 'Trigger: First incoming message\nConditions: User is new, Form not filled\nAction: Send "Lead Qualification" form\nDelay: 2 seconds\nSafety: Send once per user, Stop on agent reply',
        isGood: true
      },
      {
        title: 'Ad Click → Booking Form',
        description: 'Capture leads from Click-to-WhatsApp ads',
        code: 'Trigger: Click-to-WhatsApp ad click\nConditions: Source = Meta Ads\nAction: Send "Appointment Booking" form\nIntro: "Hi! 👋 Let me help you book an appointment."\nSafety: Send once, Stop on free text',
        isGood: true
      },
      {
        title: 'Keyword Trigger',
        description: 'Send demo form when user shows intent',
        code: 'Trigger: Keyword detected ("demo", "trial", "pricing")\nConditions: Business hours only\nAction: Send "Demo Request" form\nDelay: 1 second\nSafety: Cooldown 24 hours',
        isGood: true
      }
    ],
    relatedSlugs: ['automation-workflows', 'templates-guide', 'contacts-management']
  },

  // Advanced Template Management Guide
  {
    slug: 'template-management-advanced',
    title: 'Advanced Template Management',
    category: 'marketing',
    sidebarKey: 'templates',
    summary: 'Master template approval with AI validation, category detection, and Meta best practices.',
    difficulty: 'advanced',
    readingTime: 12,
    sections: [
      {
        type: 'what_is',
        title: 'What is Advanced Template Management?',
        content: 'Beyond basic template creation, AIREATRO provides AI-powered validation, automatic category detection, approval readiness scoring, and guided fix flows to maximize your Meta approval rates and minimize rejections.'
      },
      {
        type: 'when_to_use',
        title: 'Key Features',
        content: '• **AI Template Validator** - Scan templates for issues before submission\n• **Category Detection** - AI detects if your content matches the selected category\n• **Approval Score** - See your template\'s approval likelihood (0-100)\n• **Issue Checklist** - Grouped validation across 5 categories\n• **Fix with AI** - Get AI-suggested rewrites and example values\n• **Status Timeline** - Track your template through the approval process\n• **Fix & Resubmit** - Guided flow to fix rejected templates'
      },
      {
        type: 'how_it_works',
        title: 'Validation Checklist Categories',
        content: '**1. Category & Intent**\n- Does content match selected category (Utility/Marketing/Authentication)?\n- Is UTILITY template free of promotional language?\n- Does AUTHENTICATION include OTP variable {{1}}?\n\n**2. Variables & Examples**\n- Are all variables ({{1}}, {{2}}, etc.) properly formatted?\n- Does each variable have a realistic example value?\n- Are examples clear and contextual?\n\n**3. Links & Buttons**\n- Do URLs use HTTPS?\n- No URL shorteners (bit.ly, tinyurl)?\n- Button text clear and concise?\n\n**4. Language & Formatting**\n- No ALL CAPS text?\n- No excessive punctuation (!!!)?\n- No spammy language?\n\n**5. Compliance & Risk**\n- No banned words (free money, guaranteed)?\n- No misleading claims?\n- Appropriate opt-out instructions for marketing?'
      },
      {
        type: 'common_mistakes',
        title: 'Why Templates Get Rejected',
        content: '❌ **Category Mismatch** - Most common! Content is promotional but category is Utility\n❌ **Vague Variables** - Using {{1}} without clear context or examples\n❌ **Missing Examples** - Meta requires sample values for all variables\n❌ **URL Issues** - Using shorteners, redirects, or non-HTTPS links\n❌ **Promotional Utility** - Adding "buy now", "discount" to utility templates\n❌ **Policy Violations** - Job scams, visa promises, gambling content'
      },
      {
        type: 'tips',
        title: 'Maximizing Approval Rates',
        content: '✅ **Always validate before submitting** - Use the AI validator\n✅ **Match category to content** - When in doubt, choose Marketing\n✅ **Provide clear examples** - Make variable usage obvious\n✅ **Keep it simple** - Avoid complex formatting in early templates\n✅ **Use direct links** - No redirects or shorteners\n✅ **Build trust first** - Start with simple utility templates before marketing\n✅ **Fix and resubmit** - Don\'t give up after rejection; use the fix flow'
      }
    ],
    examples: [
      {
        title: 'Good Utility Template',
        description: 'Clear, transactional, no promotional content',
        code: 'Category: UTILITY\n\nHi {{1}},\n\nYour order #{{2}} has been shipped! 📦\n\nEstimated delivery: {{3}}\nTrack here: {{4}}\n\nNeed help? Reply to this message.\n\nExamples:\n{{1}} = Rahul\n{{2}} = ORD-12345\n{{3}} = Tomorrow, 2-6 PM\n{{4}} = https://track.store.com/ORD-12345',
        isGood: true
      },
      {
        title: 'Bad Category Choice',
        description: 'Promotional content marked as Utility - will be rejected',
        code: 'Category: UTILITY ❌\n\nHi {{1}}!\n\n🎉 SPECIAL OFFER! Get 30% OFF today only!\n\nUse code: SAVE30\nShop now: {{2}}\n\n❌ This should be MARKETING, not UTILITY',
        isGood: false
      }
    ],
    relatedSlugs: ['templates-guide', 'campaigns-guide', 'automation-workflows']
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
