import React from 'react';
import { Users, Shield, Key, UserCheck, Settings, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/layout/Breadcrumb';

export default function TeamRolesFeature() {
  const navigate = useNavigate();
  const features = [
    { icon: Users, title: 'Unlimited Team Members', description: 'Invite your entire team. No per-seat pricing surprises.' },
    { icon: Shield, title: 'Role-Based Access', description: 'Define custom roles with granular permissions for every feature.' },
    { icon: Key, title: 'Permission Controls', description: 'Control who can send messages, view contacts, or manage settings.' },
    { icon: UserCheck, title: 'Agent Assignment', description: 'Assign conversations to specific team members or teams.' },
    { icon: Settings, title: 'Team Settings', description: 'Configure team-wide defaults, working hours, and notifications.' },
    { icon: Lock, title: 'Secure Access', description: 'Two-factor authentication and session management for all users.' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden bg-gradient-to-b from-background to-muted/30">
        <div className="absolute inset-0"><div className="absolute top-20 left-1/4 w-[400px] h-[400px] bg-pink-500/5 rounded-full blur-[100px]" /></div>
        <div className="container mx-auto px-4 relative">
          <Breadcrumb className="mb-8" />
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-600 text-sm font-medium mb-6"><Users className="w-4 h-4" />Team & Roles</div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">Empower Your <span className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 bg-clip-text text-transparent">Entire Team</span></h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8">Invite unlimited team members with role-based access control. Everyone gets exactly the permissions they need.</p>
            <Button size="lg" className="h-14 px-8 bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg shadow-green-500/20" onClick={() => navigate('/signup')}>Start Free Trial<ArrowRight className="w-5 h-5 ml-2" /></Button>
          </div>
        </div>
      </section>
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((f, i) => (<Card key={i} className="border-border/50 hover:shadow-xl transition-all"><CardContent className="p-6"><div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center mb-4"><f.icon className="w-6 h-6 text-pink-500" /></div><h3 className="font-semibold text-xl text-foreground mb-2">{f.title}</h3><p className="text-muted-foreground">{f.description}</p></CardContent></Card>))}
          </div>
        </div>
      </section>
      <section className="py-24 bg-gradient-to-br from-pink-600 via-rose-600 to-red-600 relative"><div className="container mx-auto px-4 text-center"><h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to Scale Your Team?</h2><Button size="lg" className="h-14 px-8 bg-white text-pink-600" onClick={() => navigate('/signup')}>Start Free Trial<ArrowRight className="w-5 h-5 ml-2" /></Button></div></section>
      <Footer />
    </div>
  );
}
