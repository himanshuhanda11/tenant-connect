import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Building2, 
  GraduationCap, 
  Heart, 
  Plane, 
  Home, 
  Briefcase, 
  Truck, 
  Headphones,
  ShoppingCart,
  Stethoscope,
  Scale,
  Utensils,
  Car,
  Sparkles,
  ChevronRight,
  Copy,
  Banknote,
  Hotel,
  Dumbbell,
  Wrench
} from 'lucide-react';
import { IndustryPack, IndustryTemplate, TemplateCategory } from '@/types/template';

interface IndustryPacksProps {
  onUseTemplate: (template: IndustryTemplate) => void;
}

const INDUSTRY_PACKS: IndustryPack[] = [
  {
    id: 'real-estate',
    name: 'Real Estate',
    icon: 'Home',
    description: 'Property listings, viewings, and client communication',
    templates: [
      {
        name: 'property_viewing_confirmation',
        category: 'UTILITY',
        language: 'en',
        header_type: 'text',
        header_content: 'Viewing Confirmed ✅',
        body: 'Hi {{1}}, your property viewing is confirmed:\n\n🏠 Property: {{2}}\n📍 Address: {{3}}\n📅 Date: {{4}}\n⏰ Time: {{5}}\n\nOur agent {{6}} will meet you there. Reply if you need to reschedule.',
        footer: 'Real Estate Co.',
        variables: ['customer_name', 'property_name', 'address', 'date', 'time', 'agent_name'],
        buttons: [
          { type: 'QUICK_REPLY', text: 'Confirm' },
          { type: 'QUICK_REPLY', text: 'Reschedule' }
        ]
      },
      {
        name: 'new_listing_alert',
        category: 'MARKETING',
        language: 'en',
        header_type: 'image',
        body: '🏡 New Property Alert!\n\n{{1}} in {{2}} is now available.\n\n💰 Price: {{3}}\n🛏️ Bedrooms: {{4}}\n📐 Size: {{5}} sq ft\n\nInterested? Schedule a viewing today!',
        footer: 'Reply STOP to unsubscribe',
        variables: ['property_type', 'location', 'price', 'bedrooms', 'size'],
        buttons: [
          { type: 'URL', text: 'View Property', url: 'https://example.com' },
          { type: 'QUICK_REPLY', text: 'Schedule Viewing' }
        ]
      },
      {
        name: 'payment_receipt_property',
        category: 'UTILITY',
        language: 'en',
        header_type: 'none',
        body: 'Hi {{1}}, we have received your payment.\n\n💰 Amount: {{2}}\n📋 Property: {{3}}\n🧾 Receipt #: {{4}}\n📅 Date: {{5}}\n\nThank you for your payment. Contact us for any queries.',
        footer: 'Real Estate Co.',
        variables: ['customer_name', 'amount', 'property_name', 'receipt_number', 'date']
      }
    ]
  },
  {
    id: 'healthcare',
    name: 'Healthcare & Clinics',
    icon: 'Stethoscope',
    description: 'Appointment reminders and patient communication',
    templates: [
      {
        name: 'appointment_reminder',
        category: 'UTILITY',
        language: 'en',
        header_type: 'text',
        header_content: 'Appointment Reminder',
        body: 'Hi {{1}}, this is a reminder of your upcoming appointment:\n\n👨‍⚕️ Doctor: Dr. {{2}}\n📅 Date: {{3}}\n⏰ Time: {{4}}\n📍 Location: {{5}}\n\nPlease arrive 15 minutes early. Bring your ID and insurance card.',
        footer: 'HealthCare Clinic',
        variables: ['patient_name', 'doctor_name', 'date', 'time', 'location'],
        buttons: [
          { type: 'QUICK_REPLY', text: 'Confirm' },
          { type: 'QUICK_REPLY', text: 'Reschedule' }
        ]
      },
      {
        name: 'prescription_ready',
        category: 'UTILITY',
        language: 'en',
        header_type: 'none',
        body: 'Hello {{1}}, your prescription is ready for pickup at {{2}}.\n\nPrescription #: {{3}}\nMedication: {{4}}\n\nPharmacy hours: {{5}}\n\nPlease bring a valid ID for pickup.',
        footer: 'HealthCare Pharmacy',
        variables: ['patient_name', 'pharmacy_name', 'prescription_number', 'medication', 'hours']
      },
      {
        name: 'lab_results_ready',
        category: 'UTILITY',
        language: 'en',
        header_type: 'text',
        header_content: 'Lab Results Available',
        body: 'Hi {{1}}, your lab results for {{2}} are now available.\n\n🔬 Test: {{2}}\n📅 Date: {{3}}\n\nPlease visit our clinic or log in to the patient portal to view your results.',
        footer: 'HealthCare Clinic',
        variables: ['patient_name', 'test_name', 'test_date'],
        buttons: [
          { type: 'URL', text: 'View Results', url: 'https://example.com/results' }
        ]
      }
    ]
  },
  {
    id: 'logistics',
    name: 'Logistics & Delivery',
    icon: 'Truck',
    description: 'Shipping updates and delivery notifications',
    templates: [
      {
        name: 'order_shipped',
        category: 'UTILITY',
        language: 'en',
        header_type: 'text',
        header_content: '📦 Order Shipped!',
        body: 'Hi {{1}}, great news! Your order #{{2}} has been shipped.\n\n🚚 Carrier: {{3}}\n📍 Tracking: {{4}}\n📅 Est. Delivery: {{5}}\n\nTrack your package for real-time updates.',
        variables: ['customer_name', 'order_number', 'carrier', 'tracking_number', 'delivery_date'],
        buttons: [
          { type: 'URL', text: 'Track Package', url: 'https://example.com/track' }
        ]
      },
      {
        name: 'out_for_delivery',
        category: 'UTILITY',
        language: 'en',
        header_type: 'none',
        body: '🚛 Out for Delivery!\n\nHi {{1}}, your package is out for delivery today.\n\nOrder #: {{2}}\nEst. Time: {{3}}\n\nPlease ensure someone is available to receive the package.',
        variables: ['customer_name', 'order_number', 'estimated_time'],
        buttons: [
          { type: 'QUICK_REPLY', text: "I'm Home" },
          { type: 'QUICK_REPLY', text: 'Leave at Door' }
        ]
      },
      {
        name: 'delivery_completed',
        category: 'UTILITY',
        language: 'en',
        header_type: 'none',
        body: 'Hi {{1}}, your order #{{2}} has been delivered successfully.\n\n📍 Delivered to: {{3}}\n📅 Date: {{4}}\n\nWe hope you enjoy your purchase! Rate your experience.',
        variables: ['customer_name', 'order_number', 'delivery_address', 'date'],
        buttons: [
          { type: 'QUICK_REPLY', text: '⭐ Rate' },
          { type: 'QUICK_REPLY', text: 'Report Issue' }
        ]
      }
    ]
  },
  {
    id: 'recruitment',
    name: 'Recruitment & HR',
    icon: 'Briefcase',
    description: 'Interview scheduling and candidate communication',
    templates: [
      {
        name: 'interview_invitation',
        category: 'UTILITY',
        language: 'en',
        header_type: 'text',
        header_content: '🎉 Interview Invitation',
        body: "Hi {{1}}, congratulations! You've been selected for an interview.\n\n💼 Position: {{2}}\n📅 Date: {{3}}\n⏰ Time: {{4}}\n📍 Location: {{5}}\n👤 Interviewer: {{6}}\n\nPlease confirm your attendance.",
        footer: 'HR Department',
        variables: ['candidate_name', 'position', 'date', 'time', 'location', 'interviewer'],
        buttons: [
          { type: 'QUICK_REPLY', text: 'Confirm' },
          { type: 'QUICK_REPLY', text: 'Request Reschedule' }
        ]
      },
      {
        name: 'application_status',
        category: 'UTILITY',
        language: 'en',
        header_type: 'none',
        body: 'Hi {{1}}, we have an update on your application for {{2}}.\n\nStatus: {{3}}\n\n{{4}}\n\nThank you for your interest in joining our team.',
        footer: 'Talent Acquisition',
        variables: ['candidate_name', 'position', 'status', 'message']
      },
      {
        name: 'offer_letter_notification',
        category: 'UTILITY',
        language: 'en',
        header_type: 'text',
        header_content: '🎉 Job Offer',
        body: 'Congratulations {{1}}!\n\nWe are pleased to offer you the position of {{2}} at {{3}}.\n\n💰 Package: {{4}}\n📅 Start Date: {{5}}\n\nPlease review and respond within 48 hours.',
        footer: 'HR Department',
        variables: ['candidate_name', 'position', 'company_name', 'package', 'start_date'],
        buttons: [
          { type: 'QUICK_REPLY', text: 'Accept' },
          { type: 'QUICK_REPLY', text: 'Discuss' }
        ]
      }
    ]
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce',
    icon: 'ShoppingCart',
    description: 'Order updates and promotional campaigns',
    templates: [
      {
        name: 'order_confirmation',
        category: 'UTILITY',
        language: 'en',
        header_type: 'text',
        header_content: '✅ Order Confirmed',
        body: "Thank you {{1}}! Your order has been confirmed.\n\n🛍️ Order #: {{2}}\n💰 Total: {{3}}\n📦 Items: {{4}}\n\nYou'll receive tracking info once shipped.",
        footer: 'Shop with us again!',
        variables: ['customer_name', 'order_number', 'total', 'items'],
        buttons: [
          { type: 'URL', text: 'View Order', url: 'https://example.com/orders' }
        ]
      },
      {
        name: 'flash_sale',
        category: 'MARKETING',
        language: 'en',
        header_type: 'image',
        body: "⚡ FLASH SALE ⚡\n\nHi {{1}}! Don't miss our biggest sale of the season.\n\n🏷️ Up to {{2}}% OFF\n⏰ Ends: {{3}}\n\nUse code: {{4}} at checkout.",
        footer: 'Reply STOP to unsubscribe',
        variables: ['customer_name', 'discount', 'end_date', 'promo_code'],
        buttons: [
          { type: 'URL', text: 'Shop Now', url: 'https://example.com/sale' }
        ]
      },
      {
        name: 'abandoned_cart_reminder',
        category: 'MARKETING',
        language: 'en',
        header_type: 'none',
        body: 'Hi {{1}}, you left items in your cart!\n\n🛒 {{2}}\n💰 Total: {{3}}\n\nComplete your purchase now and get {{4}}% off with code {{5}}.',
        footer: 'Reply STOP to unsubscribe',
        variables: ['customer_name', 'items', 'total', 'discount', 'promo_code'],
        buttons: [
          { type: 'URL', text: 'Complete Purchase', url: 'https://example.com/cart' }
        ]
      },
      {
        name: 'refund_processed',
        category: 'UTILITY',
        language: 'en',
        header_type: 'none',
        body: 'Hi {{1}}, your refund has been processed.\n\n🧾 Order #: {{2}}\n💰 Refund Amount: {{3}}\n🏦 Credited to: {{4}}\n📅 Expected by: {{5}}\n\nThank you for your patience.',
        variables: ['customer_name', 'order_number', 'amount', 'payment_method', 'expected_date']
      }
    ]
  },
  {
    id: 'education',
    name: 'Education',
    icon: 'GraduationCap',
    description: 'Class reminders and student communication',
    templates: [
      {
        name: 'class_reminder',
        category: 'UTILITY',
        language: 'en',
        header_type: 'text',
        header_content: '📚 Class Reminder',
        body: 'Hi {{1}}, your next class starts soon:\n\n📖 Subject: {{2}}\n👨‍🏫 Instructor: {{3}}\n📅 Date: {{4}}\n⏰ Time: {{5}}\n🔗 Meeting Link: {{6}}',
        variables: ['student_name', 'subject', 'instructor', 'date', 'time', 'meeting_link'],
        buttons: [
          { type: 'URL', text: 'Join Class', url: 'https://example.com/class' }
        ]
      },
      {
        name: 'fee_reminder',
        category: 'UTILITY',
        language: 'en',
        header_type: 'none',
        body: 'Hi {{1}}, this is a reminder that your tuition fee payment is due.\n\n💰 Amount: {{2}}\n📅 Due Date: {{3}}\n📝 Invoice #: {{4}}\n\nPay online or visit our office.',
        footer: 'Thank you',
        variables: ['student_name', 'amount', 'due_date', 'invoice_number'],
        buttons: [
          { type: 'URL', text: 'Pay Now', url: 'https://example.com/pay' }
        ]
      },
      {
        name: 'exam_schedule',
        category: 'UTILITY',
        language: 'en',
        header_type: 'text',
        header_content: '📝 Exam Schedule',
        body: 'Hi {{1}}, your upcoming exam details:\n\n📖 Subject: {{2}}\n📅 Date: {{3}}\n⏰ Time: {{4}}\n📍 Venue: {{5}}\n🪪 Seat No: {{6}}\n\nAll the best!',
        variables: ['student_name', 'subject', 'date', 'time', 'venue', 'seat_number']
      },
      {
        name: 'admission_confirmation',
        category: 'UTILITY',
        language: 'en',
        header_type: 'text',
        header_content: '🎉 Admission Confirmed',
        body: 'Congratulations {{1}}!\n\nYour admission to {{2}} has been confirmed.\n\n📋 Course: {{3}}\n📅 Start Date: {{4}}\n💰 Fee: {{5}}\n\nWelcome aboard!',
        variables: ['student_name', 'institution', 'course', 'start_date', 'fee'],
        buttons: [
          { type: 'URL', text: 'Complete Registration', url: 'https://example.com/register' }
        ]
      }
    ]
  },
  {
    id: 'immigration',
    name: 'Immigration & Visa',
    icon: 'Plane',
    description: 'Visa updates, document reminders, and client follow-ups',
    templates: [
      {
        name: 'visa_application_update',
        category: 'UTILITY',
        language: 'en',
        header_type: 'text',
        header_content: '📋 Application Update',
        body: 'Hi {{1}}, here is an update on your visa application.\n\n🌍 Country: {{2}}\n📄 Visa Type: {{3}}\n📊 Status: {{4}}\n📅 Updated: {{5}}\n\nOur consultant {{6}} will contact you for next steps.',
        footer: 'Immigration Services',
        variables: ['client_name', 'country', 'visa_type', 'status', 'date', 'consultant_name'],
        buttons: [
          { type: 'QUICK_REPLY', text: 'Call Me' },
          { type: 'QUICK_REPLY', text: 'Thank You' }
        ]
      },
      {
        name: 'document_checklist',
        category: 'UTILITY',
        language: 'en',
        header_type: 'none',
        body: 'Hi {{1}}, please prepare the following documents for your {{2}} application:\n\n📝 {{3}}\n\n📅 Submission Deadline: {{4}}\n\nUpload documents through our portal or visit our office.',
        variables: ['client_name', 'visa_type', 'document_list', 'deadline'],
        buttons: [
          { type: 'URL', text: 'Upload Documents', url: 'https://example.com/upload' }
        ]
      },
      {
        name: 'passport_collection_ready',
        category: 'UTILITY',
        language: 'en',
        header_type: 'text',
        header_content: '✅ Passport Ready',
        body: 'Hi {{1}}, great news! Your passport with {{2}} visa is ready for collection.\n\n📍 Office: {{3}}\n⏰ Hours: {{4}}\n\nPlease bring your ID and receipt for collection.',
        variables: ['client_name', 'visa_type', 'office_address', 'office_hours']
      }
    ]
  },
  {
    id: 'finance',
    name: 'Banking & Finance',
    icon: 'Banknote',
    description: 'Transaction alerts, account updates, and reminders',
    templates: [
      {
        name: 'transaction_alert',
        category: 'UTILITY',
        language: 'en',
        header_type: 'none',
        body: 'Hi {{1}}, a transaction has been recorded on your account.\n\n💳 Type: {{2}}\n💰 Amount: {{3}}\n📅 Date: {{4}}\n💼 Balance: {{5}}\n\nIf you did not authorize this, call us immediately.',
        variables: ['customer_name', 'transaction_type', 'amount', 'date', 'balance'],
        buttons: [
          { type: 'PHONE_NUMBER', text: 'Call Support', phone_number: '+1234567890' }
        ]
      },
      {
        name: 'payment_due_reminder',
        category: 'UTILITY',
        language: 'en',
        header_type: 'text',
        header_content: '⏰ Payment Reminder',
        body: 'Hi {{1}}, your payment is due soon.\n\n📋 Account: {{2}}\n💰 Amount Due: {{3}}\n📅 Due Date: {{4}}\n\nPlease make the payment to avoid late charges.',
        variables: ['customer_name', 'account_number', 'amount', 'due_date'],
        buttons: [
          { type: 'URL', text: 'Pay Now', url: 'https://example.com/pay' }
        ]
      },
      {
        name: 'loan_approval',
        category: 'UTILITY',
        language: 'en',
        header_type: 'text',
        header_content: '✅ Loan Approved',
        body: 'Congratulations {{1}}! Your loan application has been approved.\n\n💰 Approved Amount: {{2}}\n📊 Interest Rate: {{3}}\n📅 EMI Start Date: {{4}}\n📋 Loan ID: {{5}}\n\nVisit our branch to complete the formalities.',
        variables: ['customer_name', 'amount', 'interest_rate', 'emi_start_date', 'loan_id']
      }
    ]
  },
  {
    id: 'hospitality',
    name: 'Hotels & Travel',
    icon: 'Hotel',
    description: 'Booking confirmations and guest communication',
    templates: [
      {
        name: 'booking_confirmation',
        category: 'UTILITY',
        language: 'en',
        header_type: 'text',
        header_content: '🏨 Booking Confirmed',
        body: 'Hi {{1}}, your booking is confirmed!\n\n🏨 Hotel: {{2}}\n📅 Check-in: {{3}}\n📅 Check-out: {{4}}\n🛏️ Room: {{5}}\n💰 Total: {{6}}\n\nWe look forward to hosting you!',
        variables: ['guest_name', 'hotel_name', 'checkin_date', 'checkout_date', 'room_type', 'total'],
        buttons: [
          { type: 'QUICK_REPLY', text: 'Special Requests' }
        ]
      },
      {
        name: 'checkout_reminder',
        category: 'UTILITY',
        language: 'en',
        header_type: 'none',
        body: 'Hi {{1}}, this is a reminder that checkout is tomorrow.\n\n⏰ Checkout Time: {{2}}\n🧾 Bill: {{3}}\n\nWould you like late checkout or need any assistance?',
        variables: ['guest_name', 'checkout_time', 'bill_amount'],
        buttons: [
          { type: 'QUICK_REPLY', text: 'Late Checkout' },
          { type: 'QUICK_REPLY', text: 'All Good' }
        ]
      }
    ]
  },
  {
    id: 'fitness',
    name: 'Fitness & Wellness',
    icon: 'Dumbbell',
    description: 'Class bookings, membership, and wellness reminders',
    templates: [
      {
        name: 'class_booking_confirmation',
        category: 'UTILITY',
        language: 'en',
        header_type: 'none',
        body: 'Hi {{1}}, your fitness class is booked!\n\n🏋️ Class: {{2}}\n👤 Trainer: {{3}}\n📅 Date: {{4}}\n⏰ Time: {{5}}\n📍 Location: {{6}}\n\nSee you there!',
        variables: ['member_name', 'class_name', 'trainer', 'date', 'time', 'location'],
        buttons: [
          { type: 'QUICK_REPLY', text: 'Cancel Class' }
        ]
      },
      {
        name: 'membership_renewal',
        category: 'UTILITY',
        language: 'en',
        header_type: 'text',
        header_content: '🔄 Membership Renewal',
        body: 'Hi {{1}}, your membership expires on {{2}}.\n\n📋 Plan: {{3}}\n💰 Renewal Price: {{4}}\n\nRenew now to continue enjoying our facilities without interruption.',
        variables: ['member_name', 'expiry_date', 'plan_name', 'price'],
        buttons: [
          { type: 'URL', text: 'Renew Now', url: 'https://example.com/renew' }
        ]
      }
    ]
  },
  {
    id: 'automotive',
    name: 'Automotive & Services',
    icon: 'Car',
    description: 'Service reminders, bookings, and updates',
    templates: [
      {
        name: 'service_reminder',
        category: 'UTILITY',
        language: 'en',
        header_type: 'none',
        body: 'Hi {{1}}, your vehicle {{2}} is due for service.\n\n🔧 Service Type: {{3}}\n📅 Recommended Date: {{4}}\n📍 Service Center: {{5}}\n\nBook your appointment today!',
        variables: ['customer_name', 'vehicle', 'service_type', 'date', 'service_center'],
        buttons: [
          { type: 'QUICK_REPLY', text: 'Book Now' },
          { type: 'PHONE_NUMBER', text: 'Call Us', phone_number: '+1234567890' }
        ]
      },
      {
        name: 'vehicle_ready_pickup',
        category: 'UTILITY',
        language: 'en',
        header_type: 'text',
        header_content: '✅ Vehicle Ready',
        body: 'Hi {{1}}, your vehicle {{2}} is ready for pickup!\n\n🔧 Service: {{3}}\n💰 Total Bill: {{4}}\n📍 Location: {{5}}\n\nPlease collect your vehicle during business hours.',
        variables: ['customer_name', 'vehicle', 'service_done', 'bill_amount', 'location']
      }
    ]
  },
  {
    id: 'restaurant',
    name: 'Food & Restaurant',
    icon: 'Utensils',
    description: 'Reservations, orders, and promotions',
    templates: [
      {
        name: 'reservation_confirmation',
        category: 'UTILITY',
        language: 'en',
        header_type: 'none',
        body: 'Hi {{1}}, your table reservation is confirmed!\n\n🍽️ Restaurant: {{2}}\n📅 Date: {{3}}\n⏰ Time: {{4}}\n👥 Guests: {{5}}\n\nWe look forward to serving you!',
        variables: ['customer_name', 'restaurant_name', 'date', 'time', 'guest_count'],
        buttons: [
          { type: 'QUICK_REPLY', text: 'Cancel' },
          { type: 'QUICK_REPLY', text: 'Modify' }
        ]
      },
      {
        name: 'order_ready_pickup',
        category: 'UTILITY',
        language: 'en',
        header_type: 'text',
        header_content: '🍕 Order Ready!',
        body: 'Hi {{1}}, your order #{{2}} is ready for pickup!\n\n📍 Location: {{3}}\n⏰ Pickup by: {{4}}\n\nShow your order number at the counter.',
        variables: ['customer_name', 'order_number', 'location', 'pickup_time']
      },
      {
        name: 'weekly_special_promo',
        category: 'MARKETING',
        language: 'en',
        header_type: 'image',
        body: "Hi {{1}}! 🍽️\n\nThis week's special at {{2}}:\n\n⭐ {{3}}\n💰 Only {{4}}\n📅 Available till: {{5}}\n\nReserve your table now!",
        footer: 'Reply STOP to unsubscribe',
        variables: ['customer_name', 'restaurant_name', 'dish_name', 'price', 'end_date'],
        buttons: [
          { type: 'QUICK_REPLY', text: 'Reserve Table' }
        ]
      }
    ]
  },
  {
    id: 'legal',
    name: 'Legal Services',
    icon: 'Scale',
    description: 'Case updates and client communication',
    templates: [
      {
        name: 'case_status_update',
        category: 'UTILITY',
        language: 'en',
        header_type: 'none',
        body: 'Hi {{1}}, here is an update on your case.\n\n📋 Case #: {{2}}\n📊 Status: {{3}}\n📅 Next Hearing: {{4}}\n👤 Attorney: {{5}}\n\nPlease contact us if you have questions.',
        variables: ['client_name', 'case_number', 'status', 'next_hearing_date', 'attorney_name'],
        buttons: [
          { type: 'PHONE_NUMBER', text: 'Call Attorney', phone_number: '+1234567890' }
        ]
      },
      {
        name: 'consultation_reminder',
        category: 'UTILITY',
        language: 'en',
        header_type: 'text',
        header_content: '📋 Consultation Reminder',
        body: 'Hi {{1}}, you have a legal consultation scheduled.\n\n👤 Attorney: {{2}}\n📅 Date: {{3}}\n⏰ Time: {{4}}\n📍 Location: {{5}}\n\nPlease bring all relevant documents.',
        variables: ['client_name', 'attorney_name', 'date', 'time', 'location'],
        buttons: [
          { type: 'QUICK_REPLY', text: 'Confirm' },
          { type: 'QUICK_REPLY', text: 'Reschedule' }
        ]
      }
    ]
  },
  {
    id: 'customer-support',
    name: 'Customer Support',
    icon: 'Headphones',
    description: 'Support tickets, feedback, and follow-ups',
    templates: [
      {
        name: 'ticket_created',
        category: 'UTILITY',
        language: 'en',
        header_type: 'none',
        body: 'Hi {{1}}, your support ticket has been created.\n\n🎫 Ticket #: {{2}}\n📋 Subject: {{3}}\n📊 Priority: {{4}}\n\nOur team will respond within {{5}}. Thank you for your patience.',
        variables: ['customer_name', 'ticket_number', 'subject', 'priority', 'response_time']
      },
      {
        name: 'ticket_resolved',
        category: 'UTILITY',
        language: 'en',
        header_type: 'text',
        header_content: '✅ Issue Resolved',
        body: 'Hi {{1}}, your support ticket #{{2}} has been resolved.\n\n📋 Resolution: {{3}}\n\nPlease let us know if you need further assistance.',
        variables: ['customer_name', 'ticket_number', 'resolution'],
        buttons: [
          { type: 'QUICK_REPLY', text: 'Reopen Ticket' },
          { type: 'QUICK_REPLY', text: 'Satisfied ✅' }
        ]
      },
      {
        name: 'feedback_request',
        category: 'UTILITY',
        language: 'en',
        header_type: 'none',
        body: 'Hi {{1}}, thank you for contacting us regarding {{2}}.\n\nWe would love your feedback on the support you received from {{3}}.\n\nHow would you rate your experience?',
        variables: ['customer_name', 'subject', 'agent_name'],
        buttons: [
          { type: 'QUICK_REPLY', text: '⭐ Excellent' },
          { type: 'QUICK_REPLY', text: '👍 Good' },
          { type: 'QUICK_REPLY', text: '👎 Poor' }
        ]
      }
    ]
  }
];

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2, GraduationCap, Heart, Plane, Home, Briefcase, Truck, Headphones,
  ShoppingCart, Stethoscope, Scale, Utensils, Car, Sparkles, Banknote, Hotel, Dumbbell, Wrench
};

