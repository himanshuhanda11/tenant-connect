import React, { useState } from 'react';
import { z } from 'zod';
import { 
  Mail, 
  Phone, 
  MapPin,
  MessageCircle,
  Clock,
  ArrowRight,
  Send,
  CheckCircle,
  Building2,
  User,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { SEO } from '@/components/seo';
import PageHero from '@/components/layout/PageHero';

const contactSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50, "First name must be less than 50 characters"),
  lastName: z.string().trim().min(1, "Last name is required").max(50, "Last name must be less than 50 characters"),
  email: z.string().trim().email("Please enter a valid email address").max(100, "Email must be less than 100 characters"),
  company: z.string().trim().max(100, "Company name must be less than 100 characters").optional(),
  phone: z.string().trim().max(20, "Phone number must be less than 20 characters").optional(),
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000, "Message must be less than 2000 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    phone: '',
    subject: '',
    message: '',
  });

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      description: 'support@aireatro.com',
      subtext: 'We reply within 24 hours',
      action: 'mailto:support@aireatro.com'
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      description: 'Chat on WhatsApp',
      subtext: 'Available 24/7',
      action: 'https://wa.me/919876543210'
    },
    {
      icon: Phone,
      title: 'Call Us',
      description: '+91 98765 43210',
      subtext: 'Mon-Sat, 10am-7pm IST',
      action: 'tel:+919876543210'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      description: 'Bangalore, India',
      subtext: 'By appointment only',
      action: '#'
    }
  ];

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const result = contactSchema.safeParse(formData);
    
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactFormData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof ContactFormData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 24 hours.",
    });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-32">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">Message Sent!</h1>
            <p className="text-muted-foreground mb-8">
              Thank you for reaching out. Our team will review your message and get back to you within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => setIsSubmitted(false)}>
                Send Another Message
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/help'}>
                Visit Help Center
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Contact Us — Get in Touch with AiReatro Team"
        description="Have questions about WhatsApp Business API? Contact our team for sales inquiries, demos, technical support, or partnership opportunities. We respond within 24 hours."
        canonical="/contact"
        keywords={['contact aireatro', 'whatsapp api support', 'request demo', 'sales inquiry', 'technical support']}
      />
      <Navbar />

      <PageHero
        badge={{ icon: MessageCircle, text: "Get in Touch" }}
        title="Let's Start a"
        titleHighlight="Conversation"
        subtitle="Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible."
      />

      {/* Contact Info Cards */}
      <section className="py-12 -mt-6">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {contactInfo.map((info, index) => (
              <a 
                key={index} 
                href={info.action}
                target={info.action.startsWith('http') ? '_blank' : undefined}
                rel={info.action.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="block"
              >
                <Card className="text-center border-border/50 hover:shadow-lg hover:border-primary/30 transition-all h-full cursor-pointer">
                  <CardContent className="pt-6 pb-5">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <info.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{info.title}</h3>
                    <p className="text-foreground text-sm font-medium mb-0.5">{info.description}</p>
                    <p className="text-xs text-muted-foreground">{info.subtext}</p>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-12 max-w-6xl mx-auto">
            {/* Form */}
            <div className="lg:col-span-3">
              <Card className="border-border/50">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Send className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Send us a Message</h2>
                      <p className="text-sm text-muted-foreground">We'll get back to you within 24 hours</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          First Name <span className="text-destructive">*</span>
                        </Label>
                        <Input 
                          id="firstName" 
                          placeholder="John" 
                          className={`h-11 ${errors.firstName ? 'border-destructive' : ''}`}
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                        />
                        {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="flex items-center gap-1">
                          Last Name <span className="text-destructive">*</span>
                        </Label>
                        <Input 
                          id="lastName" 
                          placeholder="Doe" 
                          className={`h-11 ${errors.lastName ? 'border-destructive' : ''}`}
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                        />
                        {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          Email Address <span className="text-destructive">*</span>
                        </Label>
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="john@company.com" 
                          className={`h-11 ${errors.email ? 'border-destructive' : ''}`}
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                        />
                        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          Phone Number
                        </Label>
                        <Input 
                          id="phone" 
                          type="tel" 
                          placeholder="+91 98765 43210" 
                          className="h-11"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company" className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        Company Name
                      </Label>
                      <Input 
                        id="company" 
                        placeholder="Acme Inc" 
                        className="h-11"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject" className="flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5" />
                        Subject <span className="text-destructive">*</span>
                      </Label>
                      <Select 
                        value={formData.subject} 
                        onValueChange={(value) => handleInputChange('subject', value)}
                      >
                        <SelectTrigger className={`h-11 ${errors.subject ? 'border-destructive' : ''}`}>
                          <SelectValue placeholder="What can we help you with?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sales">Sales Inquiry</SelectItem>
                          <SelectItem value="demo">Request a Demo</SelectItem>
                          <SelectItem value="support">Technical Support</SelectItem>
                          <SelectItem value="billing">Billing Question</SelectItem>
                          <SelectItem value="partnership">Partnership Opportunity</SelectItem>
                          <SelectItem value="enterprise">Enterprise Plan</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="flex items-center gap-1">
                        Message <span className="text-destructive">*</span>
                      </Label>
                      <Textarea 
                        id="message" 
                        placeholder="Tell us how we can help you..." 
                        className={`min-h-[120px] resize-none ${errors.message ? 'border-destructive' : ''}`}
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                      />
                      <div className="flex justify-between">
                        {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
                        <p className="text-xs text-muted-foreground ml-auto">{formData.message.length}/2000</p>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full h-12" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Info */}
            <div className="lg:col-span-2">
              <div className="sticky top-24 space-y-6">
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-4">Why Contact Us?</h3>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Clock className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground text-sm">Quick Response</h4>
                          <p className="text-xs text-muted-foreground">We respond within 24 hours</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <MessageCircle className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground text-sm">Expert Guidance</h4>
                          <p className="text-xs text-muted-foreground">WhatsApp API specialists</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Phone className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground text-sm">Free Consultation</h4>
                          <p className="text-xs text-muted-foreground">Discuss your business needs</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6">
                    <Badge className="mb-3">Popular</Badge>
                    <h3 className="font-semibold text-foreground mb-2">Schedule a Demo</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      See AiReatro in action with a personalized demo from our team.
                    </p>
                    <Button className="w-full" onClick={() => window.location.href = '/signup'}>
                      Book Demo
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-2">Need Immediate Help?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Check our Help Center for instant answers.
                    </p>
                    <Button variant="outline" className="w-full" onClick={() => window.location.href = '/help'}>
                      Visit Help Center
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
