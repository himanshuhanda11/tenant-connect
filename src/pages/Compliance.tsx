import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  CheckCircle2, 
  MessageSquare, 
  FileText, 
  Trash2, 
  Lock,
  ArrowRight,
  Users,
  Bell,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function Compliance() {
  const navigate = useNavigate();

  const compliancePoints = [
    {
      icon: MessageSquare,
      title: 'Opt-In Based Messaging',
      description: 'All messages are sent only to users who have explicitly opted-in to receive communications. We require verified consent before any outbound messaging.',
      color: 'bg-green-500'
    },
    {
      icon: FileText,
      title: 'Approved Templates Only',
      description: 'Marketing and promotional messages use only Meta-approved templates that comply with WhatsApp Business Policy and Commerce Policy guidelines.',
      color: 'bg-blue-500'
    },
    {
      icon: Trash2,
      title: 'Data Deletion on Request',
      description: 'Users can request complete deletion of their personal data at any time. We process deletion requests within 30 days as per GDPR requirements.',
      color: 'bg-red-500'
    },
    {
      icon: Lock,
      title: 'Meta & WhatsApp Policy Compliant',
      description: 'Our platform is built to comply with Meta Platform Terms, WhatsApp Business Policy, and all applicable data protection regulations.',
      color: 'bg-purple-500'
    }
  ];

  const metaCompliance = [
    'Official Meta Business Partner',
    'WhatsApp Business Solution Provider',
    'Compliant with Meta Platform Terms',
    'Regular security audits and assessments',
    'Data Processing Agreement (DPA) available',
    'SOC 2 Type II certified infrastructure'
  ];

  const dataProtection = [
    {
      title: 'GDPR Compliant',
      description: 'Full compliance with EU General Data Protection Regulation'
    },
    {
      title: 'CCPA Compliant',
      description: 'Meets California Consumer Privacy Act requirements'
    },
    {
      title: 'Data Encryption',
      description: 'End-to-end encryption for all data in transit and at rest'
    },
    {
      title: 'Data Residency',
      description: 'Options for regional data storage to meet local requirements'
    }
  ];

  const userRights = [
    { icon: Eye, title: 'Right to Access', description: 'Request a copy of your personal data' },
    { icon: FileText, title: 'Right to Rectification', description: 'Correct inaccurate personal data' },
    { icon: Trash2, title: 'Right to Erasure', description: 'Request deletion of your data' },
    { icon: Bell, title: 'Right to Notification', description: 'Be informed of data breaches' },
    { icon: Users, title: 'Right to Portability', description: 'Export your data in a standard format' },
    { icon: Lock, title: 'Right to Restriction', description: 'Limit how we process your data' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-green-950/30 to-slate-950" />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-green-500/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/3 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px]" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              Trust & Compliance
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Built for{' '}
              <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Compliance & Trust
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto">
              We follow Meta and WhatsApp policies strictly, ensuring your business messaging 
              is secure, compliant, and trustworthy.
            </p>
          </div>
        </div>
      </section>

      {/* Main Compliance Points */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {compliancePoints.map((point, index) => (
                <Card key={index} className="border-border/50 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl ${point.color} flex items-center justify-center flex-shrink-0`}>
                        <point.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">{point.title}</h3>
                        <p className="text-muted-foreground">{point.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Meta Compliance */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Meta & WhatsApp Compliance</h2>
              <p className="text-muted-foreground">
                Our platform adheres to all Meta and WhatsApp business requirements
              </p>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {metaCompliance.map((item, index) => (
                <Card key={index} className="border-border/50">
                  <CardContent className="p-4 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Data Protection */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Data Protection Standards</h2>
              <p className="text-muted-foreground">
                Enterprise-grade security and privacy for your data
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {dataProtection.map((item, index) => (
                <Card key={index} className="border-border/50">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* User Rights */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Your Rights</h2>
              <p className="text-muted-foreground">
                We respect and uphold your data privacy rights
              </p>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {userRights.map((right, index) => (
                <Card key={index} className="border-border/50 text-center">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <right.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{right.title}</h3>
                    <p className="text-sm text-muted-foreground">{right.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Related Policies */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Our Policies</h2>
              <p className="text-muted-foreground">
                Read our detailed policies and terms
              </p>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Link to="/privacy-policy">
                <Card className="border-border/50 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer h-full">
                  <CardContent className="p-6 text-center">
                    <Lock className="w-8 h-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold text-foreground">Privacy Policy</h3>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/terms">
                <Card className="border-border/50 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer h-full">
                  <CardContent className="p-6 text-center">
                    <FileText className="w-8 h-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold text-foreground">Terms of Service</h3>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/data-deletion">
                <Card className="border-border/50 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer h-full">
                  <CardContent className="p-6 text-center">
                    <Trash2 className="w-8 h-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold text-foreground">Data Deletion</h3>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/acceptable-use">
                <Card className="border-border/50 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer h-full">
                  <CardContent className="p-6 text-center">
                    <Shield className="w-8 h-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold text-foreground">Acceptable Use</h3>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/cookie-policy">
                <Card className="border-border/50 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer h-full">
                  <CardContent className="p-6 text-center">
                    <Eye className="w-8 h-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold text-foreground">Cookie Policy</h3>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/security">
                <Card className="border-border/50 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer h-full">
                  <CardContent className="p-6 text-center">
                    <Lock className="w-8 h-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold text-foreground">Security</h3>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-green-600 via-emerald-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        
        <div className="container mx-auto px-4 relative text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Questions About Compliance?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Our team is ready to help with any compliance or security questions.
          </p>
          <Button size="lg" className="h-14 px-8 bg-white text-green-600 hover:bg-white/90" onClick={() => navigate('/contact')}>
            Contact Our Team
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
