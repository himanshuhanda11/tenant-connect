// Pre-approved WhatsApp Business templates — 100+ ready-to-use globally
// Each template includes a plain-English example preview and clear use case.

export interface PreApprovedTemplate {
  id: number;
  name: string;
  category: string;
  industry?: string;
  metaCategory: 'UTILITY' | 'MARKETING' | 'AUTHENTICATION';
  icon: string;
  description: string;
  useCase: string;
  body: string;
  example: string;
  variables: string[];
  tags: string[];
  status: 'approved';
  downloads: number;
  isNew?: boolean;
  isTrending?: boolean;
}

export const PRE_APPROVED_TEMPLATES: PreApprovedTemplate[] = [
  {
    "id": 101,
    "name": "Flash Sale Alert",
    "category": "Marketing",
    "industry": "E-commerce",
    "metaCategory": "MARKETING",
    "icon": "Zap",
    "description": "Drive urgency with limited-hour flash sales",
    "body": "⚡ FLASH SALE — {{1}}!\n\nHi {{2}}, enjoy up to {{3}}% off across {{4}}.\n\nUse code: *{{5}}*\nEnds in: {{6}}\n\nShop now: {{7}}",
    "variables": [
      "Sale Name",
      "Customer Name",
      "Discount %",
      "Category",
      "Promo Code",
      "Time Left",
      "Shop URL"
    ],
    "tags": [
      "sale",
      "urgency",
      "ecommerce"
    ],
    "status": "approved",
    "downloads": 14200,
    "isTrending": true,
    "example": "⚡ FLASH SALE — Summer Splash!\n\nHi Alex, enjoy up to 30% off across Footwear.\n\nUse code: *SAVE30*\nEnds in: 2 hours\n\nShop now: shop.bright.co",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 102,
    "name": "Abandoned Cart Offer",
    "category": "Marketing",
    "industry": "E-commerce",
    "metaCategory": "MARKETING",
    "icon": "ShoppingCart",
    "description": "Recover carts with an exclusive incentive",
    "body": "Hi {{1}},\n\nYou left {{2}} in your cart 🛒\n\nWe saved it for you and added *{{3}}% off* with code *{{4}}*.\n\nComplete checkout: {{5}}\n\nOffer expires in {{6}} hours.",
    "variables": [
      "Customer Name",
      "Items",
      "Discount %",
      "Promo Code",
      "Checkout URL",
      "Hours"
    ],
    "tags": [
      "cart",
      "recovery",
      "discount"
    ],
    "status": "approved",
    "downloads": 9167,
    "isTrending": true,
    "example": "Hi Alex,\n\nYou left Aurora Sneakers (x1) in your cart 🛒\n\nWe saved it for you and added *30% off* with code *SAVE30*.\n\nComplete checkout: bright.co/checkout\n\nOffer expires in 4 hours.",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 103,
    "name": "Festival Sale",
    "category": "Marketing",
    "industry": "E-commerce",
    "metaCategory": "MARKETING",
    "icon": "Sparkles",
    "description": "Festive promotion with site-wide offers",
    "body": "🎉 {{1}} Sale is LIVE!\n\nHi {{2}}, celebrate with us — up to {{3}}% off everything.\n\nFree shipping on orders above {{4}}.\n\nShop: {{5}}",
    "variables": [
      "Festival Name",
      "Customer Name",
      "Discount %",
      "Min Order",
      "Shop URL"
    ],
    "tags": [
      "festival",
      "sale",
      "seasonal"
    ],
    "status": "approved",
    "downloads": 4544,
    "example": "🎉 Diwali Sale is LIVE!\n\nHi Alex, celebrate with us — up to 30% off everything.\n\nFree shipping on orders above $50.\n\nShop: shop.bright.co",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 104,
    "name": "New Collection Launch",
    "category": "Marketing",
    "industry": "E-commerce",
    "metaCategory": "MARKETING",
    "icon": "Sparkles",
    "description": "Announce a new product collection",
    "body": "Hi {{1}} 👋\n\nOur new *{{2}}* collection just dropped.\n\nEarly access for our customers — explore: {{3}}",
    "variables": [
      "Customer Name",
      "Collection Name",
      "Collection URL"
    ],
    "tags": [
      "launch",
      "collection",
      "new"
    ],
    "status": "approved",
    "downloads": 7496,
    "example": "Hi Alex 👋\n\nOur new *Alex* collection just dropped.\n\nEarly access for our customers — explore: bright.co/go",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 105,
    "name": "Back in Stock",
    "category": "Marketing",
    "industry": "E-commerce",
    "metaCategory": "MARKETING",
    "icon": "Package",
    "description": "Notify wishlisted customers product is restocked",
    "body": "Good news {{1}}!\n\n*{{2}}* is back in stock 🎉\n\nQuantities are limited — grab it: {{3}}",
    "variables": [
      "Customer Name",
      "Product Name",
      "Product URL"
    ],
    "tags": [
      "back-in-stock",
      "wishlist"
    ],
    "status": "approved",
    "downloads": 5452,
    "example": "Good news Alex!\n\n*Aurora Sneakers* is back in stock 🎉\n\nQuantities are limited — grab it: Aurora Sneakers",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 106,
    "name": "Limited-Time Offer",
    "category": "Marketing",
    "industry": "E-commerce",
    "metaCategory": "MARKETING",
    "icon": "Clock",
    "description": "24-48 hour exclusive offer for engaged customers",
    "body": "Hi {{1}}, exclusive {{2}}-hour offer 🎁\n\n{{3}}% off your next order with code *{{4}}*.\n\nShop now: {{5}}",
    "variables": [
      "Customer Name",
      "Hours",
      "Discount %",
      "Promo Code",
      "Shop URL"
    ],
    "tags": [
      "limited",
      "offer",
      "discount"
    ],
    "status": "approved",
    "downloads": 7847,
    "example": "Hi Alex, exclusive 4-hour offer 🎁\n\n30% off your next order with code *SAVE30*.\n\nShop now: shop.bright.co",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 107,
    "name": "COD Order Confirmation",
    "category": "Marketing",
    "industry": "E-commerce",
    "metaCategory": "MARKETING",
    "icon": "BadgeCheck",
    "description": "Soft-confirm a cash-on-delivery order",
    "body": "Hi {{1}}, please confirm your COD order #{{2}} of {{3}}.\n\nReply *YES* to confirm or *NO* to cancel within {{4}} hours.",
    "variables": [
      "Customer Name",
      "Order ID",
      "Amount",
      "Hours"
    ],
    "tags": [
      "cod",
      "confirmation",
      "order"
    ],
    "status": "approved",
    "downloads": 3783,
    "example": "Hi Alex, please confirm your COD order ##10248 of $129.00.\n\nReply *YES* to confirm or *NO* to cancel within 4 hours.",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 108,
    "name": "VIP Customer Offer",
    "category": "Marketing",
    "industry": "E-commerce",
    "metaCategory": "MARKETING",
    "icon": "Crown",
    "description": "Reward loyal customers with VIP-only deals",
    "body": "Hi {{1}} 👑\n\nAs a VIP, here's *{{2}}% off* exclusively for you.\n\nUse code: *{{3}}* — valid till {{4}}.\n\nShop: {{5}}",
    "variables": [
      "Customer Name",
      "Discount %",
      "Promo Code",
      "Expiry Date",
      "Shop URL"
    ],
    "tags": [
      "vip",
      "loyalty",
      "exclusive"
    ],
    "status": "approved",
    "downloads": 9626,
    "example": "Hi Alex 👑\n\nAs a VIP, here's *30% off* exclusively for you.\n\nUse code: *SAVE30* — valid till Dec 31, 2026.\n\nShop: shop.bright.co",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 109,
    "name": "Upsell / Cross-sell",
    "category": "Marketing",
    "industry": "E-commerce",
    "metaCategory": "MARKETING",
    "icon": "Layers",
    "description": "Suggest complementary products after purchase",
    "body": "Hi {{1}}, customers who bought *{{2}}* loved these too 💡\n\nView picks: {{3}}\n\nUse *{{4}}* for {{5}}% off.",
    "variables": [
      "Customer Name",
      "Last Product",
      "Recommendations URL",
      "Promo Code",
      "Discount %"
    ],
    "tags": [
      "upsell",
      "recommendations"
    ],
    "status": "approved",
    "downloads": 7831,
    "example": "Hi Alex, customers who bought *Aurora Sneakers* loved these too 💡\n\nView picks: bright.co/go\n\nUse *SAVE30* for 30% off.",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 110,
    "name": "Order Discount Coupon",
    "category": "Marketing",
    "industry": "E-commerce",
    "metaCategory": "MARKETING",
    "icon": "Gift",
    "description": "Reward customers with a discount on next order",
    "body": "Thank you for shopping with us, {{1}}! 💝\n\nHere's *{{2}}% off* your next order with code *{{3}}*.\n\nValid until {{4}}. Shop: {{5}}",
    "variables": [
      "Customer Name",
      "Discount %",
      "Promo Code",
      "Expiry Date",
      "Shop URL"
    ],
    "tags": [
      "discount",
      "coupon",
      "retention"
    ],
    "status": "approved",
    "downloads": 8342,
    "example": "Thank you for shopping with us, Alex! 💝\n\nHere's *30% off* your next order with code *SAVE30*.\n\nValid until Dec 31, 2026. Shop: shop.bright.co",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 111,
    "name": "Property Launch",
    "category": "Marketing",
    "industry": "Real Estate",
    "metaCategory": "MARKETING",
    "icon": "Building",
    "description": "Announce a new project launch to leads",
    "body": "🏗️ New Launch — {{1}}\n\nHi {{2}}, presenting *{{3}}* in {{4}}.\n\nStarting at {{5}}. Pre-launch prices for limited buyers.\n\nBrochure: {{6}}",
    "variables": [
      "Project Type",
      "Customer Name",
      "Project Name",
      "Location",
      "Starting Price",
      "Brochure URL"
    ],
    "tags": [
      "property",
      "launch",
      "realestate"
    ],
    "status": "approved",
    "downloads": 1384,
    "example": "🏗️ New Launch — Sample\n\nHi Alex, presenting *Alex* in Downtown Store.\n\nStarting at $129.00. Pre-launch prices for limited buyers.\n\nBrochure: bright.co/go",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 112,
    "name": "Site Visit Booking",
    "category": "Marketing",
    "industry": "Real Estate",
    "metaCategory": "MARKETING",
    "icon": "MapPin",
    "description": "Invite leads to book a site visit",
    "body": "Hi {{1}}, book a free site visit for *{{2}}* in {{3}}.\n\nPick a time: {{4}}\n\nOur consultant {{5}} will assist you.",
    "variables": [
      "Customer Name",
      "Project Name",
      "Location",
      "Booking URL",
      "Agent Name"
    ],
    "tags": [
      "site-visit",
      "booking",
      "realestate"
    ],
    "status": "approved",
    "downloads": 3556,
    "example": "Hi Alex, book a free site visit for *Alex* in Downtown Store.\n\nPick a time: bright.co/book\n\nOur consultant Priya will assist you.",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 113,
    "name": "Price Drop Alert",
    "category": "Marketing",
    "industry": "Real Estate",
    "metaCategory": "MARKETING",
    "icon": "TrendingDown",
    "description": "Notify interested buyers about a price reduction",
    "body": "Hi {{1}}, prices for *{{2}}* are down by {{3}}% this week.\n\nNew price: {{4}}\n\nReserve a unit: {{5}}",
    "variables": [
      "Customer Name",
      "Project Name",
      "Drop %",
      "New Price",
      "Reserve URL"
    ],
    "tags": [
      "price-drop",
      "alert"
    ],
    "status": "approved",
    "downloads": 9358,
    "example": "Hi Alex, prices for *Alex* are down by 20% this week.\n\nNew price: $129.00\n\nReserve a unit: bright.co/go",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 114,
    "name": "New Project Launch",
    "category": "Marketing",
    "industry": "Real Estate",
    "metaCategory": "MARKETING",
    "icon": "Sparkles",
    "description": "Pre-launch announcement for HNI buyers",
    "body": "Exclusive pre-launch invite, {{1}}.\n\n*{{2}}* by {{3}} — only {{4}} units in this phase.\n\nEOI link: {{5}}",
    "variables": [
      "Customer Name",
      "Project Name",
      "Developer",
      "Units",
      "EOI URL"
    ],
    "tags": [
      "prelaunch",
      "exclusive"
    ],
    "status": "approved",
    "downloads": 2617,
    "example": "Exclusive pre-launch invite, Alex.\n\n*Alex* by Sample — only Sample units in this phase.\n\nEOI link: bright.co/go",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 115,
    "name": "Loan Assistance",
    "category": "Marketing",
    "industry": "Real Estate",
    "metaCategory": "MARKETING",
    "icon": "Wallet",
    "description": "Offer home-loan assistance on a property",
    "body": "Hi {{1}}, get pre-approved home loans for *{{2}}* starting at {{3}}% p.a.\n\nCheck eligibility in 2 mins: {{4}}",
    "variables": [
      "Customer Name",
      "Project Name",
      "Interest Rate",
      "Eligibility URL"
    ],
    "tags": [
      "loan",
      "finance"
    ],
    "status": "approved",
    "downloads": 7584,
    "example": "Hi Alex, get pre-approved home loans for *Alex* starting at Sample% p.a.\n\nCheck eligibility in 2 mins: bright.co/go",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 116,
    "name": "Open House Invite",
    "category": "Marketing",
    "industry": "Real Estate",
    "metaCategory": "MARKETING",
    "icon": "DoorOpen",
    "description": "Invite leads to an open-house weekend",
    "body": "Hi {{1}}, you're invited to our Open House for *{{2}}* on {{3}}.\n\nTime: {{4}}\nAddress: {{5}}\n\nRSVP: {{6}}",
    "variables": [
      "Customer Name",
      "Property",
      "Date",
      "Time",
      "Address",
      "RSVP URL"
    ],
    "tags": [
      "openhouse",
      "invite"
    ],
    "status": "approved",
    "downloads": 1192,
    "example": "Hi Alex, you're invited to our Open House for *Sample* on Mon, 18 Aug.\n\nTime: 6:30 PM\nAddress: 221B Baker Street\n\nRSVP: bright.co/rsvp",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 117,
    "name": "New Batch Enrollment",
    "category": "Marketing",
    "industry": "Education",
    "metaCategory": "MARKETING",
    "icon": "GraduationCap",
    "description": "Open enrollment for a new course batch",
    "body": "Hi {{1}}, new batch for *{{2}}* starts {{3}}.\n\nDuration: {{4}} · Mode: {{5}}\n\nEnroll: {{6}}\n\nEarly-bird offer ends {{7}}.",
    "variables": [
      "Student Name",
      "Course",
      "Start Date",
      "Duration",
      "Mode",
      "Enroll URL",
      "Offer Deadline"
    ],
    "tags": [
      "enrollment",
      "course"
    ],
    "status": "approved",
    "downloads": 2869,
    "example": "Hi Alex, new batch for *Spoken English* starts Mon, 18 Aug.\n\nDuration: Sample · Mode: Sample\n\nEnroll: bright.co/go\n\nEarly-bird offer ends 30% off.",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 118,
    "name": "Webinar Invite",
    "category": "Marketing",
    "industry": "Education",
    "metaCategory": "MARKETING",
    "icon": "Video",
    "description": "Invite leads to a free webinar",
    "body": "Hi {{1}}, join our free webinar on *{{2}}*.\n\n📅 {{3}} at {{4}}\nSpeaker: {{5}}\n\nRegister: {{6}}",
    "variables": [
      "Customer Name",
      "Webinar Topic",
      "Date",
      "Time",
      "Speaker",
      "Register URL"
    ],
    "tags": [
      "webinar",
      "free",
      "invite"
    ],
    "status": "approved",
    "downloads": 3150,
    "example": "Hi Alex, join our free webinar on *Sample*.\n\n📅 Mon, 18 Aug at 6:30 PM\nSpeaker: Sample\n\nRegister: bright.co/go",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 119,
    "name": "Free Demo Class",
    "category": "Marketing",
    "industry": "Education",
    "metaCategory": "MARKETING",
    "icon": "Play",
    "description": "Offer a free trial class",
    "body": "Hi {{1}}, attend a free demo class for *{{2}}* this {{3}}.\n\nBook your slot: {{4}}",
    "variables": [
      "Student Name",
      "Course",
      "Day",
      "Booking URL"
    ],
    "tags": [
      "demo",
      "free",
      "class"
    ],
    "status": "approved",
    "downloads": 5453,
    "example": "Hi Alex, attend a free demo class for *Spoken English* this Sample.\n\nBook your slot: bright.co/book",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 120,
    "name": "Course Launch",
    "category": "Marketing",
    "industry": "Education",
    "metaCategory": "MARKETING",
    "icon": "BookOpen",
    "description": "Launch a new course or program",
    "body": "Hi {{1}}, our new program *{{2}}* is now live 🎓\n\nIncludes {{3}} live sessions + lifetime access.\n\nFee: {{4}} (early-bird {{5}}% off)\n\nEnroll: {{6}}",
    "variables": [
      "Student Name",
      "Program",
      "Sessions",
      "Fee",
      "Discount %",
      "Enroll URL"
    ],
    "tags": [
      "launch",
      "program"
    ],
    "status": "approved",
    "downloads": 6541,
    "example": "Hi Alex, our new program *MBA 2026* is now live 🎓\n\nIncludes Sample live sessions + lifetime access.\n\nFee: $99.00 (early-bird 30% off)\n\nEnroll: bright.co/go",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 121,
    "name": "Student Reminder",
    "category": "Marketing",
    "industry": "Education",
    "metaCategory": "MARKETING",
    "icon": "Bell",
    "description": "Re-engage students who paused learning",
    "body": "Hi {{1}}, you're {{2}}% through *{{3}}*. Pick up where you left off 💪\n\nContinue: {{4}}",
    "variables": [
      "Student Name",
      "Progress %",
      "Course",
      "Resume URL"
    ],
    "tags": [
      "reminder",
      "engagement"
    ],
    "status": "approved",
    "downloads": 3500,
    "example": "Hi Alex, you're 20% through *Spoken English*. Pick up where you left off 💪\n\nContinue: bright.co/go",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 122,
    "name": "Exam Preparation",
    "category": "Marketing",
    "industry": "Education",
    "metaCategory": "MARKETING",
    "icon": "BookOpen",
    "description": "Promote a crash course or exam prep batch",
    "body": "Hi {{1}}, *{{2}}* crash course starts {{3}}.\n\n{{4}} hours of focused prep with mock tests.\n\nEnroll: {{5}}",
    "variables": [
      "Student Name",
      "Exam",
      "Start Date",
      "Hours",
      "Enroll URL"
    ],
    "tags": [
      "exam",
      "prep"
    ],
    "status": "approved",
    "downloads": 8302,
    "example": "Hi Alex, *Sample* crash course starts Mon, 18 Aug.\n\n4 hours of focused prep with mock tests.\n\nEnroll: bright.co/go",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 123,
    "name": "Health Package Promo",
    "category": "Marketing",
    "industry": "Healthcare",
    "metaCategory": "MARKETING",
    "icon": "HeartPulse",
    "description": "Promote preventive health checkup packages",
    "body": "Hi {{1}}, our *{{2}}* health package is now at {{3}} (was {{4}}).\n\nIncludes {{5}} tests + free consultation.\n\nBook: {{6}}",
    "variables": [
      "Patient Name",
      "Package",
      "New Price",
      "Old Price",
      "Tests",
      "Booking URL"
    ],
    "tags": [
      "health",
      "package",
      "checkup"
    ],
    "status": "approved",
    "downloads": 8194,
    "example": "Hi Alex, our *Sample* health package is now at $129.00 (was $129.00).\n\nIncludes Sample tests + free consultation.\n\nBook: bright.co/book",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 124,
    "name": "Free Consultation",
    "category": "Marketing",
    "industry": "Healthcare",
    "metaCategory": "MARKETING",
    "icon": "Stethoscope",
    "description": "Offer a free first consultation",
    "body": "Hi {{1}}, book a *free* consultation with Dr. {{2}} ({{3}}) this week.\n\nSlots: {{4}}",
    "variables": [
      "Patient Name",
      "Doctor",
      "Specialty",
      "Booking URL"
    ],
    "tags": [
      "consultation",
      "free"
    ],
    "status": "approved",
    "downloads": 9079,
    "example": "Hi Alex, book a *free* consultation with Dr. Dr. Kim (Sample) this week.\n\nSlots: bright.co/book",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 125,
    "name": "Vaccination Camp",
    "category": "Marketing",
    "industry": "Healthcare",
    "metaCategory": "MARKETING",
    "icon": "Syringe",
    "description": "Promote vaccination drive",
    "body": "Hi {{1}}, a {{2}} vaccination camp is open on {{3}} at {{4}}.\n\nFee: {{5}}. Register: {{6}}",
    "variables": [
      "Patient Name",
      "Vaccine",
      "Date",
      "Venue",
      "Fee",
      "Register URL"
    ],
    "tags": [
      "vaccination",
      "camp"
    ],
    "status": "approved",
    "downloads": 8615,
    "example": "Hi Alex, a Sample vaccination camp is open on Mon, 18 Aug at Hilton, 5th Ave.\n\nFee: $99.00. Register: bright.co/go",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 126,
    "name": "Doctor Availability",
    "category": "Marketing",
    "industry": "Healthcare",
    "metaCategory": "MARKETING",
    "icon": "UserCheck",
    "description": "Inform patients of new doctor availability",
    "body": "Hi {{1}}, Dr. {{2}} ({{3}}) is now consulting at {{4}}.\n\nBook an appointment: {{5}}",
    "variables": [
      "Patient Name",
      "Doctor",
      "Specialty",
      "Clinic",
      "Booking URL"
    ],
    "tags": [
      "doctor",
      "availability"
    ],
    "status": "approved",
    "downloads": 9223,
    "example": "Hi Alex, Dr. Dr. Kim (Sample) is now consulting at CareWell Clinic.\n\nBook an appointment: bright.co/book",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 127,
    "name": "Wellness Campaign",
    "category": "Marketing",
    "industry": "Healthcare",
    "metaCategory": "MARKETING",
    "icon": "Activity",
    "description": "Promote a wellness or fitness campaign",
    "body": "Hi {{1}} 🌿\n\nJoin our *{{2}}* wellness program — {{3}} weeks, expert-led.\n\nEarly bird: {{4}}\n\nJoin: {{5}}",
    "variables": [
      "Customer Name",
      "Program",
      "Weeks",
      "Price",
      "Join URL"
    ],
    "tags": [
      "wellness",
      "campaign"
    ],
    "status": "approved",
    "downloads": 2670,
    "example": "Hi Alex 🌿\n\nJoin our *MBA 2026* wellness program — Sample weeks, expert-led.\n\nEarly bird: $129.00\n\nJoin: bright.co/go",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 128,
    "name": "Holiday Package",
    "category": "Marketing",
    "industry": "Travel",
    "metaCategory": "MARKETING",
    "icon": "Plane",
    "description": "Promote a curated holiday package",
    "body": "Hi {{1}} ✈️\n\n*{{2}}* in {{3}} from {{4}} per person.\n\nIncludes: {{5}}\n\nBook by {{6}}: {{7}}",
    "variables": [
      "Customer Name",
      "Package Name",
      "Destination",
      "Price",
      "Inclusions",
      "Deadline",
      "Booking URL"
    ],
    "tags": [
      "holiday",
      "package",
      "travel"
    ],
    "status": "approved",
    "downloads": 5795,
    "example": "Hi Alex ✈️\n\n*Alex* in Sample from $129.00 per person.\n\nIncludes: Sample\n\nBook by Sample: bright.co/book",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 129,
    "name": "Flight Deals",
    "category": "Marketing",
    "industry": "Travel",
    "metaCategory": "MARKETING",
    "icon": "PlaneTakeoff",
    "description": "Share flash flight deals on a route",
    "body": "✈️ {{1}} → {{2}} from {{3}}!\n\nTravel: {{4}}\n\nBook: {{5}}",
    "variables": [
      "Origin",
      "Destination",
      "Price",
      "Travel Window",
      "Book URL"
    ],
    "tags": [
      "flight",
      "deal"
    ],
    "status": "approved",
    "downloads": 6200,
    "example": "✈️ Sample → Sample from $129.00!\n\nTravel: Sample\n\nBook: bright.co/go",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 130,
    "name": "Visa Assistance",
    "category": "Marketing",
    "industry": "Travel",
    "metaCategory": "MARKETING",
    "icon": "FileCheck",
    "description": "Promote visa services for a destination",
    "body": "Hi {{1}}, planning to visit {{2}}? Our visa team can help — {{3}}% approval rate.\n\nFree eligibility check: {{4}}",
    "variables": [
      "Customer Name",
      "Country",
      "Approval %",
      "Eligibility URL"
    ],
    "tags": [
      "visa",
      "travel"
    ],
    "status": "approved",
    "downloads": 4467,
    "example": "Hi Alex, planning to visit 3? Our visa team can help — 20% approval rate.\n\nFree eligibility check: bright.co/go",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 131,
    "name": "Honeymoon Offer",
    "category": "Marketing",
    "industry": "Travel",
    "metaCategory": "MARKETING",
    "icon": "Heart",
    "description": "Promote curated honeymoon packages",
    "body": "Hi {{1}} 💕\n\nCurated honeymoon in *{{2}}* — {{3}} nights, from {{4}} per couple.\n\nView itinerary: {{5}}",
    "variables": [
      "Customer Name",
      "Destination",
      "Nights",
      "Price",
      "Itinerary URL"
    ],
    "tags": [
      "honeymoon",
      "romance"
    ],
    "status": "approved",
    "downloads": 5053,
    "example": "Hi Alex 💕\n\nCurated honeymoon in *Sample* — Sample nights, from $129.00 per couple.\n\nView itinerary: bright.co/go",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 132,
    "name": "Seasonal Travel Campaign",
    "category": "Marketing",
    "industry": "Travel",
    "metaCategory": "MARKETING",
    "icon": "Sun",
    "description": "Seasonal escape promotions",
    "body": "Hi {{1}}, escape the {{2}} season — {{3}} packages from {{4}}.\n\nLimited slots, book: {{5}}",
    "variables": [
      "Customer Name",
      "Season",
      "Destination",
      "Price",
      "Booking URL"
    ],
    "tags": [
      "seasonal",
      "travel"
    ],
    "status": "approved",
    "downloads": 5220,
    "example": "Hi Alex, escape the Sample season — Sample packages from $129.00.\n\nLimited slots, book: bright.co/book",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 133,
    "name": "Weekend Offer",
    "category": "Marketing",
    "industry": "Restaurants & Food",
    "metaCategory": "MARKETING",
    "icon": "UtensilsCrossed",
    "description": "Promote a weekend dining offer",
    "body": "Hi {{1}} 🍽️\n\nThis weekend at {{2}} — {{3}} on all mains.\n\nReserve: {{4}}",
    "variables": [
      "Customer Name",
      "Restaurant",
      "Offer",
      "Reserve URL"
    ],
    "tags": [
      "weekend",
      "offer",
      "dining"
    ],
    "status": "approved",
    "downloads": 8679,
    "example": "Hi Alex 🍽️\n\nThis weekend at Olive & Oak — 30% off on all mains.\n\nReserve: bright.co/go",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 134,
    "name": "Combo Meal",
    "category": "Marketing",
    "industry": "Restaurants & Food",
    "metaCategory": "MARKETING",
    "icon": "Utensils",
    "description": "Promote a value combo meal",
    "body": "Hi {{1}}, try our new {{2}} combo for {{3}} 🤤\n\nOrder now: {{4}}",
    "variables": [
      "Customer Name",
      "Combo Name",
      "Price",
      "Order URL"
    ],
    "tags": [
      "combo",
      "meal"
    ],
    "status": "approved",
    "downloads": 7818,
    "example": "Hi Alex, try our new Alex combo for $129.00 🤤\n\nOrder now: #10248",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 135,
    "name": "Table Booking",
    "category": "Marketing",
    "industry": "Restaurants & Food",
    "metaCategory": "MARKETING",
    "icon": "CalendarCheck",
    "description": "Encourage advance table reservations",
    "body": "Hi {{1}}, secure your table at *{{2}}* this {{3}}.\n\nReserve: {{4}}",
    "variables": [
      "Customer Name",
      "Restaurant",
      "Day",
      "Reserve URL"
    ],
    "tags": [
      "booking",
      "table"
    ],
    "status": "approved",
    "downloads": 5961,
    "example": "Hi Alex, secure your table at *Olive & Oak* this Sample.\n\nReserve: bright.co/go",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 136,
    "name": "Festival Food Deals",
    "category": "Marketing",
    "industry": "Restaurants & Food",
    "metaCategory": "MARKETING",
    "icon": "Sparkles",
    "description": "Festive special menu announcement",
    "body": "🎉 {{1}} Special Menu!\n\nHi {{2}}, our festive menu is live — try {{3}} signature dishes.\n\nOrder/reserve: {{4}}",
    "variables": [
      "Festival",
      "Customer Name",
      "Dish Count",
      "URL"
    ],
    "tags": [
      "festival",
      "menu"
    ],
    "status": "approved",
    "downloads": 4918,
    "example": "🎉 Sample Special Menu!\n\nHi Alex, our festive menu is live — try 3 signature dishes.\n\nOrder/reserve: bright.co/go",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 137,
    "name": "Free Delivery Campaign",
    "category": "Marketing",
    "industry": "Restaurants & Food",
    "metaCategory": "MARKETING",
    "icon": "Bike",
    "description": "Free delivery promotion",
    "body": "Hi {{1}} 🛵 Free delivery on orders above {{2}} this week.\n\nUse code: *{{3}}*\n\nOrder: {{4}}",
    "variables": [
      "Customer Name",
      "Min Order",
      "Promo Code",
      "Order URL"
    ],
    "tags": [
      "delivery",
      "free"
    ],
    "status": "approved",
    "downloads": 8815,
    "example": "Hi Alex 🛵 Free delivery on orders above $50 this week.\n\nUse code: *SAVE30*\n\nOrder: #10248",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 138,
    "name": "Appointment Offer",
    "category": "Marketing",
    "industry": "Beauty & Salon",
    "metaCategory": "MARKETING",
    "icon": "Scissors",
    "description": "Promote discounted salon appointments",
    "body": "Hi {{1}} 💇\n\nFlat {{2}}% off on {{3}} this week at {{4}}.\n\nBook: {{5}}",
    "variables": [
      "Customer Name",
      "Discount %",
      "Service",
      "Salon",
      "Booking URL"
    ],
    "tags": [
      "salon",
      "offer"
    ],
    "status": "approved",
    "downloads": 5136,
    "example": "Hi Alex 💇\n\nFlat 30% off on Premium Plan this week at Sample.\n\nBook: bright.co/book",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 139,
    "name": "Bridal Package",
    "category": "Marketing",
    "industry": "Beauty & Salon",
    "metaCategory": "MARKETING",
    "icon": "Crown",
    "description": "Promote bridal beauty packages",
    "body": "Hi {{1}} 👰\n\nOur Bridal Glow package — {{2}} sessions, {{3}}.\n\nIncludes: {{4}}\n\nConsult: {{5}}",
    "variables": [
      "Customer Name",
      "Sessions",
      "Price",
      "Inclusions",
      "Consult URL"
    ],
    "tags": [
      "bridal",
      "package"
    ],
    "status": "approved",
    "downloads": 6377,
    "example": "Hi Alex 👰\n\nOur Bridal Glow package — Sample sessions, $129.00.\n\nIncludes: Sample\n\nConsult: bright.co/go",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 140,
    "name": "Membership Promotion",
    "category": "Marketing",
    "industry": "Beauty & Salon",
    "metaCategory": "MARKETING",
    "icon": "Star",
    "description": "Offer a beauty membership plan",
    "body": "Hi {{1}}, join our {{2}} membership — {{3}} services/month at {{4}}.\n\nDetails: {{5}}",
    "variables": [
      "Customer Name",
      "Plan",
      "Services",
      "Price",
      "Details URL"
    ],
    "tags": [
      "membership",
      "plan"
    ],
    "status": "approved",
    "downloads": 2172,
    "example": "Hi Alex, join our Pro Monthly membership — Premium Plan services/month at $129.00.\n\nDetails: 25 minutes",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 141,
    "name": "Festival Makeover",
    "category": "Marketing",
    "industry": "Beauty & Salon",
    "metaCategory": "MARKETING",
    "icon": "Sparkles",
    "description": "Festive makeover packages",
    "body": "✨ {{1}} Glow Up!\n\nHi {{2}}, book your festive makeover by {{3}} and save {{4}}%.\n\nReserve: {{5}}",
    "variables": [
      "Festival",
      "Customer Name",
      "Deadline",
      "Discount %",
      "Reserve URL"
    ],
    "tags": [
      "festival",
      "makeover"
    ],
    "status": "approved",
    "downloads": 2682,
    "example": "✨ Sample Glow Up!\n\nHi Alex, book your festive makeover by Sample and save 30%.\n\nReserve: bright.co/go",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 142,
    "name": "Free Demo Booking",
    "category": "Marketing",
    "industry": "SaaS & CRM",
    "metaCategory": "MARKETING",
    "icon": "Calendar",
    "description": "Invite leads to a product demo",
    "body": "Hi {{1}}, see how *{{2}}* can help {{3}} grow on WhatsApp.\n\nBook a 20-min demo: {{4}}",
    "variables": [
      "Lead Name",
      "Product",
      "Business Type",
      "Booking URL"
    ],
    "tags": [
      "demo",
      "saas"
    ],
    "status": "approved",
    "downloads": 5615,
    "example": "Hi Alex, see how *Aurora Sneakers* can help Sample grow on WhatsApp.\n\nBook a 20-min demo: bright.co/book",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 143,
    "name": "Upgrade Plan",
    "category": "Marketing",
    "industry": "SaaS & CRM",
    "metaCategory": "MARKETING",
    "icon": "TrendingUp",
    "description": "Encourage plan upgrade based on usage",
    "body": "Hi {{1}}, you've hit {{2}}% of your {{3}} plan limit.\n\nUpgrade to *{{4}}* for {{5}} and unlock {{6}}.\n\nUpgrade: {{7}}",
    "variables": [
      "Customer Name",
      "Usage %",
      "Current Plan",
      "New Plan",
      "Price",
      "Benefits",
      "Upgrade URL"
    ],
    "tags": [
      "upgrade",
      "plan"
    ],
    "status": "approved",
    "downloads": 2971,
    "example": "Hi Alex, you've hit 20% of your Pro Monthly plan limit.\n\nUpgrade to *Pro Monthly* for $129.00 and unlock Sample.\n\nUpgrade: bright.co/go",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 144,
    "name": "Free Trial Invite",
    "category": "Marketing",
    "industry": "SaaS & CRM",
    "metaCategory": "MARKETING",
    "icon": "Gift",
    "description": "Invite a lead to start a free trial",
    "body": "Hi {{1}}, try *{{2}}* free for {{3}} days — no card required.\n\nStart: {{4}}",
    "variables": [
      "Lead Name",
      "Product",
      "Days",
      "Signup URL"
    ],
    "tags": [
      "trial",
      "free"
    ],
    "status": "approved",
    "downloads": 6154,
    "example": "Hi Alex, try *Aurora Sneakers* free for 3 days — no card required.\n\nStart: bright.co/go",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 145,
    "name": "Webinar Campaign",
    "category": "Marketing",
    "industry": "SaaS & CRM",
    "metaCategory": "MARKETING",
    "icon": "Video",
    "description": "SaaS product webinar invite",
    "body": "Hi {{1}}, join our live session: *{{2}}* on {{3}} ({{4}}).\n\nSeats limited — register: {{5}}",
    "variables": [
      "Lead Name",
      "Topic",
      "Date",
      "Time",
      "Register URL"
    ],
    "tags": [
      "webinar",
      "saas"
    ],
    "status": "approved",
    "downloads": 1917,
    "example": "Hi Alex, join our live session: *Sample* on Mon, 18 Aug (6:30 PM).\n\nSeats limited — register: bright.co/go",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 146,
    "name": "Feature Launch",
    "category": "Marketing",
    "industry": "SaaS & CRM",
    "metaCategory": "MARKETING",
    "icon": "Sparkles",
    "description": "Announce a new product feature",
    "body": "Hi {{1}} 🎉\n\nWe just launched *{{2}}* — {{3}}.\n\nSee it in action: {{4}}",
    "variables": [
      "Customer Name",
      "Feature",
      "Benefit",
      "Demo URL"
    ],
    "tags": [
      "feature",
      "launch"
    ],
    "status": "approved",
    "downloads": 9215,
    "example": "Hi Alex 🎉\n\nWe just launched *AI Auto-Reply* — Sample.\n\nSee it in action: bright.co/go",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 147,
    "name": "Reactivate Inactive User",
    "category": "Marketing",
    "industry": "SaaS & CRM",
    "metaCategory": "MARKETING",
    "icon": "RefreshCw",
    "description": "Win back dormant users",
    "body": "Hi {{1}}, we miss you 👋\n\nWe've shipped {{2}} new features since you were last active.\n\nLog back in and get {{3}} on your next renewal: {{4}}",
    "variables": [
      "User Name",
      "Feature Count",
      "Discount",
      "Login URL"
    ],
    "tags": [
      "reactivation",
      "retention"
    ],
    "status": "approved",
    "downloads": 2654,
    "example": "Hi alex, we miss you 👋\n\nWe've shipped 3 new features since you were last active.\n\nLog back in and get 30 on your next renewal: bright.co/login",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 148,
    "name": "EMI Offer",
    "category": "Marketing",
    "industry": "Finance & Insurance",
    "metaCategory": "MARKETING",
    "icon": "CreditCard",
    "description": "Promote no-cost EMI offers",
    "body": "Hi {{1}}, shop now & pay later — *No-cost EMI* up to {{2}} months on orders above {{3}}.\n\nApply: {{4}}",
    "variables": [
      "Customer Name",
      "Months",
      "Min Order",
      "Apply URL"
    ],
    "tags": [
      "emi",
      "finance"
    ],
    "status": "approved",
    "downloads": 1999,
    "example": "Hi Alex, shop now & pay later — *No-cost EMI* up to Sample months on orders above $50.\n\nApply: bright.co/go",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 149,
    "name": "Policy Renewal",
    "category": "Marketing",
    "industry": "Finance & Insurance",
    "metaCategory": "MARKETING",
    "icon": "ShieldCheck",
    "description": "Insurance policy renewal nudge",
    "body": "Hi {{1}}, your {{2}} policy ({{3}}) expires on {{4}}.\n\nRenew in 2 mins: {{5}}",
    "variables": [
      "Customer Name",
      "Policy Type",
      "Policy No",
      "Expiry Date",
      "Renew URL"
    ],
    "tags": [
      "insurance",
      "renewal"
    ],
    "status": "approved",
    "downloads": 2502,
    "example": "Hi Alex, your Sample policy (Sample) expires on Dec 31, 2026.\n\nRenew in 2 mins: bright.co/renew",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 150,
    "name": "Investment Plan",
    "category": "Marketing",
    "industry": "Finance & Insurance",
    "metaCategory": "MARKETING",
    "icon": "TrendingUp",
    "description": "Promote investment / SIP plans",
    "body": "Hi {{1}}, start a SIP from just {{2}}/month with expected returns of {{3}}% p.a.\n\nExplore: {{4}}",
    "variables": [
      "Customer Name",
      "Min Amount",
      "Returns %",
      "Explore URL"
    ],
    "tags": [
      "investment",
      "sip"
    ],
    "status": "approved",
    "downloads": 7673,
    "example": "Hi Alex, start a SIP from just $129.00/month with expected returns of 20% p.a.\n\nExplore: bright.co/go",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 151,
    "name": "Credit Card Offer",
    "category": "Marketing",
    "industry": "Finance & Insurance",
    "metaCategory": "MARKETING",
    "icon": "CreditCard",
    "description": "Pre-approved credit-card offer",
    "body": "Hi {{1}}, you're pre-approved for the *{{2}}* card 🎉\n\nLifetime free · {{3}} welcome benefits.\n\nApply: {{4}}",
    "variables": [
      "Customer Name",
      "Card Name",
      "Benefits",
      "Apply URL"
    ],
    "tags": [
      "credit-card",
      "offer"
    ],
    "status": "approved",
    "downloads": 6157,
    "example": "Hi Alex, you're pre-approved for the *Alex* card 🎉\n\nLifetime free · Sample welcome benefits.\n\nApply: bright.co/go",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 152,
    "name": "Test Drive Booking",
    "category": "Marketing",
    "industry": "Automobile",
    "metaCategory": "MARKETING",
    "icon": "Car",
    "description": "Invite leads to a test drive",
    "body": "Hi {{1}} 🚗\n\nBook a free test drive for the new *{{2}}* at {{3}}.\n\nPick a slot: {{4}}",
    "variables": [
      "Customer Name",
      "Model",
      "Dealership",
      "Booking URL"
    ],
    "tags": [
      "test-drive",
      "auto"
    ],
    "status": "approved",
    "downloads": 5222,
    "example": "Hi Alex 🚗\n\nBook a free test drive for the new *Sample* at Sample.\n\nPick a slot: bright.co/book",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 153,
    "name": "Service Reminder",
    "category": "Marketing",
    "industry": "Automobile",
    "metaCategory": "MARKETING",
    "icon": "Wrench",
    "description": "Remind customers for vehicle service",
    "body": "Hi {{1}}, your *{{2}}* ({{3}}) is due for service.\n\nBook a slot at {{4}}: {{5}}",
    "variables": [
      "Customer Name",
      "Vehicle",
      "Reg No",
      "Service Center",
      "Booking URL"
    ],
    "tags": [
      "service",
      "reminder"
    ],
    "status": "approved",
    "downloads": 5886,
    "example": "Hi Alex, your *White Toyota - ABC 482* (Sample) is due for service.\n\nBook a slot at Premium Plan: bright.co/book",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 154,
    "name": "New Car Launch",
    "category": "Marketing",
    "industry": "Automobile",
    "metaCategory": "MARKETING",
    "icon": "Sparkles",
    "description": "Announce a new vehicle launch",
    "body": "Hi {{1}} 🎉\n\nThe all-new *{{2}}* is here — starting {{3}}.\n\nBook a test drive: {{4}}",
    "variables": [
      "Customer Name",
      "Model",
      "Starting Price",
      "Booking URL"
    ],
    "tags": [
      "launch",
      "auto"
    ],
    "status": "approved",
    "downloads": 6633,
    "example": "Hi Alex 🎉\n\nThe all-new *Sample* is here — starting $129.00.\n\nBook a test drive: bright.co/book",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 155,
    "name": "Exchange Offer",
    "category": "Marketing",
    "industry": "Automobile",
    "metaCategory": "MARKETING",
    "icon": "RefreshCw",
    "description": "Vehicle exchange / trade-in offer",
    "body": "Hi {{1}}, upgrade your ride 🚘\n\nGet up to {{2}} extra exchange bonus on your old *{{3}}*.\n\nValuate now: {{4}}",
    "variables": [
      "Customer Name",
      "Bonus",
      "Vehicle",
      "Valuation URL"
    ],
    "tags": [
      "exchange",
      "auto"
    ],
    "status": "approved",
    "downloads": 2167,
    "example": "Hi Alex, upgrade your ride 🚘\n\nGet up to Sample extra exchange bonus on your old *White Toyota - ABC 482*.\n\nValuate now: bright.co/go",
    "useCase": "Send to opted-in customers to drive engagement, sales or awareness."
  },
  {
    "id": 201,
    "name": "OTP Verification",
    "category": "Authentication",
    "industry": "Authentication",
    "metaCategory": "AUTHENTICATION",
    "icon": "KeyRound",
    "description": "One-time password verification",
    "body": "{{1}} is your verification code. Do not share this code with anyone. It expires in {{2}} minutes.",
    "variables": [
      "OTP",
      "Minutes"
    ],
    "tags": [
      "otp",
      "auth"
    ],
    "status": "approved",
    "downloads": 24500,
    "example": "482913 is your verification code. Do not share this code with anyone. It expires in 15 minutes.",
    "useCase": "Send one-time codes for sign-in or verification flows."
  },
  {
    "id": 202,
    "name": "Login Verification",
    "category": "Authentication",
    "industry": "Authentication",
    "metaCategory": "AUTHENTICATION",
    "icon": "Lock",
    "description": "Verify a login attempt",
    "body": "Hi {{1}}, use code *{{2}}* to log in to {{3}}. The code expires in {{4}} minutes. Never share it.",
    "variables": [
      "Customer Name",
      "OTP",
      "App Name",
      "Minutes"
    ],
    "tags": [
      "login",
      "verification"
    ],
    "status": "approved",
    "downloads": 1005,
    "example": "Hi Alex, use code *482913* to log in to Alex. The code expires in 15 minutes. Never share it.",
    "useCase": "Send one-time codes for sign-in or verification flows."
  },
  {
    "id": 203,
    "name": "Password Reset",
    "category": "Authentication",
    "industry": "Authentication",
    "metaCategory": "AUTHENTICATION",
    "icon": "RefreshCw",
    "description": "Send a password-reset code",
    "body": "Hi {{1}}, your password reset code is *{{2}}*. It expires in {{3}} minutes.",
    "variables": [
      "Customer Name",
      "OTP",
      "Minutes"
    ],
    "tags": [
      "password",
      "reset"
    ],
    "status": "approved",
    "downloads": 3590,
    "example": "Hi Alex, your password reset code is *482913*. It expires in 15 minutes.",
    "useCase": "Send one-time codes for sign-in or verification flows."
  },
  {
    "id": 204,
    "name": "Secure Login Alert",
    "category": "Authentication",
    "industry": "Authentication",
    "metaCategory": "UTILITY",
    "icon": "ShieldAlert",
    "description": "Notify on new device login",
    "body": "Hi {{1}}, a new login to your account was detected from {{2}} on {{3}}.\n\nIf this wasn't you, secure your account: {{4}}",
    "variables": [
      "Customer Name",
      "Device/Location",
      "Time",
      "Secure URL"
    ],
    "tags": [
      "security",
      "alert"
    ],
    "status": "approved",
    "downloads": 4868,
    "example": "Hi Alex, a new login to your account was detected from Downtown Store on 6:30 PM.\n\nIf this wasn't you, secure your account: bright.co/go",
    "useCase": "Send transactional updates that customers are expecting (orders, bookings, accounts)."
  },
  {
    "id": 205,
    "name": "Order Confirmation",
    "category": "Notifications",
    "industry": "E-commerce",
    "metaCategory": "UTILITY",
    "icon": "Package",
    "description": "Confirm a customer order",
    "body": "Hi {{1}}, your order #{{2}} for {{3}} is confirmed.\n\nEstimated delivery: {{4}}\n\nTrack: {{5}}",
    "variables": [
      "Customer Name",
      "Order ID",
      "Amount",
      "Delivery Date",
      "Track URL"
    ],
    "tags": [
      "order",
      "confirmation"
    ],
    "status": "approved",
    "downloads": 6565,
    "example": "Hi Alex, your order ##10248 for $129.00 is confirmed.\n\nEstimated delivery: Wed, 20 Aug\n\nTrack: bright.co/go",
    "useCase": "Send transactional updates that customers are expecting (orders, bookings, accounts)."
  },
  {
    "id": 206,
    "name": "Shipping Update",
    "category": "Notifications",
    "industry": "E-commerce",
    "metaCategory": "UTILITY",
    "icon": "Truck",
    "description": "Share shipping details",
    "body": "Hi {{1}}, your order #{{2}} has been shipped via {{3}}.\n\nTracking: {{4}}\nETA: {{5}}",
    "variables": [
      "Customer Name",
      "Order ID",
      "Carrier",
      "Tracking No",
      "ETA"
    ],
    "tags": [
      "shipping",
      "tracking"
    ],
    "status": "approved",
    "downloads": 3556,
    "example": "Hi Alex, your order ##10248 has been shipped via Sample.\n\nTracking: Sample\nETA: 25 minutes",
    "useCase": "Send transactional updates that customers are expecting (orders, bookings, accounts)."
  },
  {
    "id": 207,
    "name": "Out for Delivery",
    "category": "Notifications",
    "industry": "Logistics",
    "metaCategory": "UTILITY",
    "icon": "Navigation",
    "description": "Order is out for delivery",
    "body": "Hi {{1}} 🚚 Your order #{{2}} is out for delivery.\n\nDelivery partner: {{3}} ({{4}})\nETA: {{5}}",
    "variables": [
      "Customer Name",
      "Order ID",
      "Partner",
      "Phone",
      "ETA"
    ],
    "tags": [
      "delivery",
      "out-for-delivery"
    ],
    "status": "approved",
    "downloads": 1080,
    "example": "Hi Alex 🚚 Your order ##10248 is out for delivery.\n\nDelivery partner: Sample (+1 555 010 4421)\nETA: 25 minutes",
    "useCase": "Send transactional updates that customers are expecting (orders, bookings, accounts)."
  },
  {
    "id": 208,
    "name": "Delivered Confirmation",
    "category": "Notifications",
    "industry": "E-commerce",
    "metaCategory": "UTILITY",
    "icon": "CheckCircle2",
    "description": "Confirm successful delivery",
    "body": "Hi {{1}}, your order #{{2}} was delivered on {{3}}.\n\nLove it? Rate us: {{4}}",
    "variables": [
      "Customer Name",
      "Order ID",
      "Time",
      "Feedback URL"
    ],
    "tags": [
      "delivered",
      "feedback"
    ],
    "status": "approved",
    "downloads": 9323,
    "example": "Hi Alex, your order ##10248 was delivered on 6:30 PM.\n\nLove it? Rate us: bright.co/feedback",
    "useCase": "Send transactional updates that customers are expecting (orders, bookings, accounts)."
  },
  {
    "id": 209,
    "name": "Return Confirmation",
    "category": "Notifications",
    "industry": "E-commerce",
    "metaCategory": "UTILITY",
    "icon": "RefreshCw",
    "description": "Confirm a return request",
    "body": "Hi {{1}}, your return for order #{{2}} ({{3}}) has been initiated.\n\nPickup: {{4}}\nRefund of {{5}} will be processed in {{6}} days.",
    "variables": [
      "Customer Name",
      "Order ID",
      "Items",
      "Pickup Date",
      "Refund Amount",
      "Days"
    ],
    "tags": [
      "return",
      "refund"
    ],
    "status": "approved",
    "downloads": 2217,
    "example": "Hi Alex, your return for order ##10248 (Aurora Sneakers (x1)) has been initiated.\n\nPickup: Wed, 20 Aug\nRefund of $45.00 will be processed in 3 days.",
    "useCase": "Send transactional updates that customers are expecting (orders, bookings, accounts)."
  },
  {
    "id": 210,
    "name": "Appointment Reminder",
    "category": "Appointments",
    "industry": "Healthcare",
    "metaCategory": "UTILITY",
    "icon": "Bell",
    "description": "Remind about an upcoming appointment",
    "body": "Hi {{1}}, reminder for your appointment with {{2}} on {{3}} at {{4}}.\n\nLocation: {{5}}\n\nReschedule: {{6}}",
    "variables": [
      "Customer Name",
      "Provider",
      "Date",
      "Time",
      "Location",
      "Reschedule URL"
    ],
    "tags": [
      "appointment",
      "reminder"
    ],
    "status": "approved",
    "downloads": 2164,
    "example": "Hi Alex, reminder for your appointment with X-1001 on Mon, 18 Aug at 6:30 PM.\n\nLocation: Downtown Store\n\nReschedule: bright.co/reschedule",
    "useCase": "Send transactional updates that customers are expecting (orders, bookings, accounts)."
  },
  {
    "id": 211,
    "name": "Booking Confirmation",
    "category": "Appointments",
    "industry": "Travel",
    "metaCategory": "UTILITY",
    "icon": "CalendarCheck",
    "description": "Confirm a booking",
    "body": "Hi {{1}}, your booking *{{2}}* is confirmed.\n\nReference: {{3}}\nDate: {{4}}\nDetails: {{5}}",
    "variables": [
      "Customer Name",
      "Booking Name",
      "Reference",
      "Date",
      "Details URL"
    ],
    "tags": [
      "booking",
      "confirmation"
    ],
    "status": "approved",
    "downloads": 6350,
    "example": "Hi Alex, your booking *Alex* is confirmed.\n\nReference: REF-9921\nDate: Mon, 18 Aug\nDetails: 25 minutes",
    "useCase": "Send transactional updates that customers are expecting (orders, bookings, accounts)."
  },
  {
    "id": 212,
    "name": "Meeting Reminder",
    "category": "Appointments",
    "industry": "SaaS & CRM",
    "metaCategory": "UTILITY",
    "icon": "Video",
    "description": "Remind a customer about a meeting",
    "body": "Hi {{1}}, reminder for our meeting *{{2}}* on {{3}} at {{4}}.\n\nJoin: {{5}}",
    "variables": [
      "Customer Name",
      "Meeting Title",
      "Date",
      "Time",
      "Join URL"
    ],
    "tags": [
      "meeting",
      "reminder"
    ],
    "status": "approved",
    "downloads": 8791,
    "example": "Hi Alex, reminder for our meeting *Sample* on Mon, 18 Aug at 6:30 PM.\n\nJoin: bright.co/go",
    "useCase": "Send transactional updates that customers are expecting (orders, bookings, accounts)."
  },
  {
    "id": 213,
    "name": "Reschedule Notification",
    "category": "Appointments",
    "industry": "Healthcare",
    "metaCategory": "UTILITY",
    "icon": "Clock",
    "description": "Notify of a rescheduled appointment",
    "body": "Hi {{1}}, your appointment with {{2}} has been rescheduled to {{3}} at {{4}}.\n\nReply *YES* to confirm or pick another slot: {{5}}",
    "variables": [
      "Customer Name",
      "Provider",
      "New Date",
      "New Time",
      "Reschedule URL"
    ],
    "tags": [
      "reschedule",
      "appointment"
    ],
    "status": "approved",
    "downloads": 2644,
    "example": "Hi Alex, your appointment with X-1001 has been rescheduled to Mon, 18 Aug at 6:30 PM.\n\nReply *YES* to confirm or pick another slot: bright.co/reschedule",
    "useCase": "Send transactional updates that customers are expecting (orders, bookings, accounts)."
  },
  {
    "id": 214,
    "name": "Payment Received",
    "category": "Payments",
    "industry": "E-commerce",
    "metaCategory": "UTILITY",
    "icon": "CheckCircle2",
    "description": "Acknowledge a successful payment",
    "body": "Hi {{1}}, we've received your payment of {{2}} for {{3}}.\n\nTransaction ID: {{4}}\nReceipt: {{5}}",
    "variables": [
      "Customer Name",
      "Amount",
      "Reason",
      "Txn ID",
      "Receipt URL"
    ],
    "tags": [
      "payment",
      "received"
    ],
    "status": "approved",
    "downloads": 4960,
    "example": "Hi Alex, we've received your payment of $129.00 for incomplete documents.\n\nTransaction ID: X-1003\nReceipt: bright.co/go",
    "useCase": "Send transactional updates that customers are expecting (orders, bookings, accounts)."
  },
  {
    "id": 215,
    "name": "Invoice Generated",
    "category": "Payments",
    "industry": "SaaS & CRM",
    "metaCategory": "UTILITY",
    "icon": "FileText",
    "description": "Send a new invoice",
    "body": "Hi {{1}}, invoice #{{2}} for {{3}} is ready.\n\nDue: {{4}}\nPay: {{5}}",
    "variables": [
      "Customer Name",
      "Invoice No",
      "Amount",
      "Due Date",
      "Pay URL"
    ],
    "tags": [
      "invoice",
      "billing"
    ],
    "status": "approved",
    "downloads": 7665,
    "example": "Hi Alex, invoice #Sample for $129.00 is ready.\n\nDue: Aug 30\nPay: bright.co/go",
    "useCase": "Send transactional updates that customers are expecting (orders, bookings, accounts)."
  },
  {
    "id": 216,
    "name": "Subscription Renewal",
    "category": "Payments",
    "industry": "SaaS & CRM",
    "metaCategory": "UTILITY",
    "icon": "RefreshCw",
    "description": "Notify upcoming subscription renewal",
    "body": "Hi {{1}}, your *{{2}}* plan renews on {{3}} for {{4}}.\n\nManage: {{5}}",
    "variables": [
      "Customer Name",
      "Plan",
      "Renewal Date",
      "Amount",
      "Manage URL"
    ],
    "tags": [
      "subscription",
      "renewal"
    ],
    "status": "approved",
    "downloads": 8691,
    "example": "Hi Alex, your *Pro Monthly* plan renews on Mon, 18 Aug for $129.00.\n\nManage: bright.co/account",
    "useCase": "Send transactional updates that customers are expecting (orders, bookings, accounts)."
  },
  {
    "id": 217,
    "name": "Payment Failed",
    "category": "Payments",
    "industry": "SaaS & CRM",
    "metaCategory": "UTILITY",
    "icon": "AlertCircle",
    "description": "Notify a failed payment",
    "body": "Hi {{1}}, your payment of {{2}} for {{3}} failed.\n\nReason: {{4}}\nRetry: {{5}}",
    "variables": [
      "Customer Name",
      "Amount",
      "Reason",
      "Failure Reason",
      "Retry URL"
    ],
    "tags": [
      "payment",
      "failed"
    ],
    "status": "approved",
    "downloads": 6928,
    "example": "Hi Alex, your payment of $129.00 for incomplete documents failed.\n\nReason: incomplete documents\nRetry: bright.co/go",
    "useCase": "Send transactional updates that customers are expecting (orders, bookings, accounts)."
  },
  {
    "id": 218,
    "name": "Refund Processed",
    "category": "Payments",
    "industry": "E-commerce",
    "metaCategory": "UTILITY",
    "icon": "RefreshCw",
    "description": "Confirm refund processed",
    "body": "Hi {{1}}, a refund of {{2}} for order #{{3}} has been processed to {{4}}.\n\nIt should reflect in {{5}}.",
    "variables": [
      "Customer Name",
      "Amount",
      "Order ID",
      "Method",
      "Days"
    ],
    "tags": [
      "refund",
      "processed"
    ],
    "status": "approved",
    "downloads": 1915,
    "example": "Hi Alex, a refund of $129.00 for order ##10248 has been processed to Sample.\n\nIt should reflect in 3.",
    "useCase": "Send transactional updates that customers are expecting (orders, bookings, accounts)."
  },
  {
    "id": 219,
    "name": "Ticket Created",
    "category": "Support",
    "industry": "SaaS & CRM",
    "metaCategory": "UTILITY",
    "icon": "Headphones",
    "description": "Acknowledge a new support ticket",
    "body": "Hi {{1}}, ticket *#{{2}}* has been created for: {{3}}.\n\nOur team will respond within {{4}} hours.",
    "variables": [
      "Customer Name",
      "Ticket ID",
      "Subject",
      "SLA Hours"
    ],
    "tags": [
      "ticket",
      "support"
    ],
    "status": "approved",
    "downloads": 7391,
    "example": "Hi Alex, ticket *#TCK-882* has been created for: Sample.\n\nOur team will respond within 4 hours.",
    "useCase": "Send transactional updates that customers are expecting (orders, bookings, accounts)."
  },
  {
    "id": 220,
    "name": "Ticket Resolved",
    "category": "Support",
    "industry": "SaaS & CRM",
    "metaCategory": "UTILITY",
    "icon": "CheckCircle2",
    "description": "Notify ticket resolution",
    "body": "Hi {{1}}, ticket *#{{2}}* has been resolved.\n\nResolution: {{3}}\n\nRate your experience: {{4}}",
    "variables": [
      "Customer Name",
      "Ticket ID",
      "Resolution",
      "Feedback URL"
    ],
    "tags": [
      "ticket",
      "resolved"
    ],
    "status": "approved",
    "downloads": 4977,
    "example": "Hi Alex, ticket *#TCK-882* has been resolved.\n\nResolution: Sample\n\nRate your experience: bright.co/feedback",
    "useCase": "Send transactional updates that customers are expecting (orders, bookings, accounts)."
  },
  {
    "id": 221,
    "name": "Feedback Request",
    "category": "Support",
    "industry": "SaaS & CRM",
    "metaCategory": "UTILITY",
    "icon": "Star",
    "description": "Ask for feedback after support",
    "body": "Hi {{1}}, thanks for contacting us about {{2}}.\n\nHow did we do? Rate us: {{3}}",
    "variables": [
      "Customer Name",
      "Topic",
      "Feedback URL"
    ],
    "tags": [
      "feedback",
      "nps"
    ],
    "status": "approved",
    "downloads": 5024,
    "example": "Hi Alex, thanks for contacting us about Sample.\n\nHow did we do? Rate us: bright.co/feedback",
    "useCase": "Send transactional updates that customers are expecting (orders, bookings, accounts)."
  },
  {
    "id": 222,
    "name": "Support Follow-up",
    "category": "Support",
    "industry": "SaaS & CRM",
    "metaCategory": "UTILITY",
    "icon": "MessageSquare",
    "description": "Follow up on an open ticket",
    "body": "Hi {{1}}, following up on ticket *#{{2}}*.\n\nIs your issue resolved? Reply *YES* to close or share more details.",
    "variables": [
      "Customer Name",
      "Ticket ID"
    ],
    "tags": [
      "followup",
      "support"
    ],
    "status": "approved",
    "downloads": 2072,
    "example": "Hi Alex, following up on ticket *#TCK-882*.\n\nIs your issue resolved? Reply *YES* to close or share more details.",
    "useCase": "Send transactional updates that customers are expecting (orders, bookings, accounts)."
  },
  {
    "id": 223,
    "name": "Attendance Alert",
    "category": "Notifications",
    "industry": "Education",
    "metaCategory": "UTILITY",
    "icon": "UserCheck",
    "description": "Notify parents of student attendance",
    "body": "Hi {{1}}, {{2}} was marked *{{3}}* on {{4}}.\n\nFor queries, contact {{5}}.",
    "variables": [
      "Parent Name",
      "Student",
      "Status",
      "Date",
      "Contact"
    ],
    "tags": [
      "attendance",
      "education"
    ],
    "status": "approved",
    "downloads": 4752,
    "example": "Hi Alex, Sample was marked *Confirmed* on Mon, 18 Aug.\n\nFor queries, contact +1 800 555 0199.",
    "useCase": "Send transactional updates that customers are expecting (orders, bookings, accounts)."
  },
  {
    "id": 224,
    "name": "Fee Reminder",
    "category": "Notifications",
    "industry": "Education",
    "metaCategory": "UTILITY",
    "icon": "Wallet",
    "description": "Remind about fee due",
    "body": "Hi {{1}}, fee of {{2}} for {{3}} ({{4}}) is due on {{5}}.\n\nPay: {{6}}",
    "variables": [
      "Parent Name",
      "Amount",
      "Student",
      "Term",
      "Due Date",
      "Pay URL"
    ],
    "tags": [
      "fee",
      "reminder"
    ],
    "status": "approved",
    "downloads": 1178,
    "example": "Hi Alex, fee of $129.00 for Sample (Sample) is due on Aug 30.\n\nPay: bright.co/go",
    "useCase": "Send transactional updates that customers are expecting (orders, bookings, accounts)."
  },
  {
    "id": 225,
    "name": "Result Published",
    "category": "Notifications",
    "industry": "Education",
    "metaCategory": "UTILITY",
    "icon": "GraduationCap",
    "description": "Notify result publication",
    "body": "Hi {{1}}, results for *{{2}}* are out 🎓\n\nView: {{3}}",
    "variables": [
      "Student/Parent",
      "Exam",
      "Result URL"
    ],
    "tags": [
      "result",
      "exam"
    ],
    "status": "approved",
    "downloads": 2825,
    "example": "Hi Sample, results for *Sample* are out 🎓\n\nView: bright.co/go",
    "useCase": "Send transactional updates that customers are expecting (orders, bookings, accounts)."
  },
  {
    "id": 226,
    "name": "Parent Notification",
    "category": "Notifications",
    "industry": "Education",
    "metaCategory": "UTILITY",
    "icon": "MessageSquare",
    "description": "General parent notification",
    "body": "Hi {{1}}, an update about {{2}}: {{3}}\n\nFor details, visit {{4}}.",
    "variables": [
      "Parent Name",
      "Student",
      "Update",
      "Details URL"
    ],
    "tags": [
      "parent",
      "notification"
    ],
    "status": "approved",
    "downloads": 2222,
    "example": "Hi Alex, an update about Sample: Inbox v2.0\n\nFor details, visit 25 minutes.",
    "useCase": "Send transactional updates that customers are expecting (orders, bookings, accounts)."
  },
  {
    "id": 227,
    "name": "Appointment Confirmation",
    "category": "Appointments",
    "industry": "Healthcare",
    "metaCategory": "UTILITY",
    "icon": "Stethoscope",
    "description": "Confirm a healthcare appointment",
    "body": "Hi {{1}}, your appointment with Dr. {{2}} on {{3}} at {{4}} is confirmed.\n\nLocation: {{5}}\nReschedule: {{6}}",
    "variables": [
      "Patient Name",
      "Doctor",
      "Date",
      "Time",
      "Location",
      "Reschedule URL"
    ],
    "tags": [
      "healthcare",
      "appointment"
    ],
    "status": "approved",
    "downloads": 5614,
    "example": "Hi Alex, your appointment with Dr. Dr. Kim on Mon, 18 Aug at 6:30 PM is confirmed.\n\nLocation: Downtown Store\nReschedule: bright.co/reschedule",
    "useCase": "Send transactional updates that customers are expecting (orders, bookings, accounts)."
  },
  {
    "id": 228,
    "name": "Lab Report Ready",
    "category": "Notifications",
    "industry": "Healthcare",
    "metaCategory": "UTILITY",
    "icon": "FileText",
    "description": "Notify lab report availability",
    "body": "Hi {{1}}, your *{{2}}* report is ready.\n\nReport ID: {{3}}\nDownload: {{4}}",
    "variables": [
      "Patient Name",
      "Test",
      "Report ID",
      "Download URL"
    ],
    "tags": [
      "lab",
      "report"
    ],
    "status": "approved",
    "downloads": 7939,
    "example": "Hi Alex, your *Sample* report is ready.\n\nReport ID: X-1002\nDownload: bright.co/go",
    "useCase": "Send transactional updates that customers are expecting (orders, bookings, accounts)."
  },
  {
    "id": 229,
    "name": "Prescription Reminder",
    "category": "Notifications",
    "industry": "Healthcare",
    "metaCategory": "UTILITY",
    "icon": "Pill",
    "description": "Remind to refill prescription",
    "body": "Hi {{1}}, your prescription *{{2}}* runs out on {{3}}.\n\nRefill: {{4}}",
    "variables": [
      "Patient Name",
      "Medication",
      "Date",
      "Refill URL"
    ],
    "tags": [
      "prescription",
      "refill"
    ],
    "status": "approved",
    "downloads": 4885,
    "example": "Hi Alex, your prescription *Sample* runs out on Mon, 18 Aug.\n\nRefill: bright.co/go",
    "useCase": "Send transactional updates that customers are expecting (orders, bookings, accounts)."
  },
  {
    "id": 230,
    "name": "Medicine Reminder",
    "category": "Notifications",
    "industry": "Healthcare",
    "metaCategory": "UTILITY",
    "icon": "Bell",
    "description": "Daily medicine schedule reminder",
    "body": "Hi {{1}} 💊 Time to take *{{2}}* ({{3}}).\n\nReply *TAKEN* to log.",
    "variables": [
      "Patient Name",
      "Medicine",
      "Dose"
    ],
    "tags": [
      "medicine",
      "reminder"
    ],
    "status": "approved",
    "downloads": 3701,
    "example": "Hi Alex 💊 Time to take *Sample* (Sample).\n\nReply *TAKEN* to log.",
    "useCase": "Send transactional updates that customers are expecting (orders, bookings, accounts)."
  },
  {
    "id": 231,
    "name": "Workspace Invite",
    "category": "Notifications",
    "industry": "SaaS & CRM",
    "metaCategory": "UTILITY",
    "icon": "Users",
    "description": "Invite a teammate to a workspace",
    "body": "Hi {{1}}, {{2}} invited you to join *{{3}}* on {{4}}.\n\nAccept: {{5}}",
    "variables": [
      "Invitee Name",
      "Inviter",
      "Workspace",
      "Product",
      "Accept URL"
    ],
    "tags": [
      "invite",
      "workspace"
    ],
    "status": "approved",
    "downloads": 1607,
    "example": "Hi Alex, Sample invited you to join *Sample* on Aurora Sneakers.\n\nAccept: bright.co/go",
    "useCase": "Send transactional updates that customers are expecting (orders, bookings, accounts)."
  },
  {
    "id": 232,
    "name": "Team Member Added",
    "category": "Notifications",
    "industry": "SaaS & CRM",
    "metaCategory": "UTILITY",
    "icon": "UserPlus",
    "description": "Notify admin of new team member",
    "body": "Hi {{1}}, {{2}} has joined your *{{3}}* workspace as *{{4}}*.\n\nManage roles: {{5}}",
    "variables": [
      "Admin Name",
      "Member",
      "Workspace",
      "Role",
      "Manage URL"
    ],
    "tags": [
      "team",
      "onboarding"
    ],
    "status": "approved",
    "downloads": 1870,
    "example": "Hi Alex, Sample has joined your *Sample* workspace as *Sample*.\n\nManage roles: bright.co/account",
    "useCase": "Send transactional updates that customers are expecting (orders, bookings, accounts)."
  },
  {
    "id": 233,
    "name": "Trial Expiry Reminder",
    "category": "Notifications",
    "industry": "SaaS & CRM",
    "metaCategory": "UTILITY",
    "icon": "Clock",
    "description": "Remind a user about trial ending",
    "body": "Hi {{1}}, your free trial of *{{2}}* ends in {{3}} days.\n\nUpgrade to keep your data: {{4}}",
    "variables": [
      "Customer Name",
      "Product",
      "Days",
      "Upgrade URL"
    ],
    "tags": [
      "trial",
      "expiry"
    ],
    "status": "approved",
    "downloads": 5203,
    "example": "Hi Alex, your free trial of *Aurora Sneakers* ends in 3 days.\n\nUpgrade to keep your data: bright.co/go",
    "useCase": "Send transactional updates that customers are expecting (orders, bookings, accounts)."
  },
  {
    "id": 234,
    "name": "Plan Activated",
    "category": "Notifications",
    "industry": "SaaS & CRM",
    "metaCategory": "UTILITY",
    "icon": "CheckCircle2",
    "description": "Confirm a plan activation",
    "body": "Hi {{1}}, your *{{2}}* plan is active 🎉\n\nNext billing: {{3}} · Amount: {{4}}\n\nManage: {{5}}",
    "variables": [
      "Customer Name",
      "Plan",
      "Next Billing",
      "Amount",
      "Manage URL"
    ],
    "tags": [
      "plan",
      "activation"
    ],
    "status": "approved",
    "downloads": 4029,
    "example": "Hi Alex, your *Pro Monthly* plan is active 🎉\n\nNext billing: Sample · Amount: $129.00\n\nManage: bright.co/account",
    "useCase": "Send transactional updates that customers are expecting (orders, bookings, accounts)."
  },
  {
    "id": 235,
    "name": "Usage Limit Warning",
    "category": "Notifications",
    "industry": "SaaS & CRM",
    "metaCategory": "UTILITY",
    "icon": "AlertTriangle",
    "description": "Warn about approaching usage limit",
    "body": "Hi {{1}}, you've used {{2}}% of your {{3}} quota on the *{{4}}* plan.\n\nUpgrade for more: {{5}}",
    "variables": [
      "Customer Name",
      "Usage %",
      "Metric",
      "Plan",
      "Upgrade URL"
    ],
    "tags": [
      "usage",
      "limit"
    ],
    "status": "approved",
    "downloads": 8597,
    "example": "Hi Alex, you've used 20% of your Sample quota on the *Pro Monthly* plan.\n\nUpgrade for more: bright.co/go",
    "useCase": "Send transactional updates that customers are expecting (orders, bookings, accounts)."
  },
  {
    "id": 236,
    "name": "Transaction Alert",
    "category": "Notifications",
    "industry": "Finance & Insurance",
    "metaCategory": "UTILITY",
    "icon": "CreditCard",
    "description": "Alert about a transaction",
    "body": "Hi {{1}}, {{2}} of {{3}} on a/c *{{4}} on {{5}}.\nAvailable balance: {{6}}.\n\nNot you? Block card: {{7}}",
    "variables": [
      "Customer Name",
      "Type",
      "Amount",
      "Account",
      "Time",
      "Balance",
      "Block URL"
    ],
    "tags": [
      "transaction",
      "banking"
    ],
    "status": "approved",
    "downloads": 5537,
    "example": "Hi Alex, Sample of $129.00 on a/c *3 on 6:30 PM.\nAvailable balance: $320.00.\n\nNot you? Block card: bright.co/go",
    "useCase": "Send transactional updates that customers are expecting (orders, bookings, accounts)."
  },
  {
    "id": 237,
    "name": "KYC Reminder",
    "category": "Notifications",
    "industry": "Finance & Insurance",
    "metaCategory": "UTILITY",
    "icon": "FileCheck",
    "description": "Remind for KYC update",
    "body": "Hi {{1}}, please complete your KYC for a/c *{{2}} by {{3}} to avoid service disruption.\n\nUpdate: {{4}}",
    "variables": [
      "Customer Name",
      "Account",
      "Deadline",
      "KYC URL"
    ],
    "tags": [
      "kyc",
      "compliance"
    ],
    "status": "approved",
    "downloads": 6016,
    "example": "Hi Alex, please complete your KYC for a/c *3 by Sample to avoid service disruption.\n\nUpdate: bright.co/go",
    "useCase": "Send transactional updates that customers are expecting (orders, bookings, accounts)."
  },
  {
    "id": 238,
    "name": "Account Update",
    "category": "Notifications",
    "industry": "Finance & Insurance",
    "metaCategory": "UTILITY",
    "icon": "UserCog",
    "description": "Notify of an account update",
    "body": "Hi {{1}}, your {{2}} for a/c *{{3}} was updated on {{4}}.\n\nIf this wasn't you, contact us immediately: {{5}}",
    "variables": [
      "Customer Name",
      "Field",
      "Account",
      "Time",
      "Contact URL"
    ],
    "tags": [
      "account",
      "update"
    ],
    "status": "approved",
    "downloads": 4461,
    "example": "Hi Alex, your Sample for a/c *3 was updated on 6:30 PM.\n\nIf this wasn't you, contact us immediately: bright.co/go",
    "useCase": "Send transactional updates that customers are expecting (orders, bookings, accounts)."
  },
  {
    "id": 239,
    "name": "Statement Ready",
    "category": "Notifications",
    "industry": "Finance & Insurance",
    "metaCategory": "UTILITY",
    "icon": "FileText",
    "description": "Monthly statement availability",
    "body": "Hi {{1}}, your statement for {{2}} ({{3}}) is ready.\n\nDownload: {{4}}",
    "variables": [
      "Customer Name",
      "Month",
      "Account",
      "Download URL"
    ],
    "tags": [
      "statement",
      "banking"
    ],
    "status": "approved",
    "downloads": 6488,
    "example": "Hi Alex, your statement for Sample (3) is ready.\n\nDownload: bright.co/go",
    "useCase": "Send transactional updates that customers are expecting (orders, bookings, accounts)."
  },
  {
    "id": 240,
    "name": "Pickup Scheduled",
    "category": "Logistics",
    "industry": "Logistics",
    "metaCategory": "UTILITY",
    "icon": "Truck",
    "description": "Confirm a pickup schedule",
    "body": "Hi {{1}}, pickup for AWB *{{2}}* is scheduled on {{3}} between {{4}}.\n\nReschedule: {{5}}",
    "variables": [
      "Customer Name",
      "AWB",
      "Date",
      "Time Slot",
      "Reschedule URL"
    ],
    "tags": [
      "pickup",
      "logistics"
    ],
    "status": "approved",
    "downloads": 6084,
    "example": "Hi Alex, pickup for AWB *Sample* is scheduled on Mon, 18 Aug between 6:30 PM.\n\nReschedule: bright.co/reschedule",
    "useCase": "Send transactional updates that customers are expecting (orders, bookings, accounts)."
  },
  {
    "id": 241,
    "name": "Shipment Delayed",
    "category": "Logistics",
    "industry": "Logistics",
    "metaCategory": "UTILITY",
    "icon": "AlertCircle",
    "description": "Notify shipment delay",
    "body": "Hi {{1}}, your shipment *{{2}}* is delayed due to {{3}}.\n\nNew ETA: {{4}}. We apologise for the inconvenience.",
    "variables": [
      "Customer Name",
      "AWB",
      "Reason",
      "New ETA"
    ],
    "tags": [
      "delay",
      "shipment"
    ],
    "status": "approved",
    "downloads": 5158,
    "example": "Hi Alex, your shipment *Sample* is delayed due to incomplete documents.\n\nNew ETA: 25 minutes. We apologise for the inconvenience.",
    "useCase": "Send transactional updates that customers are expecting (orders, bookings, accounts)."
  },
  {
    "id": 242,
    "name": "Driver Arriving",
    "category": "Logistics",
    "industry": "Logistics",
    "metaCategory": "UTILITY",
    "icon": "Navigation",
    "description": "Driver-arriving notification",
    "body": "Hi {{1}}, your driver {{2}} ({{3}}) is arriving in {{4}} mins for pickup/delivery of *{{5}}*.",
    "variables": [
      "Customer Name",
      "Driver",
      "Phone",
      "Minutes",
      "AWB"
    ],
    "tags": [
      "driver",
      "arriving"
    ],
    "status": "approved",
    "downloads": 7978,
    "example": "Hi Alex, your driver Sample (+1 555 010 4421) is arriving in 15 mins for pickup/delivery of *Sample*.",
    "useCase": "Send transactional updates that customers are expecting (orders, bookings, accounts)."
  },
  {
    "id": 243,
    "name": "Delivery Completed",
    "category": "Logistics",
    "industry": "Logistics",
    "metaCategory": "UTILITY",
    "icon": "CheckCircle2",
    "description": "Confirm logistics delivery",
    "body": "Hi {{1}}, AWB *{{2}}* was delivered on {{3}} to {{4}}.\n\nFeedback: {{5}}",
    "variables": [
      "Customer Name",
      "AWB",
      "Time",
      "Receiver",
      "Feedback URL"
    ],
    "tags": [
      "delivery",
      "completed"
    ],
    "status": "approved",
    "downloads": 1960,
    "example": "Hi Alex, AWB *Sample* was delivered on 6:30 PM to Sample.\n\nFeedback: bright.co/feedback",
    "useCase": "Send transactional updates that customers are expecting (orders, bookings, accounts)."
  },
  {
    "id": 244,
    "name": "Account Verified",
    "category": "Notifications",
    "industry": "SaaS & CRM",
    "metaCategory": "UTILITY",
    "icon": "BadgeCheck",
    "description": "Confirm account verification",
    "body": "Hi {{1}}, your account on *{{2}}* has been verified ✅\n\nGet started: {{3}}",
    "variables": [
      "Customer Name",
      "Product",
      "Get Started URL"
    ],
    "tags": [
      "verified",
      "account"
    ],
    "status": "approved",
    "downloads": 2589,
    "example": "Hi Alex, your account on *Aurora Sneakers* has been verified ✅\n\nGet started: bright.co/go",
    "useCase": "Send transactional updates that customers are expecting (orders, bookings, accounts)."
  },
  {
    "id": 245,
    "name": "2FA Enabled",
    "category": "Authentication",
    "industry": "SaaS & CRM",
    "metaCategory": "UTILITY",
    "icon": "ShieldCheck",
    "description": "Confirm two-factor authentication enabled",
    "body": "Hi {{1}}, two-factor authentication is now enabled on your *{{2}}* account.\n\nIf this wasn't you, contact support: {{3}}",
    "variables": [
      "Customer Name",
      "Product",
      "Support URL"
    ],
    "tags": [
      "2fa",
      "security"
    ],
    "status": "approved",
    "downloads": 9343,
    "example": "Hi Alex, two-factor authentication is now enabled on your *Aurora Sneakers* account.\n\nIf this wasn't you, contact support: bright.co/help",
    "useCase": "Send transactional updates that customers are expecting (orders, bookings, accounts)."
  },
  {
    "id": 246,
    "name": "Cancellation Confirmation",
    "category": "Notifications",
    "industry": "E-commerce",
    "metaCategory": "UTILITY",
    "icon": "XCircle",
    "description": "Confirm an order or booking cancellation",
    "body": "Hi {{1}}, your {{2}} #{{3}} has been cancelled.\n\nRefund of {{4}} will be processed in {{5}}.",
    "variables": [
      "Customer Name",
      "Type",
      "Reference",
      "Amount",
      "Days"
    ],
    "tags": [
      "cancellation",
      "refund"
    ],
    "status": "approved",
    "downloads": 2668,
    "example": "Hi Alex, your Sample #REF-9921 has been cancelled.\n\nRefund of $129.00 will be processed in 3.",
    "useCase": "Send transactional updates that customers are expecting (orders, bookings, accounts)."
  },
  {
    "id": 247,
    "name": "Document Expiry",
    "category": "Notifications",
    "industry": "Finance & Insurance",
    "metaCategory": "UTILITY",
    "icon": "FileWarning",
    "description": "Notify of document expiry",
    "body": "Hi {{1}}, your {{2}} expires on {{3}}. Renew in 2 mins to avoid service disruption: {{4}}",
    "variables": [
      "Customer Name",
      "Document",
      "Expiry Date",
      "Renew URL"
    ],
    "tags": [
      "expiry",
      "renewal"
    ],
    "status": "approved",
    "downloads": 2967,
    "example": "Hi Alex, your Sample expires on Dec 31, 2026. Renew in 2 mins to avoid service disruption: bright.co/renew",
    "useCase": "Send transactional updates that customers are expecting (orders, bookings, accounts)."
  },
  {
    "id": 248,
    "name": "Address Verification",
    "category": "Notifications",
    "industry": "Logistics",
    "metaCategory": "UTILITY",
    "icon": "MapPin",
    "description": "Verify delivery address",
    "body": "Hi {{1}}, please confirm the delivery address for order #{{2}}:\n\n{{3}}\n\nReply *YES* to confirm or update: {{4}}",
    "variables": [
      "Customer Name",
      "Order ID",
      "Address",
      "Update URL"
    ],
    "tags": [
      "address",
      "verification"
    ],
    "status": "approved",
    "downloads": 6000,
    "example": "Hi Alex, please confirm the delivery address for order ##10248:\n\n221B Baker Street\n\nReply *YES* to confirm or update: Mon, 18 Aug",
    "useCase": "Send transactional updates that customers are expecting (orders, bookings, accounts)."
  },
  {
    "id": 249,
    "name": "Stock Allocation",
    "category": "Notifications",
    "industry": "E-commerce",
    "metaCategory": "UTILITY",
    "icon": "Package",
    "description": "Notify when wish-listed item is reserved for customer",
    "body": "Hi {{1}}, we've reserved *{{2}}* in your cart for {{3}} hours.\n\nComplete checkout: {{4}}",
    "variables": [
      "Customer Name",
      "Product",
      "Hours",
      "Checkout URL"
    ],
    "tags": [
      "stock",
      "reservation"
    ],
    "status": "approved",
    "downloads": 4309,
    "example": "Hi Alex, we've reserved *Aurora Sneakers* in your cart for 4 hours.\n\nComplete checkout: bright.co/checkout",
    "useCase": "Send transactional updates that customers are expecting (orders, bookings, accounts)."
  },
  {
    "id": 250,
    "name": "Service Activation",
    "category": "Notifications",
    "industry": "SaaS & CRM",
    "metaCategory": "UTILITY",
    "icon": "Power",
    "description": "Confirm service activation",
    "body": "Hi {{1}}, your *{{2}}* service is now active.\n\nValid till: {{3}}\nManage: {{4}}",
    "variables": [
      "Customer Name",
      "Service",
      "Validity",
      "Manage URL"
    ],
    "tags": [
      "service",
      "activation"
    ],
    "status": "approved",
    "downloads": 7008,
    "example": "Hi Alex, your *Premium Plan* service is now active.\n\nValid till: 12 months\nManage: bright.co/account",
    "useCase": "Send transactional updates that customers are expecting (orders, bookings, accounts)."
  }
];

const uniq = <T>(arr: T[]): T[] => Array.from(new Set(arr));

export const TEMPLATE_CATEGORIES = [
  { name: 'All', count: PRE_APPROVED_TEMPLATES.length },
  ...uniq(PRE_APPROVED_TEMPLATES.map((t) => t.category)).map((name) => ({
    name,
    count: PRE_APPROVED_TEMPLATES.filter((t) => t.category === name).length,
  })),
];

export const TEMPLATE_INDUSTRIES = [
  { name: 'All', count: PRE_APPROVED_TEMPLATES.length },
  ...uniq(PRE_APPROVED_TEMPLATES.map((t) => t.industry).filter(Boolean) as string[]).map((name) => ({
    name,
    count: PRE_APPROVED_TEMPLATES.filter((t) => t.industry === name).length,
  })),
];
