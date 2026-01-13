import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Award, 
  Zap, 
  HeadphonesIcon,
  BookOpen,
  Megaphone,
  Code,
  Building2,
  Briefcase,
  Globe,
  CheckCircle2,
  ArrowRight,
  Percent,
  Handshake,
  Rocket,
  BarChart3,
  Shield
} from "lucide-react";

export default function Partners() {
  const partnerModels = [
    {
      icon: Users,
      title: "Affiliate Partner",
      subtitle: "Perfect for Influencers & Content Creators",
      description: "Earn up to 20% recurring commission on every referral. Share your unique link and earn passive income.",
      commission: "20%",
      features: [
        "Unique referral tracking link",
        "Real-time dashboard analytics",
        "Monthly commission payouts",
        "Marketing materials provided"
      ],
      gradient: "from-green-500 to-emerald-600",
      bgGradient: "from-green-50 to-emerald-50"
    },
    {
      icon: Briefcase,
      title: "Agency Partner",
      subtitle: "For Marketing & Digital Agencies",
      description: "Offer WhatsApp solutions to your clients with higher commissions and co-branded solutions.",
      commission: "25%",
      features: [
        "Higher commission rates",
        "White-label dashboard option",
        "Dedicated account manager",
        "Priority client onboarding"
      ],
      gradient: "from-blue-500 to-indigo-600",
      bgGradient: "from-blue-50 to-indigo-50"
    },
    {
      icon: Code,
      title: "Technology Partner",
      subtitle: "For SaaS & Tech Companies",
      description: "Integrate our WhatsApp API into your platform and earn revenue share on conversations.",
      commission: "30%",
      features: [
        "Full API access",
        "Technical integration support",
        "Revenue share on usage",
        "Co-marketing opportunities"
      ],
      gradient: "from-purple-500 to-violet-600",
      bgGradient: "from-purple-50 to-violet-50"
    }
  ];

  const benefits = [
    {
      icon: DollarSign,
      title: "Recurring Commissions",
      description: "Earn monthly recurring revenue for as long as your referrals stay active customers."
    },
    {
      icon: Zap,
      title: "Real-Time Tracking",
      description: "Monitor clicks, signups, and conversions in real-time through your partner dashboard."
    },
    {
      icon: HeadphonesIcon,
      title: "Dedicated Support",
      description: "Get priority access to our partner success team for onboarding and ongoing support."
    },
    {
      icon: BookOpen,
      title: "Marketing Resources",
      description: "Access ready-to-use banners, case studies, product guides, and promotional content."
    },
    {
      icon: Megaphone,
      title: "Co-Marketing",
      description: "Joint webinars, blog features, and social media promotions to boost your reach."
    },
    {
      icon: Award,
      title: "Partner Rewards",
      description: "Unlock exclusive bonuses, higher tiers, and rewards as you grow with us."
    }
  ];

  const stats = [
    { value: "5,000+", label: "Active Partners" },
    { value: "₹10Cr+", label: "Commissions Paid" },
    { value: "25%", label: "Average Commission" },
    { value: "50+", label: "Countries" }
  ];

  const commissionTiers = [
    { tier: "Bronze", referrals: "1-5", commission: "15%", color: "bg-amber-100 text-amber-800" },
    { tier: "Silver", referrals: "6-15", commission: "20%", color: "bg-gray-100 text-gray-800" },
    { tier: "Gold", referrals: "16-30", commission: "25%", color: "bg-yellow-100 text-yellow-800" },
    { tier: "Platinum", referrals: "31+", commission: "30%", color: "bg-purple-100 text-purple-800" }
  ];

  const partnerTypes = [
    { icon: Users, title: "Marketing Agencies", description: "Help clients with WhatsApp campaigns" },
    { icon: Code, title: "SaaS Platforms", description: "Integrate WhatsApp into your product" },
    { icon: Building2, title: "Consultants", description: "Recommend trusted solutions" },
    { icon: Globe, title: "Influencers", description: "Share with your audience" },
    { icon: Briefcase, title: "Freelancers", description: "Add value to client projects" },
    { icon: TrendingUp, title: "Resellers", description: "Build a WhatsApp business" }
  ];

  const testimonials = [
    {
      quote: "The partner program helped us generate ₹50L+ in additional revenue. The support team is exceptional!",
      author: "Rahul Sharma",
      role: "CEO, Digital Marketing Agency",
      avatar: "RS"
    },
    {
      quote: "Easy integration, great commissions, and fantastic partner resources. Highly recommend!",
      author: "Priya Patel",
      role: "Tech Consultant",
      avatar: "PP"
    },
    {
      quote: "We've onboarded 100+ clients through this program. The recurring commissions are game-changing.",
      author: "Amit Kumar",
      role: "Agency Partner",
      avatar: "AK"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-green-500/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
        
        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
              <Handshake className="w-3 h-3 mr-1" />
              Partner Program
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Partner With <span className="text-primary">WazzupCRM</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              Grow Your Business. Earn Recurring Revenue.
            </p>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join our partner network and help businesses transform their customer communication 
              with WhatsApp while earning up to 30% recurring commissions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2" asChild>
                <a href="#partner-form">
                  Become a Partner <ArrowRight className="w-4 h-4" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="gap-2" asChild>
                <a href="#partner-models">
                  Explore Partner Models
                </a>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6 bg-card rounded-xl border shadow-sm">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Models Section */}
      <section id="partner-models" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Partner Models</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Choose Your Partner Model
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We offer flexible partnership models tailored to Agencies, Freelancers, 
              Marketers, and Technology companies.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {partnerModels.map((model, index) => (
              <Card key={index} className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50">
                <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${model.gradient}`} />
                <CardHeader className="pb-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${model.gradient} flex items-center justify-center mb-4`}>
                    <model.icon className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">{model.title}</CardTitle>
                  <CardDescription className="text-sm font-medium text-primary">
                    {model.subtitle}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{model.description}</p>
                  
                  <div className={`p-4 rounded-lg bg-gradient-to-r ${model.bgGradient} mb-4`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Commission Rate</span>
                      <span className={`text-2xl font-bold bg-gradient-to-r ${model.gradient} bg-clip-text text-transparent`}>
                        Up to {model.commission}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-2">
                    {model.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button className="w-full mt-6" variant="outline" asChild>
                    <a href="#partner-form">Apply Now</a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Commission Tiers */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">
                <Percent className="w-3 h-3 mr-1" />
                Commission Structure
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Earn More as You Grow
              </h2>
              <p className="text-lg text-muted-foreground">
                Our tiered commission structure rewards your success with higher rates
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              {commissionTiers.map((tier, index) => (
                <div key={index} className="relative group">
                  <div className="p-6 bg-card border-2 rounded-xl text-center hover:border-primary transition-colors">
                    <Badge className={`${tier.color} mb-3`}>{tier.tier}</Badge>
                    <div className="text-4xl font-bold text-primary mb-2">{tier.commission}</div>
                    <div className="text-sm text-muted-foreground">Commission</div>
                    <div className="mt-4 pt-4 border-t">
                      <span className="text-sm font-medium">{tier.referrals}</span>
                      <div className="text-xs text-muted-foreground">Active Referrals</div>
                    </div>
                  </div>
                  {index < commissionTiers.length - 1 && (
                    <ArrowRight className="hidden md:block absolute top-1/2 -right-4 w-6 h-6 text-muted-foreground/50 -translate-y-1/2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              <Rocket className="w-3 h-3 mr-1" />
              Partner Benefits
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Partner with WazzupCRM?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get everything you need to succeed — from marketing materials to dedicated support
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Who Can Partner */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">Partner Types</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Who Can Partner With Us?
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
            {partnerTypes.map((type, index) => (
              <div key={index} className="p-4 bg-card border rounded-xl text-center hover:border-primary/50 hover:shadow-md transition-all">
                <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <type.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{type.title}</h3>
                <p className="text-xs text-muted-foreground">{type.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">Partner Stories</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Partners Love Working With Us
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-card">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{testimonial.author}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Signup Form */}
      <section id="partner-form" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Form Info */}
              <div>
                <Badge className="mb-4 bg-primary/10 text-primary">Apply Now</Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Become a Partner Today
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Fill out the form and our partnership team will get back to you within 24 hours.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Quick Approval</h3>
                      <p className="text-sm text-muted-foreground">Get approved within 24-48 hours</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Partner Dashboard</h3>
                      <p className="text-sm text-muted-foreground">Track referrals and commissions in real-time</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Official Meta Partner</h3>
                      <p className="text-sm text-muted-foreground">Partner with a verified WhatsApp BSP</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form */}
              <Card className="shadow-xl border-2">
                <CardHeader>
                  <CardTitle>Partner Application</CardTitle>
                  <CardDescription>
                    Join our growing network of successful partners
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" placeholder="John" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" placeholder="Doe" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Business Email</Label>
                      <Input id="email" type="email" placeholder="john@company.com" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" placeholder="+91 98765 43210" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company">Company Name</Label>
                      <Input id="company" placeholder="Your Company" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Website (Optional)</Label>
                      <Input id="website" type="url" placeholder="https://yourwebsite.com" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="partnerType">Partner Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select partner type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="affiliate">Affiliate Partner</SelectItem>
                          <SelectItem value="agency">Agency Partner</SelectItem>
                          <SelectItem value="technology">Technology Partner</SelectItem>
                          <SelectItem value="reseller">Reseller</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Tell us about your business</Label>
                      <Textarea 
                        id="message" 
                        placeholder="Brief description of your business and how you plan to promote WazzupCRM..."
                        rows={3}
                      />
                    </div>

                    <Button type="submit" className="w-full" size="lg">
                      Submit Application
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      By submitting, you agree to our{" "}
                      <Link to="/terms" className="text-primary hover:underline">Terms</Link> and{" "}
                      <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Grow Together?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of partners who are building successful businesses with WazzupCRM.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="gap-2" asChild>
              <a href="#partner-form">
                Apply Now <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-white/30 hover:bg-white/10" asChild>
              <Link to="/contact">Contact Partnership Team</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
