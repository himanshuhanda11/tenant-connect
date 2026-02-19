// Prebuilt Flow Templates for Flow Builder
// Each template defines a full node + edge structure that auto-loads into the canvas

export interface PrebuiltFlowNode {
  node_key: string;
  node_type: string;
  label: string;
  position_x: number;
  position_y: number;
  config: Record<string, any>;
}

export interface PrebuiltFlow {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: 'study_abroad' | 'real_estate' | 'ecommerce' | 'healthcare' | 'general';
  nodes: PrebuiltFlowNode[];
}

export const PREBUILT_FLOWS: PrebuiltFlow[] = [
  {
    id: 'study_abroad_basic',
    name: 'Study Abroad – Basic Qualification',
    description: 'Qualify study abroad leads with country, qualification & budget capture',
    emoji: '🎓',
    category: 'study_abroad',
    nodes: [
      {
        node_key: 'welcome_msg',
        node_type: 'text-buttons',
        label: 'Welcome Message',
        position_x: 400,
        position_y: 180,
        config: {
          message: 'Hi {{first_name}} 👋\nWelcome to Euro Prime Consulting Services.\n\nWhich country are you planning to study in?',
          buttons: ['🇬🇧 UK', '🇨🇦 Canada', '🇦🇺 Australia', '🇺🇸 USA', '🌍 Not Sure'],
        },
      },
      {
        node_key: 'ask_qualification',
        node_type: 'text-buttons',
        label: 'Ask Qualification',
        position_x: 400,
        position_y: 330,
        config: {
          message: 'Please share your last qualification and percentage.\nExample: B.Com – 65%',
          buttons: [],
          save_variable: 'last_qualification',
        },
      },
      {
        node_key: 'ask_intake',
        node_type: 'text-buttons',
        label: 'Ask Intake',
        position_x: 400,
        position_y: 480,
        config: {
          message: 'Which intake are you targeting?\nJan / May / July / Sept 2026',
          buttons: [],
          save_variable: 'intake',
        },
      },
      {
        node_key: 'tag_lead',
        node_type: 'add-tag',
        label: 'Tag as Study Abroad Lead',
        position_x: 400,
        position_y: 630,
        config: { action: 'add', tag: 'Study-Abroad-Lead' },
      },
      {
        node_key: 'assign_counselor',
        node_type: 'assign-agent',
        label: 'Assign Counselor',
        position_x: 400,
        position_y: 780,
        config: { strategy: 'round_robin' },
      },
    ],
  },
  {
    id: 'study_abroad_uk',
    name: 'Study Abroad – UK',
    description: 'UK-specific study abroad flow with IELTS check, SOP support & university shortlisting',
    emoji: '🇬🇧',
    category: 'study_abroad',
    nodes: [
      {
        node_key: 'welcome_uk',
        node_type: 'text-buttons',
        label: 'UK Welcome',
        position_x: 400,
        position_y: 180,
        config: {
          message: 'Great choice! 🇬🇧 The UK has world-class universities.\n\nLet me help you find the perfect fit. What is your highest qualification?',
          buttons: [],
          save_variable: 'last_qualification',
        },
      },
      {
        node_key: 'ielts_check',
        node_type: 'text-buttons',
        label: 'IELTS Check',
        position_x: 400,
        position_y: 330,
        config: {
          message: 'Have you taken IELTS/PTE?',
          buttons: ['Yes', 'No', 'Planning Soon'],
          save_variable: 'english_test_status',
        },
      },
      {
        node_key: 'ask_budget',
        node_type: 'text-buttons',
        label: 'Ask Budget',
        position_x: 400,
        position_y: 480,
        config: {
          message: 'What is your approximate yearly budget for tuition + living?',
          buttons: ['Under £15,000', '£15,000 – £25,000', '£25,000+'],
          save_variable: 'budget',
        },
      },
      {
        node_key: 'tag_uk',
        node_type: 'add-tag',
        label: 'Tag UK Interest',
        position_x: 400,
        position_y: 630,
        config: { action: 'add', tag: 'UK-Interest' },
      },
      {
        node_key: 'cta_call',
        node_type: 'text-buttons',
        label: 'Call Booking CTA',
        position_x: 400,
        position_y: 780,
        config: {
          message: 'Great {{first_name}} ✅\n\nBased on your profile, our UK expert will shortlist the best universities for you.\n\nWould you like a FREE assessment call today?',
          buttons: ['Yes, Call Me', 'Tomorrow', 'Just WhatsApp'],
        },
      },
      {
        node_key: 'assign_uk',
        node_type: 'assign-agent',
        label: 'Assign UK Counselor',
        position_x: 400,
        position_y: 930,
        config: { strategy: 'round_robin' },
      },
    ],
  },
  {
    id: 'study_abroad_canada',
    name: 'Study Abroad – Canada',
    description: 'Canada-specific study abroad flow with IELTS, budget & intake capture',
    emoji: '🇨🇦',
    category: 'study_abroad',
    nodes: [
      {
        node_key: 'welcome_ca',
        node_type: 'text-buttons',
        label: 'Canada Welcome',
        position_x: 400,
        position_y: 180,
        config: {
          message: 'Excellent! 🇨🇦 Canada is one of the top destinations for international students.\n\nWhat is your highest qualification?',
          buttons: [],
          save_variable: 'last_qualification',
        },
      },
      {
        node_key: 'ielts_check',
        node_type: 'text-buttons',
        label: 'IELTS/PTE Check',
        position_x: 400,
        position_y: 330,
        config: {
          message: 'Have you taken IELTS/PTE?',
          buttons: ['Yes', 'No', 'Planning Soon'],
          save_variable: 'english_test_status',
        },
      },
      {
        node_key: 'ask_intake',
        node_type: 'text-buttons',
        label: 'Ask Intake',
        position_x: 400,
        position_y: 480,
        config: {
          message: 'Which intake are you targeting?\nJan / May / Sept 2026',
          buttons: ['Jan 2026', 'May 2026', 'Sept 2026'],
          save_variable: 'intake',
        },
      },
      {
        node_key: 'ask_budget_ca',
        node_type: 'text-buttons',
        label: 'Ask Budget',
        position_x: 400,
        position_y: 630,
        config: {
          message: 'What is your approximate yearly budget (CAD)?',
          buttons: ['Under $20,000', '$20,000 – $35,000', '$35,000+'],
          save_variable: 'budget',
        },
      },
      {
        node_key: 'tag_ca',
        node_type: 'add-tag',
        label: 'Tag Canada Interest',
        position_x: 400,
        position_y: 780,
        config: { action: 'add', tag: 'Canada-Interest' },
      },
      {
        node_key: 'assign_ca',
        node_type: 'assign-agent',
        label: 'Assign Canada Counselor',
        position_x: 400,
        position_y: 930,
        config: { strategy: 'round_robin' },
      },
    ],
  },
  {
    id: 'study_abroad_australia',
    name: 'Study Abroad – Australia',
    description: 'Australia-specific study abroad flow with IELTS, GTE & budget capture',
    emoji: '🇦🇺',
    category: 'study_abroad',
    nodes: [
      {
        node_key: 'welcome_au',
        node_type: 'text-buttons',
        label: 'Australia Welcome',
        position_x: 400,
        position_y: 180,
        config: {
          message: 'Awesome choice! 🇦🇺 Australia offers excellent study + work opportunities.\n\nWhat is your highest qualification?',
          buttons: [],
          save_variable: 'last_qualification',
        },
      },
      {
        node_key: 'ielts_check',
        node_type: 'text-buttons',
        label: 'IELTS/PTE Check',
        position_x: 400,
        position_y: 330,
        config: {
          message: 'Have you taken IELTS/PTE?',
          buttons: ['Yes', 'No', 'Planning Soon'],
          save_variable: 'english_test_status',
        },
      },
      {
        node_key: 'ask_budget_au',
        node_type: 'text-buttons',
        label: 'Ask Budget',
        position_x: 400,
        position_y: 480,
        config: {
          message: 'What is your approximate yearly budget (AUD)?',
          buttons: ['Under $25,000', '$25,000 – $40,000', '$40,000+'],
          save_variable: 'budget',
        },
      },
      {
        node_key: 'tag_au',
        node_type: 'add-tag',
        label: 'Tag Australia Interest',
        position_x: 400,
        position_y: 630,
        config: { action: 'add', tag: 'Australia-Interest' },
      },
      {
        node_key: 'cta_au',
        node_type: 'text-buttons',
        label: 'Call Booking CTA',
        position_x: 400,
        position_y: 780,
        config: {
          message: 'Great {{first_name}} ✅\n\nOur Australia expert will review your profile and recommend the best universities.\n\nWould you like a FREE assessment call?',
          buttons: ['Yes, Call Me', 'Tomorrow', 'Just WhatsApp'],
        },
      },
      {
        node_key: 'assign_au',
        node_type: 'assign-agent',
        label: 'Assign AU Counselor',
        position_x: 400,
        position_y: 930,
        config: { strategy: 'round_robin' },
      },
    ],
  },
  {
    id: 'study_abroad_full_funnel',
    name: 'Study Abroad – Full Funnel',
    description: 'Complete study abroad flow with country selection, qualification, IELTS, budget, tagging, assignment & follow-up',
    emoji: '🎓',
    category: 'study_abroad',
    nodes: [
      {
        node_key: 'welcome_msg',
        node_type: 'text-buttons',
        label: 'Welcome Message',
        position_x: 400,
        position_y: 180,
        config: {
          message: 'Hi {{first_name}} 👋\nWelcome to Euro Prime Consulting Services.\n\nWhich country are you planning to study in?',
          buttons: ['🇬🇧 UK', '🇨🇦 Canada', '🇦🇺 Australia', '🇺🇸 USA', '🌍 Not Sure'],
          save_variable: 'country_interest',
        },
      },
      {
        node_key: 'ask_qualification',
        node_type: 'text-buttons',
        label: 'Qualification Capture',
        position_x: 400,
        position_y: 330,
        config: {
          message: 'Please share your last qualification and percentage.\nExample: B.Com – 65%',
          buttons: [],
          save_variable: 'last_qualification',
        },
      },
      {
        node_key: 'ask_intake',
        node_type: 'text-buttons',
        label: 'Intake Selection',
        position_x: 400,
        position_y: 480,
        config: {
          message: 'Which intake are you targeting?\nJan / May / July / Sept 2026',
          buttons: ['Jan 2026', 'May 2026', 'July 2026', 'Sept 2026'],
          save_variable: 'intake',
        },
      },
      {
        node_key: 'english_test',
        node_type: 'text-buttons',
        label: 'English Test Status',
        position_x: 400,
        position_y: 630,
        config: {
          message: 'Have you taken IELTS/PTE?',
          buttons: ['Yes', 'No', 'Planning Soon'],
          save_variable: 'english_test_status',
        },
      },
      {
        node_key: 'ask_budget',
        node_type: 'text-buttons',
        label: 'Budget Capture',
        position_x: 400,
        position_y: 780,
        config: {
          message: 'What is your approximate yearly budget?',
          buttons: ['Under ₹10L', '₹10L – ₹20L', '₹20L+'],
          save_variable: 'budget',
        },
      },
      {
        node_key: 'tag_lead',
        node_type: 'add-tag',
        label: 'Tag: Study Abroad Lead',
        position_x: 400,
        position_y: 930,
        config: { action: 'add', tag: 'Study-Abroad-Lead' },
      },
      {
        node_key: 'set_country_tag',
        node_type: 'set-attribute',
        label: 'Save Country Interest',
        position_x: 400,
        position_y: 1080,
        config: { attribute: 'country_interest', value: '{{country_interest}}' },
      },
      {
        node_key: 'assign_counselor',
        node_type: 'assign-agent',
        label: 'Assign Counselor',
        position_x: 400,
        position_y: 1230,
        config: { strategy: 'round_robin' },
      },
      {
        node_key: 'cta_call',
        node_type: 'text-buttons',
        label: 'Call Booking CTA',
        position_x: 400,
        position_y: 1380,
        config: {
          message: 'Great {{first_name}} ✅\n\nBased on your profile, our expert counsellor will shortlist best universities for {{country_interest}}.\n\nWould you like a FREE assessment call today?',
          buttons: ['Yes, Call Me', 'Tomorrow', 'Just WhatsApp'],
        },
      },
      {
        node_key: 'delay_followup',
        node_type: 'delay',
        label: 'Wait 6 Hours',
        position_x: 400,
        position_y: 1530,
        config: { duration: 6, unit: 'hours' },
      },
      {
        node_key: 'followup_msg',
        node_type: 'text-buttons',
        label: 'Follow-up Message',
        position_x: 400,
        position_y: 1680,
        config: {
          message: 'Hi {{first_name}} 👋\nJust checking if you\'re still interested in studying in {{country_interest}} for {{intake}}?',
          buttons: ['Yes, I am!', 'Need more info', 'Not interested'],
        },
      },
    ],
  },
];

export const PREBUILT_FLOW_CATEGORIES: Record<string, { label: string; color: string }> = {
  study_abroad: { label: 'Study Abroad', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' },
  real_estate: { label: 'Real Estate', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  ecommerce: { label: 'E-commerce', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  healthcare: { label: 'Healthcare', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' },
  general: { label: 'General', color: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300' },
};
