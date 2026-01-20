import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowLeft, ArrowRight, TrendingUp, Clock, CheckCircle2, XCircle,
  Zap, Brain, BarChart3, Target, Sparkles, Star, Globe, Activity,
  Users, Home, Shield, Briefcase, Building2, Quote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SeoMeta from '@/components/seo/SeoMeta';

// Full case study data
const caseStudiesData: Record<string, {
  id: string;
  company: string;
  industry: string;
  region: string;
  useCase: string;
  volume: string;
  icon: typeof Home;
  color: string;
  challenge: {
    summary: string;
    points: string[];
    quote: string;
  };
  solution: {
    summary: string;
    features: string[];
  };
  results: {
    timeframe: string;
    metrics: Array<{ label: string; value: string; icon: typeof TrendingUp; color: string }>;
  };
  aiInsight: string;
  testimonial: {
    quote: string;
    author: string;
    role: string;
    rating: number;
  };
  fullStory: string;
}> = {
  'homefind-realty': {
    id: 'homefind-realty',
    company: 'HomeFind Realty',
    industry: 'Real Estate',
    region: 'India',
    useCase: 'Property Inquiry Automation',
    volume: '15,000+ messages/month',
    icon: Home,
    color: 'from-orange-500 to-red-500',
    challenge: {
      summary: 'The real estate agency was losing valuable leads due to slow response times and manual processes.',
      points: [
        'Agents responding too slowly to hot leads',
        'No tracking of which properties interested buyers',
        'Lost leads to faster competitors',
        'Manual site visit scheduling causing delays'
      ],
      quote: 'By the time our agents responded, buyers had already talked to three other brokers.'
    },
    solution: {
      summary: 'AiReatro transformed their property inquiry process:',
      features: [
        'Instant property info via WhatsApp catalog',
        'AI qualification with budget/location matching',
        'Automated site visit scheduling',
        'Agent performance tracking',
        'Peak hour smart routing',
        'Follow-up automation for interested buyers'
      ]
    },
    results: {
      timeframe: 'Within 45 Days',
      metrics: [
        { label: 'Conversion Rate', value: '+31%', icon: TrendingUp, color: 'green' },
        { label: 'Cost per Lead', value: '-22%', icon: Target, color: 'blue' },
        { label: 'Flow Drop-off', value: '-35%', icon: Activity, color: 'purple' },
        { label: 'Agent Productivity', value: '2.5x', icon: Users, color: 'orange' }
      ]
    },
    aiInsight: 'AI detected peak inquiry times (7-9 PM) when agents were offline. Implementing smart routing to available agents increased response rate by 78%.',
    testimonial: {
      quote: 'We now respond to every serious inquiry within 2 minutes. Our competition cannot match that.',
      author: 'Neha Kapoor',
      role: 'Sales Director',
      rating: 5
    },
    fullStory: `HomeFind Realty, a mid-sized real estate agency operating across multiple cities in India, was facing a critical challenge in the highly competitive property market. With the rise of digital-first home buyers, the agency found itself struggling to keep pace with customer expectations for instant responses.

The agency was receiving hundreds of property inquiries daily through various channels, but their WhatsApp inquiries—which constituted 60% of all leads—were being handled manually. Agents would often take 4-6 hours to respond, by which time potential buyers had already moved on to competitors.

"We were bleeding leads," recalls Neha Kapoor, Sales Director at HomeFind Realty. "Our agents were overwhelmed, and we had no visibility into which properties were generating interest or why buyers were dropping off."

The implementation of AiReatro brought immediate changes. Within the first week, the agency set up automated property catalogs on WhatsApp, allowing buyers to browse listings instantly. The AI-powered qualification system began matching buyers with properties based on their budget, preferred location, and requirements.

The real game-changer was the smart routing feature. AiReatro's AI detected that 45% of property inquiries came between 7-9 PM—precisely when most agents were offline. The system automatically routed these queries to available agents or scheduled callbacks, ensuring no lead went cold.

Within 45 days of implementation, HomeFind Realty saw a 31% increase in conversion rates and a 78% improvement in response times. The agency now responds to every serious inquiry within 2 minutes, a feat that has given them a significant competitive advantage in the market.

"AiReatro didn't just automate our WhatsApp—it revolutionized how we sell properties. We can now handle 3x the volume with the same team, and our customers love the instant responses," says Kapoor.`
  },
  'quickserve-restaurants': {
    id: 'quickserve-restaurants',
    company: 'QuickServe Restaurants',
    industry: 'Services',
    region: 'UAE',
    useCase: 'Order & Reservation Flow',
    volume: '25,000+ messages/month',
    icon: Briefcase,
    color: 'from-amber-500 to-orange-500',
    challenge: {
      summary: 'The restaurant chain struggled with managing reservations and orders across multiple locations.',
      points: [
        'High call volume overwhelming staff',
        'Manual reservation system causing errors',
        'No-shows costing revenue',
        'Limited visibility into customer preferences'
      ],
      quote: 'Our staff spent more time on phones than serving customers. Something had to change.'
    },
    solution: {
      summary: 'AiReatro streamlined their entire customer communication:',
      features: [
        'WhatsApp-based reservation system',
        'Automated order confirmations',
        'Smart reminder system for bookings',
        'Customer preference tracking',
        'Multi-location routing',
        'Feedback collection automation'
      ]
    },
    results: {
      timeframe: 'Within 30 Days',
      metrics: [
        { label: 'Bookings Increase', value: '+45%', icon: TrendingUp, color: 'green' },
        { label: 'No-Show Rate', value: '-62%', icon: Activity, color: 'blue' },
        { label: 'Staff Time Saved', value: '4hrs/day', icon: Clock, color: 'purple' },
        { label: 'Customer Satisfaction', value: '+38%', icon: Star, color: 'orange' }
      ]
    },
    aiInsight: 'AI identified that customers who received a reminder 2 hours before their reservation had 85% lower no-show rates. Automated reminders now prevent revenue loss.',
    testimonial: {
      quote: 'Our staff can finally focus on hospitality instead of answering phones. Reservations are up, no-shows are down.',
      author: 'Khalid Al-Rashid',
      role: 'Operations Manager',
      rating: 5
    },
    fullStory: `QuickServe Restaurants operates a chain of 12 casual dining establishments across the UAE, serving over 3,000 customers daily. With their popularity came a significant operational challenge: managing the flood of reservation requests and orders that came through various channels.

Before AiReatro, the restaurant chain relied on a traditional phone-based system for reservations. During peak hours, staff members were overwhelmed with calls, leading to missed reservations, booking errors, and frustrated customers. The no-show rate had climbed to 28%, costing the business thousands of dirhams in lost revenue weekly.

"Our staff spent more time on phones than serving customers," explains Khalid Al-Rashid, Operations Manager. "We needed a solution that could handle the volume without compromising on customer experience."

The implementation of AiReatro transformed QuickServe's operations within weeks. Customers could now make reservations, modify bookings, and even pre-order their meals—all through WhatsApp. The AI-powered system intelligently routed requests to the appropriate location and provided instant confirmations.

The smart reminder system proved to be a game-changer. AiReatro's AI analyzed customer behavior and discovered that reminders sent exactly 2 hours before a reservation had the highest impact on reducing no-shows. This insight alone reduced no-shows by 62%.

But the benefits extended beyond reservations. The system began tracking customer preferences—favorite dishes, seating preferences, special occasions—allowing staff to provide personalized service. Regular customers now receive birthday greetings and personalized menu recommendations through WhatsApp.

Within 30 days, QuickServe saw a 45% increase in bookings, staff saved an average of 4 hours daily that was previously spent on phone calls, and customer satisfaction scores improved by 38%.

"AiReatro gave us back the ability to focus on what we do best—providing great food and hospitality. The automation handles the logistics, and our team handles the experience," says Al-Rashid.`
  },
  'healthfirst-clinic': {
    id: 'healthfirst-clinic',
    company: 'HealthFirst Clinic',
    industry: 'Healthcare',
    region: 'India',
    useCase: 'Appointment Scheduling',
    volume: '20,000+ messages/month',
    icon: Shield,
    color: 'from-teal-500 to-cyan-500',
    challenge: {
      summary: 'The multi-specialty clinic faced high no-show rates and inefficient appointment management.',
      points: [
        'No-show rate exceeding 35%',
        'Staff spending hours on manual reminders',
        'Patients frustrated with booking process',
        'No visibility into doctor availability'
      ],
      quote: 'Every no-show meant a patient who needed care couldnt get an appointment. It was affecting patient outcomes.'
    },
    solution: {
      summary: 'AiReatro created a patient-friendly scheduling system:',
      features: [
        'WhatsApp appointment booking with doctor selection',
        'Automated appointment reminders',
        'Easy rescheduling through chat',
        'Pre-appointment form collection',
        'Post-visit feedback and follow-up',
        'Prescription and report delivery'
      ]
    },
    results: {
      timeframe: 'Within 60 Days',
      metrics: [
        { label: 'No-Show Reduction', value: '-52%', icon: TrendingUp, color: 'green' },
        { label: 'Booking Time', value: '-75%', icon: Clock, color: 'blue' },
        { label: 'Patient Satisfaction', value: '+41%', icon: Star, color: 'purple' },
        { label: 'Staff Efficiency', value: '3x', icon: Users, color: 'orange' }
      ]
    },
    aiInsight: 'AI discovered that patients who completed pre-appointment forms via WhatsApp were 3x less likely to no-show, as it increased their commitment to the appointment.',
    testimonial: {
      quote: 'Patient care starts before they walk through our doors. AiReatro helps us engage patients from the moment they book.',
      author: 'Dr. Anita Sharma',
      role: 'Medical Director',
      rating: 5
    },
    fullStory: `HealthFirst Clinic is a multi-specialty healthcare facility in Bangalore, serving over 500 patients daily across 15 departments. Despite being a well-regarded healthcare provider, the clinic was grappling with a persistent problem: a no-show rate that had climbed to 35%.

The impact was significant. Empty appointment slots meant doctors were underutilized while patients who urgently needed care faced long wait times. The administrative team was spending hours each day making reminder calls, yet the no-show rate remained stubbornly high.

"Every no-show meant a patient who needed care couldn't get an appointment," explains Dr. Anita Sharma, Medical Director. "It was affecting patient outcomes and our operational efficiency."

AiReatro's implementation began with a simple yet powerful change: patients could now book appointments through WhatsApp. The system showed real-time doctor availability, allowed patients to choose their preferred time slots, and confirmed appointments instantly.

But the real innovation was in the engagement strategy. AiReatro's AI analyzed patterns and discovered something surprising: patients who completed pre-appointment health forms via WhatsApp were three times less likely to no-show. The act of filling out forms created a psychological commitment to the appointment.

The clinic implemented a series of automated touchpoints: a booking confirmation, a reminder 24 hours before, a final reminder 2 hours before with directions and parking information, and a pre-appointment form request. For follow-up appointments, the system automatically reached out based on the doctor's recommended timeline.

Within 60 days, the no-show rate dropped from 35% to just 17%. The booking process that previously took 10-15 minutes of phone calls now happened in under 2 minutes on WhatsApp. Staff efficiency improved by 3x, allowing the administrative team to focus on in-clinic patient care.

"AiReatro didn't just solve our no-show problem—it transformed our entire patient engagement approach. Patient care now starts from the moment they book, not when they walk through our doors," says Dr. Sharma.`
  },
  'travelease-agency': {
    id: 'travelease-agency',
    company: 'TravelEase Agency',
    industry: 'Travel',
    region: 'India & Southeast Asia',
    useCase: 'Trip Inquiry & Booking',
    volume: '18,000+ messages/month',
    icon: Globe,
    color: 'from-indigo-500 to-purple-500',
    challenge: {
      summary: 'The travel agency struggled to handle complex trip inquiries efficiently.',
      points: [
        'Complex multi-destination queries',
        'Slow quote generation process',
        'Lost leads due to delayed responses',
        'No follow-up system for undecided travelers'
      ],
      quote: 'Travelers want instant answers. By the time we sent a quote, theyve already booked elsewhere.'
    },
    solution: {
      summary: 'AiReatro automated the entire travel inquiry journey:',
      features: [
        'AI-powered trip preference collection',
        'Instant package recommendations',
        'Automated quote generation',
        'Follow-up sequences for undecided leads',
        'Payment and document collection',
        'Post-trip feedback and referral requests'
      ]
    },
    results: {
      timeframe: 'Within 45 Days',
      metrics: [
        { label: 'Booking Rate', value: '+28%', icon: TrendingUp, color: 'green' },
        { label: 'Quote-to-Book Time', value: '-65%', icon: Clock, color: 'blue' },
        { label: 'Lead Recovery', value: '+42%', icon: Target, color: 'purple' },
        { label: 'Agent Productivity', value: '2.8x', icon: Users, color: 'orange' }
      ]
    },
    aiInsight: 'AI identified that travelers who received a personalized itinerary within 15 minutes of inquiry had 4x higher conversion rates. Speed became the key differentiator.',
    testimonial: {
      quote: 'We now send personalized itineraries in minutes, not hours. Our conversion rates have never been higher.',
      author: 'Rajesh Menon',
      role: 'Founder & CEO',
      rating: 5
    },
    fullStory: `TravelEase is a boutique travel agency specializing in customized vacation packages across India and Southeast Asia. With a reputation for creating unique travel experiences, the agency was facing an unexpected challenge: their quality-focused approach was too slow for the modern traveler.

"Travelers want instant answers," explains Rajesh Menon, Founder & CEO. "By the time we crafted a detailed quote and sent it, customers had already booked elsewhere or lost interest."

The agency's workflow was heavily manual. A travel consultant would receive an inquiry, spend 30-60 minutes researching options, create a customized itinerary, and then follow up—often 6-8 hours after the initial inquiry. In the fast-paced world of online travel booking, this delay was costly.

AiReatro transformed TravelEase's approach with intelligent automation. When a traveler inquired about a trip, the AI-powered WhatsApp flow collected preferences—destinations, budget, travel dates, interests—through an engaging conversation. Based on these inputs, the system instantly recommended relevant packages from TravelEase's curated collection.

The game-changing insight came from AiReatro's AI analytics. The system discovered that travelers who received a personalized itinerary within 15 minutes of their inquiry had a 4x higher conversion rate. Speed, not just quality, was the key differentiator.

TravelEase restructured their offerings into modular packages that could be quickly customized. The AI would generate a personalized itinerary based on the traveler's preferences, and a consultant would add the human touch before sending—all within 15 minutes.

For travelers who weren't ready to book immediately, AiReatro's follow-up sequences kept the conversation warm. The system would share destination highlights, travel tips, and limited-time offers, bringing back 42% of initially undecided leads.

Within 45 days, booking rates increased by 28%, and the time from quote to booking dropped by 65%. Travel consultants, freed from repetitive inquiry handling, could focus on crafting exceptional experiences for confirmed travelers.

"AiReatro gave us the speed of online booking platforms with the personal touch that defines our brand. It's the best of both worlds," says Menon.`
  },
  'insuresafe': {
    id: 'insuresafe',
    company: 'InsureSafe',
    industry: 'Insurance',
    region: 'India',
    useCase: 'Policy Renewal Automation',
    volume: '35,000+ messages/month',
    icon: Shield,
    color: 'from-slate-600 to-slate-800',
    challenge: {
      summary: 'The insurance company was losing customers due to poor renewal experience.',
      points: [
        'Low policy renewal rates',
        'Customers forgetting renewal dates',
        'Complex renewal process',
        'Limited agent bandwidth for follow-ups'
      ],
      quote: 'We were losing customers not because of price, but because we made renewal too complicated.'
    },
    solution: {
      summary: 'AiReatro simplified the entire renewal journey:',
      features: [
        'Proactive renewal reminders',
        'One-click policy renewal on WhatsApp',
        'Document collection automation',
        'Payment link integration',
        'Policy comparison and upgrades',
        'Claim assistance automation'
      ]
    },
    results: {
      timeframe: 'Within 60 Days',
      metrics: [
        { label: 'Renewal Rate', value: '+39%', icon: TrendingUp, color: 'green' },
        { label: 'Processing Time', value: '-70%', icon: Clock, color: 'blue' },
        { label: 'Customer Queries', value: '-55%', icon: Activity, color: 'purple' },
        { label: 'Upsell Success', value: '+32%', icon: Target, color: 'orange' }
      ]
    },
    aiInsight: 'AI found that customers who received renewal reminders 30, 15, and 7 days before expiry had 67% higher renewal rates than those contacted only once.',
    testimonial: {
      quote: 'Policy renewal went from a pain point to a competitive advantage. Customers actually thank us for the reminders.',
      author: 'Priya Nair',
      role: 'VP of Customer Success',
      rating: 5
    },
    fullStory: `InsureSafe, a mid-sized insurance company in India, was facing a troubling trend: despite competitive pricing and comprehensive coverage, their policy renewal rates were declining year over year. Customer research revealed a surprising insight—it wasn't the price or product that was the problem.

"We were losing customers not because of price, but because we made renewal too complicated," admits Priya Nair, VP of Customer Success. "Customers forgot their renewal dates, couldn't find their policy documents, and gave up midway through the process."

The traditional renewal process involved multiple touchpoints: an email reminder (often missed), a phone call (often inconvenient), document collection (often frustrating), and payment processing (often clunky). Each step was a potential drop-off point.

AiReatro's implementation focused on making renewal as simple as a single WhatsApp conversation. The system proactively reached out to customers 30 days before their policy expiry with a friendly reminder and policy summary. Customers could renew with a simple reply, and the system handled everything else.

The AI-powered approach discovered a critical insight: customers who received renewal reminders at 30, 15, and 7 days before expiry had a 67% higher renewal rate than those contacted only once. The multiple touchpoints, rather than being annoying, were appreciated as helpful reminders.

But AiReatro went beyond reminders. The system analyzed each customer's coverage and proactively suggested relevant add-ons or upgrades. A customer renewing car insurance might receive a personalized recommendation for enhanced coverage based on their vehicle age and usage patterns.

Document collection, previously a major friction point, became seamless. Customers could simply share photos of required documents via WhatsApp, and the AI would verify and process them automatically. Payment links integrated into the chat made the final step effortless.

Within 60 days, renewal rates jumped by 39%, and processing time decreased by 70%. The customer service team, previously overwhelmed with renewal queries, saw a 55% reduction in call volume. Most surprisingly, upsell success increased by 32% as personalized recommendations resonated with customers.

"Policy renewal went from a pain point to a competitive advantage," says Nair. "Customers actually thank us for the reminders. That's when you know you've got it right."`
  },
  'automart-dealers': {
    id: 'automart-dealers',
    company: 'AutoMart Dealers',
    industry: 'Automotive',
    region: 'India',
    useCase: 'Test Drive Scheduling',
    volume: '12,000+ messages/month',
    icon: Target,
    color: 'from-red-500 to-pink-500',
    challenge: {
      summary: 'The car dealership network struggled to convert online inquiries into showroom visits.',
      points: [
        'Low inquiry-to-test-drive conversion',
        'Poor follow-up on interested leads',
        'No visibility into customer preferences',
        'Missed opportunities for cross-selling'
      ],
      quote: 'People browsed our website but never made it to the showroom. We had no way to bridge that gap.'
    },
    solution: {
      summary: 'AiReatro created an engaging car buying journey:',
      features: [
        'AI-powered car recommendation quiz',
        'Virtual car tours via WhatsApp',
        'One-click test drive scheduling',
        'Finance pre-approval automation',
        'Trade-in value estimation',
        'Post-visit follow-up sequences'
      ]
    },
    results: {
      timeframe: 'Within 30 Days',
      metrics: [
        { label: 'Test Drive Leads', value: '+55%', icon: TrendingUp, color: 'green' },
        { label: 'Showroom Visits', value: '+41%', icon: Users, color: 'blue' },
        { label: 'Sales Conversion', value: '+23%', icon: Target, color: 'purple' },
        { label: 'Lead Response Time', value: '-82%', icon: Clock, color: 'orange' }
      ]
    },
    aiInsight: 'AI discovered that leads who engaged with virtual car tours were 3.5x more likely to book test drives. Visual engagement became the key to conversion.',
    testimonial: {
      quote: 'We turned our WhatsApp into a virtual showroom. Customers come to us better informed and ready to buy.',
      author: 'Suresh Patel',
      role: 'Regional Sales Head',
      rating: 5
    },
    fullStory: `AutoMart is a multi-brand car dealership network with 8 showrooms across Maharashtra. Despite investing heavily in digital marketing, the dealership was struggling with a common automotive industry challenge: converting online interest into showroom visits.

"People browsed our website, filled out inquiry forms, but never made it to the showroom," explains Suresh Patel, Regional Sales Head. "We had no way to bridge that gap between digital browsing and physical experience."

The traditional approach involved sales representatives calling leads, but this had limited success. Customers found calls intrusive, and by the time a salesperson reached out, the buyer's interest had often cooled. The dealership needed a more engaging, less pushy approach.

AiReatro transformed the inquiry experience into an interactive journey. When a potential buyer expressed interest, instead of receiving a sales call, they got a WhatsApp message inviting them to take a car recommendation quiz. The AI-powered quiz asked about their needs—family size, primary use, budget, preferred features—and recommended the most suitable models.

The breakthrough feature was virtual car tours. High-quality videos and 360-degree views of each model were delivered through WhatsApp, giving buyers a showroom-like experience from their phones. AiReatro's AI discovered that leads who engaged with these virtual tours were 3.5x more likely to book test drives.

Scheduling a test drive became a one-tap process. The system showed available slots across nearby showrooms, handled the booking, and sent reminders. For serious buyers, the AI even offered to start the finance pre-approval process, speeding up the eventual purchase.

The post-visit experience was equally refined. Leads who visited but didn't purchase received personalized follow-ups—not pushy sales messages, but helpful content about the models they'd viewed, financing options, and limited-time offers.

Within 30 days, test drive leads increased by 55%, and actual showroom visits jumped by 41%. Most importantly, sales conversion improved by 23% as customers arrived better informed and more committed.

"We turned our WhatsApp into a virtual showroom," says Patel. "Customers come to us better informed and ready to buy. The sales conversation starts at a much higher level."`
  }
};

