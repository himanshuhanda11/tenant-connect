import React from 'react';
import { 
  MapPin, 
  Briefcase, 
  Heart, 
  Zap,
  Globe,
  Coffee,
  Users,
  ArrowRight,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function Careers() {
  const perks = [
    { icon: Heart, title: 'Health Insurance', description: 'Comprehensive health coverage for you and family' },
    { icon: Globe, title: 'Remote First', description: 'Work from anywhere in the world' },
    { icon: Coffee, title: 'Unlimited PTO', description: 'Take time off when you need it' },
    { icon: Zap, title: 'Learning Budget', description: '$2,000/year for courses and conferences' },
    { icon: Users, title: 'Team Retreats', description: 'Annual company-wide gatherings' },
    { icon: Briefcase, title: 'Equity', description: 'Stock options for all employees' },
  ];

  const jobs = [
    {
      title: 'Senior Full-Stack Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      description: 'Build and scale our WhatsApp Business API platform using React, Node.js, and PostgreSQL.'
    },
    {
      title: 'Product Designer',
      department: 'Design',
      location: 'Remote',
      type: 'Full-time',
      description: 'Design intuitive user experiences for our messaging platform and internal tools.'
    },
    {
      title: 'Customer Success Manager',
      department: 'Customer Success',
      location: 'Remote (APAC)',
      type: 'Full-time',
      description: 'Help our enterprise customers get the most value from the smeksh platform.'
    },
    {
      title: 'DevOps Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      description: 'Build and maintain our cloud infrastructure on AWS and manage CI/CD pipelines.'
    },
    {
      title: 'Content Marketing Manager',
      department: 'Marketing',
      location: 'Remote',
      type: 'Full-time',
      description: 'Create compelling content that educates and engages our target audience.'
    },
    {
      title: 'Sales Development Representative',
      department: 'Sales',
      location: 'Remote (Americas)',
      type: 'Full-time',
      description: 'Generate qualified leads and support our growing sales team.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-pink-900/30 to-slate-900" />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-pink-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px]" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Join Our{' '}
              <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Mission
              </span>
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto mb-10">
              Help us build the future of business messaging. We're looking for passionate people to join our growing team.
            </p>
            <Button size="lg" className="h-14 px-8 bg-gradient-to-r from-pink-500 to-purple-600" onClick={() => document.getElementById('openings')?.scrollIntoView({ behavior: 'smooth' })}>
              View Open Positions
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Why Join */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Join smeksh?
            </h2>
            <p className="text-lg text-muted-foreground">
              We offer competitive compensation and benefits to help you do your best work.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {perks.map((perk, index) => (
              <Card key={index} className="border-border/50 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <perk.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">{perk.title}</h3>
                  <p className="text-muted-foreground">{perk.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Culture */}
      <section className="py-24 bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Our Culture
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                We're a remote-first team of passionate individuals from around the world, united by our mission to make business messaging simple and accessible.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                We believe in transparency, continuous learning, and celebrating wins together. We move fast, take ownership, and always put our customers first.
              </p>
              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="text-sm py-1 px-3">Remote-First</Badge>
                <Badge variant="secondary" className="text-sm py-1 px-3">Async Communication</Badge>
                <Badge variant="secondary" className="text-sm py-1 px-3">Work-Life Balance</Badge>
                <Badge variant="secondary" className="text-sm py-1 px-3">Continuous Learning</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`aspect-square rounded-2xl bg-gradient-to-br ${
                  i === 1 ? 'from-pink-500 to-purple-600' :
                  i === 2 ? 'from-blue-500 to-cyan-600' :
                  i === 3 ? 'from-green-500 to-emerald-600' :
                  'from-orange-500 to-red-600'
                } flex items-center justify-center`}>
                  <Users className="w-12 h-12 text-white/80" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="openings" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Open Positions
            </h2>
            <p className="text-lg text-muted-foreground">
              Find your next role and help us shape the future of business messaging.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {jobs.map((job, index) => (
              <Card key={index} className="border-border/50 hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                        {job.title}
                      </h3>
                      <p className="text-muted-foreground mb-3">{job.description}</p>
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          {job.department}
                        </Badge>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {job.location}
                        </Badge>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {job.type}
                        </Badge>
                      </div>
                    </div>
                    <Button className="shrink-0">
                      Apply Now
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        
        <div className="container mx-auto px-4 relative text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Don't See Your Role?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            We're always looking for talented people. Send us your resume and we'll reach out when we have a matching opportunity.
          </p>
          <Button size="lg" className="h-14 px-8 bg-white text-purple-600 hover:bg-white/90">
            Send Your Resume
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
