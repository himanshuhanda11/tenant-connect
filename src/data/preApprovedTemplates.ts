// Pre-approved WhatsApp Business templates - 50 templates across all categories
// These templates follow Meta's guidelines and have high approval rates

export interface PreApprovedTemplate {
  id: number;
  name: string;
  category: 'E-commerce' | 'Marketing' | 'Notifications' | 'Appointments' | 'Support' | 'Payments' | 'Authentication' | 'Logistics' | 'HR & Recruitment' | 'Education' | 'Healthcare' | 'Real Estate' | 'Travel' | 'Food & Delivery';
  metaCategory: 'UTILITY' | 'MARKETING' | 'AUTHENTICATION';
  icon: string;
  description: string;
  body: string;
  variables: string[];
  tags: string[];
  status: 'approved';
  downloads: number;
  isNew?: boolean;
  isTrending?: boolean;
}

export const PRE_APPROVED_TEMPLATES: PreApprovedTemplate[] = [
  // E-commerce Templates (1-10)
  {
    id: 1,
    name: 'Order Confirmation',
    category: 'E-commerce',
    metaCategory: 'UTILITY',
    icon: 'Package',
    description: 'Confirm orders with details, amount, and tracking information',
    body: 'Hi {{1}}! 🎉\n\nThank you for your order #{{2}}!\n\nOrder Total: ₹{{3}}\nEstimated Delivery: {{4}}\n\nTrack your order: {{5}}\n\nNeed help? Reply to this message!',
    variables: ['Customer Name', 'Order ID', 'Total Amount', 'Delivery Date', 'Tracking URL'],
    tags: ['transactional', 'order', 'confirmation'],
    status: 'approved',
    downloads: 12500
  },
  {
    id: 2,
    name: 'Shipping Update',
    category: 'E-commerce',
    metaCategory: 'UTILITY',
    icon: 'Truck',
    description: 'Keep customers informed about their shipment status',
    body: 'Hi {{1}},\n\n📦 Your order is on the way!\n\nOrder #{{2}} has been shipped.\n\nCarrier: {{3}}\nTracking: {{4}}\n\nEstimated delivery: {{5}}\n\nTrack live: {{6}}',
    variables: ['Customer Name', 'Order ID', 'Carrier Name', 'Tracking Number', 'Delivery Date', 'Tracking URL'],
    tags: ['shipping', 'tracking', 'update'],
    status: 'approved',
    downloads: 11200
  },
  {
    id: 3,
    name: 'Delivery Completed',
    category: 'E-commerce',
    metaCategory: 'UTILITY',
    icon: 'CheckCircle2',
    description: 'Confirm successful order delivery to customers',
    body: '📬 Delivered!\n\nHi {{1}},\n\nGreat news! Your order #{{2}} has been delivered.\n\nDelivered to: {{3}}\nTime: {{4}}\n\nEnjoy your purchase! 🎉\n\nRate your experience: {{5}}',
    variables: ['Customer Name', 'Order ID', 'Address', 'Delivery Time', 'Feedback URL'],
    tags: ['delivery', 'completed', 'confirmation'],
    status: 'approved',
    downloads: 9400
  },
  {
    id: 4,
    name: 'Abandoned Cart Recovery',
    category: 'E-commerce',
    metaCategory: 'MARKETING',
    icon: 'ShoppingCart',
    description: 'Recover abandoned carts with personalized reminders',
    body: 'Hi {{1}},\n\n🛒 You left something behind!\n\nYour cart is waiting:\n{{2}}\n\nTotal: ₹{{3}}\n\n✨ Complete your order: {{4}}\n\nNeed help? We\'re here for you!',
    variables: ['Customer Name', 'Cart Items', 'Total', 'Checkout URL'],
    tags: ['cart', 'recovery', 'reminder'],
    status: 'approved',
    downloads: 10300
  },
  {
    id: 5,
    name: 'Order Refund Processed',
    category: 'E-commerce',
    metaCategory: 'UTILITY',
    icon: 'RefreshCw',
    description: 'Confirm refund processing to customers',
    body: '💰 Refund Processed!\n\nHi {{1}},\n\nYour refund for order #{{2}} has been processed.\n\nAmount: ₹{{3}}\nMethod: {{4}}\n\nExpect it within {{5}} business days.\n\nQuestions? Reply here.',
    variables: ['Customer Name', 'Order ID', 'Refund Amount', 'Payment Method', 'Days'],
    tags: ['refund', 'order', 'processed'],
    status: 'approved',
    downloads: 6800
  },
  {
    id: 6,
    name: 'Order Delayed Notification',
    category: 'E-commerce',
    metaCategory: 'UTILITY',
    icon: 'Clock',
    description: 'Notify customers about order delays proactively',
    body: 'Hi {{1}},\n\n⚠️ Order Update\n\nWe wanted to let you know that order #{{2}} is slightly delayed.\n\nNew Expected Delivery: {{3}}\nReason: {{4}}\n\nWe apologize for the inconvenience.\n\nTrack status: {{5}}',
    variables: ['Customer Name', 'Order ID', 'New Date', 'Delay Reason', 'Track URL'],
    tags: ['delay', 'notification', 'order'],
    status: 'approved',
    downloads: 4500,
    isNew: true
  },
  {
    id: 7,
    name: 'Product Back in Stock',
    category: 'E-commerce',
    metaCategory: 'MARKETING',
    icon: 'Bell',
    description: 'Notify customers when wished items are available',
    body: '🔔 Back in Stock!\n\nHi {{1}},\n\nGreat news! {{2}} is back in stock!\n\n💰 Price: ₹{{3}}\n\nGrab yours before it\'s gone: {{4}}\n\nLimited quantities available!',
    variables: ['Customer Name', 'Product Name', 'Price', 'Product URL'],
    tags: ['restock', 'alert', 'wishlist'],
    status: 'approved',
    downloads: 6100
  },
  {
    id: 8,
    name: 'Product Review Request',
    category: 'E-commerce',
    metaCategory: 'UTILITY',
    icon: 'Star',
    description: 'Request product reviews after delivery',
    body: 'Hi {{1}},\n\nHow are you enjoying {{2}}? 🌟\n\nWe\'d love to hear your thoughts!\n\n⭐ Leave a review: {{3}}\n\nYour feedback helps other customers and helps us improve.\n\nThank you!',
    variables: ['Customer Name', 'Product Name', 'Review URL'],
    tags: ['review', 'feedback', 'product'],
    status: 'approved',
    downloads: 7200
  },
  {
    id: 9,
    name: 'Exchange Request Approved',
    category: 'E-commerce',
    metaCategory: 'UTILITY',
    icon: 'ArrowLeftRight',
    description: 'Confirm exchange request approval',
    body: 'Hi {{1}},\n\n✅ Exchange Approved!\n\nYour exchange for order #{{2}} has been approved.\n\nOriginal: {{3}}\nExchange for: {{4}}\n\nSchedule pickup: {{5}}\n\nNew item ships after we receive the return.',
    variables: ['Customer Name', 'Order ID', 'Original Item', 'New Item', 'Pickup URL'],
    tags: ['exchange', 'return', 'approved'],
    status: 'approved',
    downloads: 3800,
    isNew: true
  },
  {
    id: 10,
    name: 'COD Order Reminder',
    category: 'E-commerce',
    metaCategory: 'UTILITY',
    icon: 'Wallet',
    description: 'Remind customers about Cash on Delivery orders',
    body: 'Hi {{1}},\n\n📦 Your COD order #{{2}} is arriving!\n\nPlease keep ₹{{3}} ready for payment.\n\nDelivery: {{4}}\n\nNot available? Reschedule: {{5}}\n\nThank you!',
    variables: ['Customer Name', 'Order ID', 'Amount', 'Delivery Slot', 'Reschedule URL'],
    tags: ['cod', 'payment', 'reminder'],
    status: 'approved',
    downloads: 5600
  },

  // Marketing Templates (11-18)
  {
    id: 11,
    name: 'Flash Sale Alert',
    category: 'Marketing',
    metaCategory: 'MARKETING',
    icon: 'Zap',
    description: 'Create urgency with limited-time promotional offers',
    body: '⚡ FLASH SALE, {{1}}!\n\nGet {{2}}% OFF for the next {{3}} hours only!\n\nUse code: {{4}}\n\n🛒 Shop now: {{5}}\n\nHurry, limited stock!',
    variables: ['Customer Name', 'Discount %', 'Hours', 'Promo Code', 'Shop URL'],
    tags: ['marketing', 'sale', 'urgent'],
    status: 'approved',
    downloads: 8700,
    isTrending: true
  },
  {
    id: 12,
    name: 'Welcome Message',
    category: 'Marketing',
    metaCategory: 'MARKETING',
    icon: 'UserPlus',
    description: 'Welcome new subscribers with a warm greeting',
    body: 'Welcome to {{1}}, {{2}}! 🎉\n\nWe\'re thrilled to have you with us.\n\nHere\'s what you can expect:\n✅ Exclusive offers\n✅ Early access to sales\n✅ Personalized recommendations\n\nReply HELP anytime for assistance!',
    variables: ['Brand Name', 'Customer Name'],
    tags: ['welcome', 'onboarding', 'greeting'],
    status: 'approved',
    downloads: 15600
  },
  {
    id: 13,
    name: 'Birthday Offer',
    category: 'Marketing',
    metaCategory: 'MARKETING',
    icon: 'Gift',
    description: 'Celebrate customers with special birthday discounts',
    body: '🎂 Happy Birthday, {{1}}!\n\nCelebrate with a special gift from us:\n\n🎁 {{2}}% OFF your next purchase!\n\nUse code: {{3}}\nValid until: {{4}}\n\nTreat yourself: {{5}}\n\nHave an amazing day!',
    variables: ['Customer Name', 'Discount %', 'Birthday Code', 'Expiry Date', 'Shop URL'],
    tags: ['birthday', 'offer', 'personalized'],
    status: 'approved',
    downloads: 6500
  },
  {
    id: 14,
    name: 'Referral Invite',
    category: 'Marketing',
    metaCategory: 'MARKETING',
    icon: 'Users',
    description: 'Encourage customers to refer friends',
    body: 'Hi {{1}},\n\n💝 Share the love!\n\nInvite friends to {{2}} and you BOTH get ₹{{3}} off!\n\nYour referral code: {{4}}\n\nShare now: {{5}}\n\nThe more you share, the more you earn!',
    variables: ['Customer Name', 'Brand Name', 'Reward Amount', 'Referral Code', 'Share Link'],
    tags: ['referral', 'reward', 'invite'],
    status: 'approved',
    downloads: 5800
  },
  {
    id: 15,
    name: 'Limited Time Bundle',
    category: 'Marketing',
    metaCategory: 'MARKETING',
    icon: 'Sparkles',
    description: 'Promote exclusive bundle offers',
    body: '✨ Exclusive Bundle!\n\nHi {{1}},\n\n{{2}} - Only ₹{{3}}!\n\nYou save: ₹{{4}} ({{5}}% off)\n\n⏰ Offer ends: {{6}}\n\n🛒 Grab yours: {{7}}\n\nLimited quantities!',
    variables: ['Customer Name', 'Bundle Name', 'Bundle Price', 'Savings', 'Discount %', 'Expiry', 'Shop URL'],
    tags: ['bundle', 'offer', 'limited'],
    status: 'approved',
    downloads: 7600
  },
  {
    id: 16,
    name: 'Loyalty Points Update',
    category: 'Marketing',
    metaCategory: 'MARKETING',
    icon: 'Heart',
    description: 'Update customers on their loyalty rewards balance',
    body: '⭐ Points Update!\n\nHi {{1}},\n\nYou\'ve earned {{2}} points!\n\nTotal balance: {{3}} points\n\n🎁 Redeem rewards: {{4}}\n\nKeep shopping to earn more!',
    variables: ['Customer Name', 'New Points', 'Total Points', 'Rewards URL'],
    tags: ['loyalty', 'points', 'rewards'],
    status: 'approved',
    downloads: 5400
  },
  {
    id: 17,
    name: 'VIP Early Access',
    category: 'Marketing',
    metaCategory: 'MARKETING',
    icon: 'Crown',
    description: 'Give VIP customers early access to sales',
    body: '👑 VIP Early Access!\n\nHi {{1}},\n\nAs a valued VIP member, you get exclusive early access to our {{2}}!\n\n🔓 Access starts: {{3}}\n💰 Extra {{4}}% off with code: {{5}}\n\nShop before everyone else: {{6}}',
    variables: ['Customer Name', 'Sale Name', 'Start Time', 'Extra Discount', 'VIP Code', 'Shop URL'],
    tags: ['vip', 'early-access', 'exclusive'],
    status: 'approved',
    downloads: 4200,
    isNew: true
  },
  {
    id: 18,
    name: 'Seasonal Campaign',
    category: 'Marketing',
    metaCategory: 'MARKETING',
    icon: 'Calendar',
    description: 'Promote seasonal offers and festivals',
    body: '🎊 {{1}} Special!\n\nHi {{2}},\n\nCelebrate with amazing deals!\n\n🎁 Up to {{3}}% OFF sitewide\n🏷️ Use code: {{4}}\n⏰ Valid: {{5}} - {{6}}\n\nShop festive deals: {{7}}',
    variables: ['Festival Name', 'Customer Name', 'Discount', 'Code', 'Start Date', 'End Date', 'Shop URL'],
    tags: ['seasonal', 'festival', 'campaign'],
    status: 'approved',
    downloads: 8900,
    isTrending: true
  },

  // Appointment Templates (19-24)
  {
    id: 19,
    name: 'Appointment Reminder',
    category: 'Appointments',
    metaCategory: 'UTILITY',
    icon: 'Calendar',
    description: 'Remind customers of upcoming appointments with details',
    body: 'Hello {{1}},\n\nThis is a reminder for your appointment:\n\n📅 Date: {{2}}\n⏰ Time: {{3}}\n📍 Location: {{4}}\n\nNeed to reschedule? Reply YES or call us.\n\nSee you soon!',
    variables: ['Customer Name', 'Date', 'Time', 'Location'],
    tags: ['reminder', 'appointment', 'scheduling'],
    status: 'approved',
    downloads: 9800
  },
  {
    id: 20,
    name: 'Appointment Confirmation',
    category: 'Appointments',
    metaCategory: 'UTILITY',
    icon: 'CheckCircle2',
    description: 'Confirm newly booked appointments instantly',
    body: '✅ Appointment Confirmed!\n\nHi {{1}},\n\nYour appointment is booked:\n\n📅 {{2}} at {{3}}\n👨‍⚕️ With: {{4}}\n📍 {{5}}\n\nAdd to calendar: {{6}}\n\nSee you there!',
    variables: ['Customer Name', 'Date', 'Time', 'Provider Name', 'Location', 'Calendar Link'],
    tags: ['confirmation', 'appointment', 'booking'],
    status: 'approved',
    downloads: 8100
  },
  {
    id: 21,
    name: 'Appointment Cancellation',
    category: 'Appointments',
    metaCategory: 'UTILITY',
    icon: 'XCircle',
    description: 'Confirm appointment cancellations professionally',
    body: 'Hi {{1}},\n\n❌ Appointment Cancelled\n\nYour appointment on {{2}} at {{3}} has been cancelled.\n\nReschedule: {{4}}\n\nWe hope to see you soon!',
    variables: ['Customer Name', 'Date', 'Time', 'Booking URL'],
    tags: ['cancellation', 'appointment', 'reschedule'],
    status: 'approved',
    downloads: 4300
  },
  {
    id: 22,
    name: 'Appointment Rescheduled',
    category: 'Appointments',
    metaCategory: 'UTILITY',
    icon: 'RefreshCw',
    description: 'Confirm rescheduled appointment details',
    body: '🔄 Appointment Rescheduled\n\nHi {{1}},\n\nYour appointment has been moved to:\n\n📅 New Date: {{2}}\n⏰ New Time: {{3}}\n📍 Location: {{4}}\n\nNeed to change again? Reply YES.',
    variables: ['Customer Name', 'New Date', 'New Time', 'Location'],
    tags: ['reschedule', 'appointment', 'update'],
    status: 'approved',
    downloads: 5100
  },
  {
    id: 23,
    name: 'Slot Available Alert',
    category: 'Appointments',
    metaCategory: 'UTILITY',
    icon: 'AlertCircle',
    description: 'Notify about newly available appointment slots',
    body: 'Hi {{1}},\n\n🎉 Good news! A slot just opened up!\n\n📅 {{2}} at {{3}}\n👨‍⚕️ With: {{4}}\n\nBook now before it\'s taken: {{5}}\n\nThis slot is in high demand!',
    variables: ['Customer Name', 'Date', 'Time', 'Provider', 'Book URL'],
    tags: ['availability', 'slot', 'booking'],
    status: 'approved',
    downloads: 3200,
    isNew: true
  },
  {
    id: 24,
    name: 'Service Completion',
    category: 'Appointments',
    metaCategory: 'UTILITY',
    icon: 'CheckCircle',
    description: 'Follow up after service completion',
    body: 'Hi {{1}},\n\nThank you for visiting {{2}}! ✨\n\nService: {{3}}\nDate: {{4}}\n\nWe hope you had a great experience.\n\n⭐ Rate us: {{5}}\n\nBook your next appointment: {{6}}',
    variables: ['Customer Name', 'Business Name', 'Service', 'Date', 'Review URL', 'Book URL'],
    tags: ['follow-up', 'completion', 'feedback'],
    status: 'approved',
    downloads: 4800
  },

  // Payments Templates (25-28)
  {
    id: 25,
    name: 'Payment Reminder',
    category: 'Payments',
    metaCategory: 'UTILITY',
    icon: 'CreditCard',
    description: 'Remind customers about pending payments professionally',
    body: 'Hi {{1}},\n\n⚠️ Payment Reminder\n\nYour payment of ₹{{2}} for invoice #{{3}} is due on {{4}}.\n\nPay now: {{5}}\n\nQuestions? Reply to this message.\n\nThank you!',
    variables: ['Customer Name', 'Amount', 'Invoice ID', 'Due Date', 'Payment URL'],
    tags: ['payment', 'reminder', 'invoice'],
    status: 'approved',
    downloads: 7400
  },
  {
    id: 26,
    name: 'Payment Received',
    category: 'Payments',
    metaCategory: 'UTILITY',
    icon: 'CheckCircle',
    description: 'Confirm payment received',
    body: 'Hi {{1}},\n\n✅ Payment Received!\n\nAmount: ₹{{2}}\nTransaction ID: {{3}}\nDate: {{4}}\n\nInvoice: {{5}}\n\nThank you for your payment!',
    variables: ['Customer Name', 'Amount', 'Transaction ID', 'Date', 'Invoice URL'],
    tags: ['payment', 'confirmation', 'receipt'],
    status: 'approved',
    downloads: 8200
  },
  {
    id: 27,
    name: 'Payment Failed',
    category: 'Payments',
    metaCategory: 'UTILITY',
    icon: 'AlertTriangle',
    description: 'Notify about failed payment attempts',
    body: 'Hi {{1}},\n\n❌ Payment Failed\n\nYour payment of ₹{{2}} could not be processed.\n\nReason: {{3}}\n\nPlease retry: {{4}}\n\nNeed help? Reply to this message.',
    variables: ['Customer Name', 'Amount', 'Failure Reason', 'Retry URL'],
    tags: ['payment', 'failed', 'retry'],
    status: 'approved',
    downloads: 4100
  },
  {
    id: 28,
    name: 'Subscription Renewal',
    category: 'Payments',
    metaCategory: 'UTILITY',
    icon: 'RefreshCw',
    description: 'Notify customers about upcoming subscription renewals',
    body: 'Hi {{1}},\n\n🔄 Subscription Renewal Notice\n\nYour {{2}} subscription renews on {{3}}.\n\nAmount: ₹{{4}}/{{5}}\n\nManage subscription: {{6}}\n\nQuestions? Reply here.',
    variables: ['Customer Name', 'Plan Name', 'Renewal Date', 'Amount', 'Period', 'Manage URL'],
    tags: ['subscription', 'renewal', 'billing'],
    status: 'approved',
    downloads: 5200
  },

  // Support Templates (29-32)
  {
    id: 29,
    name: 'Feedback Request',
    category: 'Support',
    metaCategory: 'UTILITY',
    icon: 'Star',
    description: 'Request customer feedback after purchase or service',
    body: 'Hi {{1}},\n\nThank you for choosing {{2}}! 🙏\n\nWe\'d love to hear about your experience.\n\n⭐ Rate us: {{3}}\n\nYour feedback helps us improve!\n\nTake 30 seconds to share your thoughts.',
    variables: ['Customer Name', 'Brand Name', 'Feedback Link'],
    tags: ['feedback', 'review', 'rating'],
    status: 'approved',
    downloads: 8900
  },
  {
    id: 30,
    name: 'Service Ticket Created',
    category: 'Support',
    metaCategory: 'UTILITY',
    icon: 'Ticket',
    description: 'Confirm support ticket creation',
    body: 'Hi {{1}},\n\n🎫 Ticket Created\n\nYour support request has been received.\n\nTicket ID: {{2}}\nSubject: {{3}}\nPriority: {{4}}\n\nExpected response: Within {{5}} hours\n\nTrack status: {{6}}',
    variables: ['Customer Name', 'Ticket ID', 'Subject', 'Priority', 'SLA Hours', 'Track URL'],
    tags: ['support', 'ticket', 'created'],
    status: 'approved',
    downloads: 5600
  },
  {
    id: 31,
    name: 'Ticket Resolved',
    category: 'Support',
    metaCategory: 'UTILITY',
    icon: 'CheckCircle2',
    description: 'Notify when support ticket is resolved',
    body: 'Hi {{1}},\n\n✅ Ticket Resolved!\n\nYour ticket #{{2}} has been resolved.\n\nResolution: {{3}}\n\nWas this helpful?\n👍 Reply YES if resolved\n👎 Reply NO to reopen\n\nThank you for your patience!',
    variables: ['Customer Name', 'Ticket ID', 'Resolution Summary'],
    tags: ['support', 'resolved', 'ticket'],
    status: 'approved',
    downloads: 4800
  },
  {
    id: 32,
    name: 'Store Location',
    category: 'Support',
    metaCategory: 'UTILITY',
    icon: 'MapPin',
    description: 'Share store location and directions',
    body: '📍 Find Us!\n\nHi {{1}},\n\nOur nearest store:\n\n{{2}}\n{{3}}\n\n🕐 Hours: {{4}}\n📞 Call: {{5}}\n\n🗺️ Get directions: {{6}}',
    variables: ['Customer Name', 'Store Name', 'Address', 'Hours', 'Phone', 'Maps URL'],
    tags: ['location', 'directions', 'store'],
    status: 'approved',
    downloads: 3900
  },

  // Authentication Templates (33-35)
  {
    id: 33,
    name: 'OTP Verification',
    category: 'Authentication',
    metaCategory: 'AUTHENTICATION',
    icon: 'Shield',
    description: 'Secure authentication with one-time passwords',
    body: '🔐 Your verification code is: {{1}}\n\nValid for {{2}} minutes.\n\nDo not share this code with anyone.\n\nDidn\'t request this? Ignore this message.',
    variables: ['OTP Code', 'Validity Minutes'],
    tags: ['security', 'otp', 'verification'],
    status: 'approved',
    downloads: 22100,
    isTrending: true
  },
  {
    id: 34,
    name: 'Password Reset',
    category: 'Authentication',
    metaCategory: 'AUTHENTICATION',
    icon: 'Key',
    description: 'Secure password reset link delivery',
    body: '🔑 Password Reset Request\n\nHi {{1}},\n\nWe received a request to reset your password.\n\nReset now: {{2}}\n\nThis link expires in {{3}} minutes.\n\nDidn\'t request this? Ignore this message.',
    variables: ['Customer Name', 'Reset URL', 'Expiry Minutes'],
    tags: ['security', 'password', 'reset'],
    status: 'approved',
    downloads: 14200
  },
  {
    id: 35,
    name: 'Login Alert',
    category: 'Authentication',
    metaCategory: 'UTILITY',
    icon: 'AlertTriangle',
    description: 'Alert users about new login activity',
    body: '⚠️ New Login Detected\n\nHi {{1}},\n\nNew login to your account:\n\n📍 Location: {{2}}\n📱 Device: {{3}}\n🕐 Time: {{4}}\n\nNot you? Secure your account: {{5}}',
    variables: ['Customer Name', 'Location', 'Device', 'Time', 'Security URL'],
    tags: ['security', 'login', 'alert'],
    status: 'approved',
    downloads: 7800
  },

  // Notifications Templates (36-40)
  {
    id: 36,
    name: 'Event Reminder',
    category: 'Notifications',
    metaCategory: 'UTILITY',
    icon: 'Ticket',
    description: 'Remind attendees about upcoming events',
    body: '🎪 Event Reminder!\n\nHi {{1}},\n\n{{2}} is {{3}}!\n\n📅 {{4}} at {{5}}\n📍 {{6}}\n\n🎟️ Your ticket: {{7}}\n\nSee you there!',
    variables: ['Attendee Name', 'Event Name', 'Time Until', 'Date', 'Time', 'Venue', 'Ticket Link'],
    tags: ['event', 'reminder', 'ticket'],
    status: 'approved',
    downloads: 7200
  },
  {
    id: 37,
    name: 'Waitlist Confirmation',
    category: 'Notifications',
    metaCategory: 'UTILITY',
    icon: 'Clock',
    description: 'Confirm customers have joined a waitlist',
    body: '⏳ You\'re on the list!\n\nHi {{1}},\n\nYou\'ve joined the waitlist for {{2}}.\n\nPosition: #{{3}}\n\nWe\'ll notify you when it\'s your turn.\n\nTrack status: {{4}}',
    variables: ['Customer Name', 'Product/Service', 'Position', 'Status URL'],
    tags: ['waitlist', 'queue', 'confirmation'],
    status: 'approved',
    downloads: 4100
  },
  {
    id: 38,
    name: 'Account Verified',
    category: 'Notifications',
    metaCategory: 'UTILITY',
    icon: 'CheckCircle2',
    description: 'Confirm account verification completion',
    body: '✅ Account Verified!\n\nHi {{1}},\n\nCongratulations! Your account has been verified.\n\nYou now have access to:\n✓ {{2}}\n✓ {{3}}\n✓ {{4}}\n\nGet started: {{5}}',
    variables: ['Customer Name', 'Feature 1', 'Feature 2', 'Feature 3', 'Dashboard URL'],
    tags: ['verification', 'account', 'confirmed'],
    status: 'approved',
    downloads: 5600
  },
  {
    id: 39,
    name: 'Price Drop Alert',
    category: 'Notifications',
    metaCategory: 'MARKETING',
    icon: 'TrendingDown',
    description: 'Alert customers about price drops on wishlisted items',
    body: '📉 Price Drop!\n\nHi {{1}},\n\n{{2}} just got cheaper!\n\nWas: ₹{{3}}\nNow: ₹{{4}}\n\nYou save: ₹{{5}} ({{6}}% off)\n\nGrab it now: {{7}}',
    variables: ['Customer Name', 'Product Name', 'Old Price', 'New Price', 'Savings', 'Discount %', 'Product URL'],
    tags: ['price', 'alert', 'wishlist'],
    status: 'approved',
    downloads: 6300,
    isTrending: true
  },
  {
    id: 40,
    name: 'Document Ready',
    category: 'Notifications',
    metaCategory: 'UTILITY',
    icon: 'FileText',
    description: 'Notify when documents are ready for download',
    body: 'Hi {{1}},\n\n📄 Your document is ready!\n\nDocument: {{2}}\nType: {{3}}\n\nDownload now: {{4}}\n\nThis link expires in {{5}} days.\n\nQuestions? Reply here.',
    variables: ['Customer Name', 'Document Name', 'Document Type', 'Download URL', 'Expiry Days'],
    tags: ['document', 'ready', 'download'],
    status: 'approved',
    downloads: 4800
  },

  // Logistics Templates (41-43)
  {
    id: 41,
    name: 'Pickup Scheduled',
    category: 'Logistics',
    metaCategory: 'UTILITY',
    icon: 'Truck',
    description: 'Confirm pickup scheduling for returns/exchanges',
    body: 'Hi {{1}},\n\n📦 Pickup Scheduled!\n\nOrder #{{2}} pickup details:\n\n📅 Date: {{3}}\n⏰ Time Slot: {{4}}\n📍 Address: {{5}}\n\nReschedule: {{6}}',
    variables: ['Customer Name', 'Order ID', 'Date', 'Time Slot', 'Address', 'Reschedule URL'],
    tags: ['pickup', 'logistics', 'return'],
    status: 'approved',
    downloads: 4200
  },
  {
    id: 42,
    name: 'Out for Delivery',
    category: 'Logistics',
    metaCategory: 'UTILITY',
    icon: 'Navigation',
    description: 'Notify customers when package is out for delivery',
    body: '🚚 Out for Delivery!\n\nHi {{1}},\n\nYour order #{{2}} is out for delivery!\n\n📍 Current location: {{3}}\n⏰ ETA: {{4}}\n\nDelivery partner: {{5}} ({{6}})\n\nTrack live: {{7}}',
    variables: ['Customer Name', 'Order ID', 'Location', 'ETA', 'Partner Name', 'Phone', 'Track URL'],
    tags: ['delivery', 'out-for-delivery', 'tracking'],
    status: 'approved',
    downloads: 8900,
    isNew: true
  },
  {
    id: 43,
    name: 'Delivery Attempt Failed',
    category: 'Logistics',
    metaCategory: 'UTILITY',
    icon: 'AlertCircle',
    description: 'Notify about failed delivery attempts',
    body: 'Hi {{1}},\n\n⚠️ Delivery Attempt Failed\n\nWe tried to deliver order #{{2}} but couldn\'t reach you.\n\nReason: {{3}}\n\nReschedule delivery: {{4}}\n\nNext attempt: {{5}}\n\nNeed help? Reply here.',
    variables: ['Customer Name', 'Order ID', 'Reason', 'Reschedule URL', 'Next Attempt'],
    tags: ['delivery', 'failed', 'reschedule'],
    status: 'approved',
    downloads: 3600
  },

  // Food & Delivery Templates (44-46)
  {
    id: 44,
    name: 'Order Being Prepared',
    category: 'Food & Delivery',
    metaCategory: 'UTILITY',
    icon: 'ChefHat',
    description: 'Update customers when their food order is being prepared',
    body: '👨‍🍳 Preparing Your Order!\n\nHi {{1}},\n\nYour order #{{2}} is being prepared!\n\n🍽️ Items: {{3}}\n⏰ Ready in: {{4}} mins\n\n📍 Pickup at: {{5}}\n\nTrack: {{6}}',
    variables: ['Customer Name', 'Order ID', 'Items', 'Prep Time', 'Location', 'Track URL'],
    tags: ['food', 'preparation', 'order'],
    status: 'approved',
    downloads: 6700
  },
  {
    id: 45,
    name: 'Food Ready for Pickup',
    category: 'Food & Delivery',
    metaCategory: 'UTILITY',
    icon: 'UtensilsCrossed',
    description: 'Notify when food order is ready for pickup',
    body: '🎉 Your Order is Ready!\n\nHi {{1}},\n\nOrder #{{2}} is ready for pickup!\n\n📍 {{3}}\n🕐 Open until: {{4}}\n\nOrder Code: {{5}}\n\nEnjoy your meal! 🍽️',
    variables: ['Customer Name', 'Order ID', 'Restaurant Address', 'Closing Time', 'Pickup Code'],
    tags: ['food', 'ready', 'pickup'],
    status: 'approved',
    downloads: 5400
  },
  {
    id: 46,
    name: 'Table Reservation Confirmed',
    category: 'Food & Delivery',
    metaCategory: 'UTILITY',
    icon: 'Utensils',
    description: 'Confirm restaurant table reservations',
    body: '🍽️ Reservation Confirmed!\n\nHi {{1}},\n\nYour table is booked!\n\n📅 {{2}} at {{3}}\n👥 {{4}} guests\n📍 {{5}}\n\nReservation code: {{6}}\n\nModify: {{7}}',
    variables: ['Customer Name', 'Date', 'Time', 'Guest Count', 'Restaurant', 'Code', 'Modify URL'],
    tags: ['reservation', 'table', 'restaurant'],
    status: 'approved',
    downloads: 4800
  },

  // HR & Recruitment Templates (47-48)
  {
    id: 47,
    name: 'Interview Schedule',
    category: 'HR & Recruitment',
    metaCategory: 'UTILITY',
    icon: 'Briefcase',
    description: 'Schedule interviews with candidates',
    body: 'Hi {{1}},\n\n🎯 Interview Scheduled!\n\nPosition: {{2}}\n📅 Date: {{3}}\n⏰ Time: {{4}}\n📍 {{5}}\n\nInterviewer: {{6}}\n\nConfirm attendance: Reply YES\n\nGood luck! 🍀',
    variables: ['Candidate Name', 'Position', 'Date', 'Time', 'Location/Link', 'Interviewer Name'],
    tags: ['interview', 'recruitment', 'schedule'],
    status: 'approved',
    downloads: 3800
  },
  {
    id: 48,
    name: 'Offer Letter Sent',
    category: 'HR & Recruitment',
    metaCategory: 'UTILITY',
    icon: 'Award',
    description: 'Notify candidates about offer letters',
    body: '🎉 Congratulations {{1}}!\n\nWe\'re excited to offer you the position of {{2}} at {{3}}!\n\n📧 Your offer letter has been sent to: {{4}}\n\nPlease respond by: {{5}}\n\nQuestions? Reply here.\n\nWelcome to the team! 🙌',
    variables: ['Candidate Name', 'Position', 'Company', 'Email', 'Deadline'],
    tags: ['offer', 'recruitment', 'hr'],
    status: 'approved',
    downloads: 2900
  },

  // Healthcare Templates (49-50)
  {
    id: 49,
    name: 'Lab Report Ready',
    category: 'Healthcare',
    metaCategory: 'UTILITY',
    icon: 'Stethoscope',
    description: 'Notify patients when lab reports are ready',
    body: 'Hi {{1}},\n\n🏥 Lab Report Ready\n\nYour {{2}} report is now available.\n\nReport ID: {{3}}\nTest Date: {{4}}\n\n📥 Download: {{5}}\n\nFor medical advice, please consult your doctor.',
    variables: ['Patient Name', 'Test Name', 'Report ID', 'Test Date', 'Download URL'],
    tags: ['healthcare', 'lab', 'report'],
    status: 'approved',
    downloads: 5200
  },
  {
    id: 50,
    name: 'Prescription Reminder',
    category: 'Healthcare',
    metaCategory: 'UTILITY',
    icon: 'Pill',
    description: 'Remind patients about medication schedules',
    body: '💊 Medication Reminder\n\nHi {{1}},\n\nTime to take your medication:\n\n💊 {{2}}\n📋 Dosage: {{3}}\n⏰ Time: {{4}}\n\nRefill available at: {{5}}\n\nStay healthy! 🌟',
    variables: ['Patient Name', 'Medication', 'Dosage', 'Time', 'Pharmacy URL'],
    tags: ['healthcare', 'medication', 'reminder'],
    status: 'approved',
    downloads: 4100
  }
];