export default function CaseStudyDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const study = slug ? caseStudiesData[slug] : null;
  
  if (!study) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Case Study Not Found</h1>
          <p className="text-muted-foreground mb-8">The case study you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => navigate('/case-studies')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Case Studies
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const IconComponent = study.icon;

  return (
    <div className="min-h-screen bg-background">
      <SeoMeta route={`/case-studies/${slug}`} fallbackTitle={`${study.company} Case Study`} fallbackDescription={study.results.metrics[0].value} />
      
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CaseStudy",
            "name": `${study.company} - ${study.useCase}`,
            "about": {
              "@type": "SoftwareApplication",
              "name": "AiReatro Communications"
            },
            "description": study.challenge.summary
          })}
        </script>
      </Helmet>

      <Navbar />

      {/* Hero */}
      <section className={`relative pt-20 pb-16 md:pt-28 md:pb-20 bg-gradient-to-br ${study.color} overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <Button 
            variant="ghost" 
            className="text-white/80 hover:text-white hover:bg-white/10 mb-8"
            onClick={() => navigate('/case-studies')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Case Studies
          </Button>
          
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm px-4 py-1">
              <IconComponent className="w-4 h-4 mr-2" />
              {study.industry}
            </Badge>
            <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm px-4 py-1">
              <Globe className="w-4 h-4 mr-2" />
              {study.region}
            </Badge>
            <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm px-4 py-1">
              {study.useCase}
            </Badge>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">{study.company}</h1>
          <p className="text-xl text-white/80 mb-6">{study.volume}</p>
          
          <div className="flex flex-wrap gap-4">
            {study.results.metrics.slice(0, 2).map((metric, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
                <span className="text-2xl font-bold text-white">{metric.value}</span>
                <span className="text-white/80 ml-2">{metric.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            
            {/* Challenge */}
            <Card className="mb-8 border-0 shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-red-500" />
                  </div>
                  The Challenge
                </h2>
                <p className="text-lg text-slate-600 mb-4">{study.challenge.summary}</p>
                <ul className="grid md:grid-cols-2 gap-3 mb-6">
                  {study.challenge.points.map((point, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-600">
                      <div className="w-2 h-2 rounded-full bg-red-400 mt-2 shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
                <blockquote className="border-l-4 border-red-300 pl-6 py-2 italic text-slate-500 text-lg bg-red-50/50 rounded-r-lg">
                  <Quote className="w-5 h-5 text-red-300 mb-2" />
                  {study.challenge.quote}
                </blockquote>
              </CardContent>
            </Card>

            {/* Solution */}
            <Card className="mb-8 border-0 shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  The AiReatro Solution
                </h2>
                <p className="text-lg text-slate-600 mb-4">{study.solution.summary}</p>
                <div className="grid md:grid-cols-2 gap-3">
                  {study.solution.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            <Card className="mb-8 border-0 shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                  </div>
                  Results
                </h2>
                <p className="text-sm text-primary font-medium mb-6">{study.results.timeframe}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {study.results.metrics.map((metric, i) => {
                    const colorClasses = {
                      green: 'bg-green-50 border-green-100 text-green-700',
                      blue: 'bg-blue-50 border-blue-100 text-blue-700',
                      purple: 'bg-purple-50 border-purple-100 text-purple-700',
                      orange: 'bg-orange-50 border-orange-100 text-orange-700'
                    };
                    const MetricIcon = metric.icon;
                    return (
                      <div key={i} className={`rounded-xl p-5 text-center border ${colorClasses[metric.color as keyof typeof colorClasses]}`}>
                        <MetricIcon className="w-6 h-6 mx-auto mb-2 opacity-60" />
                        <div className="text-3xl font-bold mb-1">{metric.value}</div>
                        <div className="text-xs font-medium opacity-80">{metric.label}</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* AI Insight */}
            <div className="bg-gradient-to-r from-primary/10 via-emerald-50 to-primary/5 rounded-2xl p-6 border border-primary/20 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center shrink-0 shadow-lg">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-2 text-lg">🧠 AI Insight Highlight</h3>
                  <p className="text-slate-700">{study.aiInsight}</p>
                </div>
              </div>
            </div>

            {/* Full Story */}
            <Card className="mb-8 border-0 shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">The Full Story</h2>
                <div className="prose prose-slate max-w-none">
                  {study.fullStory.split('\n\n').map((paragraph, i) => (
                    <p key={i} className="text-slate-600 mb-4 leading-relaxed">{paragraph}</p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Testimonial */}
            <Card className="mb-8 border-0 shadow-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white">
              <CardContent className="p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(study.testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <blockquote className="text-2xl md:text-3xl mb-6 leading-relaxed">
                  &ldquo;{study.testimonial.quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center text-white font-bold text-lg">
                    {study.testimonial.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-bold text-lg">{study.testimonial.author}</div>
                    <div className="text-slate-400">{study.testimonial.role}, {study.company}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Want similar results?</h3>
              <p className="text-slate-600 mb-6">See how AiReatro can transform your WhatsApp operations</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => navigate('/contact')}>
                  Book a Demo <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/case-studies')}>
                  View More Case Studies
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