export function IndustryPacks({ onUseTemplate }: IndustryPacksProps) {
  const [selectedPack, setSelectedPack] = useState<IndustryPack | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<IndustryTemplate | null>(null);

  const getCategoryBadge = (category: TemplateCategory) => {
    switch (category) {
      case 'UTILITY':
        return <Badge className="bg-green-500">🟢 Utility</Badge>;
      case 'MARKETING':
        return <Badge className="bg-blue-500">🔵 Marketing</Badge>;
      case 'AUTHENTICATION':
        return <Badge className="bg-purple-500">🟣 Authentication</Badge>;
    }
  };

  const getIcon = (iconName: string) => {
    const IconComponent = ICON_MAP[iconName];
    return IconComponent ? <IconComponent className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />;
  };

  const totalTemplates = INDUSTRY_PACKS.reduce((sum, p) => sum + p.templates.length, 0);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Industry Template Packs
            <Badge variant="secondary" className="ml-2">{totalTemplates} templates</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Pre-built templates designed for high approval rates. Variable samples are auto-filled for faster Meta approval.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {INDUSTRY_PACKS.map((pack) => (
              <button
                key={pack.id}
                onClick={() => setSelectedPack(pack)}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {getIcon(pack.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{pack.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {pack.templates.length} templates
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pack Details Dialog */}
      <Dialog open={!!selectedPack} onOpenChange={() => setSelectedPack(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedPack && getIcon(selectedPack.icon)}
              {selectedPack?.name} Templates
            </DialogTitle>
            <DialogDescription>
              {selectedPack?.description}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {selectedPack?.templates.map((template, index) => (
                <div 
                  key={index}
                  className="p-4 border rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{template.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getCategoryBadge(template.category)}
                        <Badge variant="outline">{template.language.toUpperCase()}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setPreviewTemplate(template)}
                      >
                        Preview
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => {
                          onUseTemplate(template);
                          setSelectedPack(null);
                        }}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Use
                      </Button>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded p-3 text-sm">
                    <p className="whitespace-pre-wrap line-clamp-3">{template.body}</p>
                  </div>

                  {template.variables && (
                    <div className="flex flex-wrap gap-1">
                      {template.variables.map((v, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {`{{${i + 1}}}`} = {v}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Template Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
          </DialogHeader>

          {previewTemplate && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {getCategoryBadge(previewTemplate.category)}
                <Badge variant="outline">{previewTemplate.language.toUpperCase()}</Badge>
              </div>

              {previewTemplate.header_content && (
                <div className="font-semibold">{previewTemplate.header_content}</div>
              )}

              <div className="bg-muted rounded-lg p-4">
                <p className="whitespace-pre-wrap text-sm">{previewTemplate.body}</p>
              </div>

              {previewTemplate.footer && (
                <p className="text-xs text-muted-foreground">{previewTemplate.footer}</p>
              )}

              {previewTemplate.buttons && previewTemplate.buttons.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Buttons:</p>
                  {previewTemplate.buttons.map((btn, i) => (
                    <Badge key={i} variant="outline" className="mr-2">
                      {btn.text}
                    </Badge>
                  ))}
                </div>
              )}

              <Button 
                className="w-full"
                onClick={() => {
                  onUseTemplate(previewTemplate);
                  setPreviewTemplate(null);
                  setSelectedPack(null);
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Use This Template
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