export const TEMPLATE_CATEGORIES = [
  { name: 'All', count: PRE_APPROVED_TEMPLATES.length },
  { name: 'E-commerce', count: PRE_APPROVED_TEMPLATES.filter(t => t.category === 'E-commerce').length },
  { name: 'Marketing', count: PRE_APPROVED_TEMPLATES.filter(t => t.category === 'Marketing').length },
  { name: 'Appointments', count: PRE_APPROVED_TEMPLATES.filter(t => t.category === 'Appointments').length },
  { name: 'Payments', count: PRE_APPROVED_TEMPLATES.filter(t => t.category === 'Payments').length },
  { name: 'Support', count: PRE_APPROVED_TEMPLATES.filter(t => t.category === 'Support').length },
  { name: 'Authentication', count: PRE_APPROVED_TEMPLATES.filter(t => t.category === 'Authentication').length },
  { name: 'Notifications', count: PRE_APPROVED_TEMPLATES.filter(t => t.category === 'Notifications').length },
  { name: 'Logistics', count: PRE_APPROVED_TEMPLATES.filter(t => t.category === 'Logistics').length },
  { name: 'Food & Delivery', count: PRE_APPROVED_TEMPLATES.filter(t => t.category === 'Food & Delivery').length },
  { name: 'HR & Recruitment', count: PRE_APPROVED_TEMPLATES.filter(t => t.category === 'HR & Recruitment').length },
  { name: 'Healthcare', count: PRE_APPROVED_TEMPLATES.filter(t => t.category === 'Healthcare').length },
];
