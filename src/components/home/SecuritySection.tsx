import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Server, FileCheck, Globe, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const securityFeatures = [
  { icon: Server, title: 'Cloud API Hosting', description: 'Hosted on secure cloud infrastructure' },
  { icon: Lock, title: 'Data Encryption', description: 'End-to-end encryption for all data' },
  { icon: Globe, title: 'GDPR Ready', description: 'Full compliance with data protection' },
  { icon: CheckCircle2, title: 'Access Control', description: 'Role-based permissions & audit logs' },
  { icon: FileCheck, title: 'Meta Aligned', description: 'Policy-compliant messaging practices' },
  { icon: Shield, title: 'SOC 2 Type II', description: 'Enterprise security certification' },
];

export default function SecuritySection() {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            Enterprise Security
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Built With Security First
          </h2>
          <p className="text-lg text-muted-foreground mb-12">
            Your data is protected with enterprise-grade security measures
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-10">
            {securityFeatures.map((feature, index) => (
              <div 
                key={index} 
                className="p-4 md:p-6 rounded-2xl bg-card border border-border/50 text-left hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center mb-3">
                  <feature.icon className="w-5 h-5 text-green-600" />
                </div>
                <h4 className="font-semibold text-foreground mb-1">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>

          <Button variant="outline" asChild>
            <Link to="/security">Learn About Our Security</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
