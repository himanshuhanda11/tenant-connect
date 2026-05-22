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
  category: 'study_abroad' | 'real_estate' | 'ecommerce' | 'healthcare' | 'general' | 'visa' | 'travel' | 'support' | 'followup';
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
  // ────────────────────────────────────────────────────────────
  // STEP 3 — Premium prebuilt flows (Visa, Travel, Real Estate, Support, Follow-up)
  // ────────────────────────────────────────────────────────────
  {
    id: 'visa_immigration',
    name: 'Visa & Immigration',
    description: 'Capture destination, visa type, budget & timeline, then book a consultation',
    emoji: '🛂',
    category: 'visa',
    nodes: [
      { node_key: 'welcome', node_type: 'text-buttons', label: 'Welcome', position_x: 400, position_y: 100, config: { message: 'Hi {{first_name}} 👋 Welcome to our Visa & Immigration desk. We help you with a smooth visa journey.\n\nWhich country are you applying for?', buttons: ['🇨🇦 Canada', '🇦🇺 Australia', '🇬🇧 UK', '🇺🇸 USA', 'Other'] } },
      { node_key: 'ask_visa_type', node_type: 'text-buttons', label: 'Visa Type', position_x: 400, position_y: 260, config: { message: 'Which visa type do you need?', buttons: ['Study', 'Work', 'PR / Immigration', 'Tourist', 'Business'], save_variable: 'visa_type' } },
      { node_key: 'ask_budget', node_type: 'text-buttons', label: 'Budget', position_x: 400, position_y: 420, config: { message: 'What is your overall budget (in USD) for the visa process?', buttons: ['<5k', '5k–15k', '15k–30k', '30k+'], save_variable: 'budget' } },
      { node_key: 'ask_timeline', node_type: 'text-buttons', label: 'Timeline', position_x: 400, position_y: 580, config: { message: 'When are you planning to apply?', buttons: ['This month', '1–3 months', '3–6 months', '6+ months'], save_variable: 'timeline' } },
      { node_key: 'tag_qualified', node_type: 'add-tag', label: 'Tag Qualified', position_x: 400, position_y: 740, config: { action: 'add', tag: 'Visa-Qualified' } },
      { node_key: 'assign_consultant', node_type: 'assign-agent', label: 'Assign Consultant', position_x: 400, position_y: 900, config: { strategy: 'round_robin' } },
      { node_key: 'book_consult', node_type: 'text-buttons', label: 'Book Consultation', position_x: 400, position_y: 1060, config: { message: 'Thanks {{first_name}} ✅ A visa consultant has been assigned. Would you like to book a free 15-min consultation now?', buttons: ['Book Now', 'Tomorrow', 'Just WhatsApp'] } },
    ],
  },
  {
    id: 'travel_agency',
    name: 'Travel Agency',
    description: 'Destination, dates, budget & passengers → route to a travel expert',
    emoji: '✈️',
    category: 'travel',
    nodes: [
      { node_key: 'welcome', node_type: 'text-buttons', label: 'Welcome', position_x: 400, position_y: 100, config: { message: 'Hi {{first_name}} ✈️ Where would you like to travel?', buttons: ['Maldives', 'Dubai', 'Europe', 'Thailand', 'Other'] } },
      { node_key: 'ask_dates', node_type: 'text-buttons', label: 'Travel Dates', position_x: 400, position_y: 260, config: { message: 'When are you planning to travel?\nExample: 15 Dec – 22 Dec', save_variable: 'travel_dates' } },
      { node_key: 'ask_budget', node_type: 'text-buttons', label: 'Budget', position_x: 400, position_y: 420, config: { message: 'What is your per-person budget?', buttons: ['<$500', '$500–$1500', '$1500–$3000', '$3000+'], save_variable: 'budget' } },
      { node_key: 'ask_pax', node_type: 'text-buttons', label: 'Passengers', position_x: 400, position_y: 580, config: { message: 'How many people are travelling?', buttons: ['1', '2', '3–4', '5+'], save_variable: 'passengers' } },
      { node_key: 'tag_travel', node_type: 'add-tag', label: 'Tag Travel Lead', position_x: 400, position_y: 740, config: { action: 'add', tag: 'Travel-Lead' } },
      { node_key: 'assign_expert', node_type: 'assign-agent', label: 'Assign Travel Expert', position_x: 400, position_y: 900, config: { strategy: 'round_robin' } },
    ],
  },
  {
    id: 'real_estate_basic',
    name: 'Real Estate',
    description: 'Property type, budget, city & timeline → assign sales agent',
    emoji: '🏠',
    category: 'real_estate',
    nodes: [
      { node_key: 'welcome', node_type: 'text-buttons', label: 'Welcome', position_x: 400, position_y: 100, config: { message: 'Hi {{first_name}} 🏠 Are you looking to BUY or RENT?', buttons: ['Buy', 'Rent', 'Investment'], save_variable: 'intent' } },
      { node_key: 'ask_type', node_type: 'text-buttons', label: 'Property Type', position_x: 400, position_y: 260, config: { message: 'What type of property?', buttons: ['Apartment', 'Villa', 'Plot', 'Commercial'], save_variable: 'property_type' } },
      { node_key: 'ask_budget', node_type: 'text-buttons', label: 'Budget', position_x: 400, position_y: 420, config: { message: 'What is your budget range?', buttons: ['<50L', '50L–1Cr', '1–2Cr', '2Cr+'], save_variable: 'budget' } },
      { node_key: 'ask_city', node_type: 'text-buttons', label: 'City / Area', position_x: 400, position_y: 580, config: { message: 'Which city or area are you interested in?', save_variable: 'city' } },
      { node_key: 'ask_timeline', node_type: 'text-buttons', label: 'Timeline', position_x: 400, position_y: 740, config: { message: 'When do you plan to finalise?', buttons: ['Immediately', '1–3 months', '3–6 months', 'Just exploring'], save_variable: 'timeline' } },
      { node_key: 'tag_re', node_type: 'add-tag', label: 'Tag Real Estate Lead', position_x: 400, position_y: 900, config: { action: 'add', tag: 'Real-Estate-Lead' } },
      { node_key: 'assign_agent', node_type: 'assign-agent', label: 'Assign Sales Agent', position_x: 400, position_y: 1060, config: { strategy: 'round_robin' } },
    ],
  },
  {
    id: 'whatsapp_support',
    name: 'WhatsApp Support',
    description: 'Welcome → issue selection → route to right department → human handover',
    emoji: '🎧',
    category: 'support',
    nodes: [
      { node_key: 'welcome', node_type: 'text-buttons', label: 'Support Welcome', position_x: 400, position_y: 100, config: { message: 'Hi {{first_name}} 👋 Welcome to support. How can we help you today?', buttons: ['Billing', 'Technical', 'Order Status', 'Other'] } },
      { node_key: 'route_check', node_type: 'condition', label: 'Route to Dept', position_x: 400, position_y: 260, config: { keyword: 'Billing' } },
      { node_key: 'tag_dept', node_type: 'add-tag', label: 'Tag Department', position_x: 400, position_y: 420, config: { action: 'add', tag: 'Support-Ticket' } },
      { node_key: 'assign_human', node_type: 'assign-agent', label: 'Human Handover', position_x: 400, position_y: 580, config: { strategy: 'round_robin' } },
      { node_key: 'ack', node_type: 'text-buttons', label: 'Acknowledge', position_x: 400, position_y: 740, config: { message: 'Thanks! Our team will reply within a few minutes. Your ticket is on the way 📨' } },
    ],
  },
  {
    id: 'missed_lead_followup',
    name: 'Missed Lead Follow-up',
    description: 'Delay → reminder → follow-up; stops automatically when the lead replies',
    emoji: '⏰',
    category: 'followup',
    nodes: [
      { node_key: 'delay_1h', node_type: 'delay', label: 'Wait 1 Hour', position_x: 400, position_y: 100, config: { duration: 1, unit: 'hours' } },
      { node_key: 'reminder', node_type: 'text-buttons', label: 'Gentle Reminder', position_x: 400, position_y: 260, config: { message: 'Hi {{first_name}} 👋 just checking in — did you get a chance to review what we discussed?', buttons: ['Yes', 'Need more info', 'Not now'] } },
      { node_key: 'delay_24h', node_type: 'delay', label: 'Wait 24 Hours', position_x: 400, position_y: 420, config: { duration: 24, unit: 'hours' } },
      { node_key: 'followup', node_type: 'text-buttons', label: 'Follow-up', position_x: 400, position_y: 580, config: { message: 'Hi {{first_name}}, sharing one last note — would you like me to keep this open or close it?', buttons: ['Keep Open', 'Close', 'Call Me'] } },
      { node_key: 'delay_72h', node_type: 'delay', label: 'Wait 3 Days', position_x: 400, position_y: 740, config: { duration: 72, unit: 'hours' } },
      { node_key: 'final', node_type: 'text-buttons', label: 'Final Touchpoint', position_x: 400, position_y: 900, config: { message: 'Hey {{first_name}}, this is our final note. Reply anytime — we are here when you are ready 🙌' } },
    ],
  },
];

export const PREBUILT_FLOW_CATEGORIES: Record<string, { label: string; color: string }> = {
  study_abroad: { label: 'Study Abroad', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' },
  real_estate: { label: 'Real Estate', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  ecommerce: { label: 'E-commerce', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  healthcare: { label: 'Healthcare', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' },
  general: { label: 'General', color: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300' },
  visa: { label: 'Visa', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300' },
  travel: { label: 'Travel', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  support: { label: 'Support', color: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300' },
  followup: { label: 'Follow-up', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
};
