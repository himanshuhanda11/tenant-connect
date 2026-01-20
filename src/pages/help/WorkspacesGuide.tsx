import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, Phone, Users, MessageSquare, Shield, 
  ArrowRight, CheckCircle, Lightbulb, HelpCircle,
  BarChart3, Settings, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SeoMeta from '@/components/seo/SeoMeta';

const benefits = [
  {
    icon: Phone,
    title: 'One Number Per Workspace',
    description: 'Each workspace connects to a single WhatsApp Business API number, keeping conversations organized and separate.',
  },
  {
    icon: Users,
    title: 'Dedicated Team Access',
    description: 'Assign team members to specific workspaces with role-based permissions (Owner, Admin, Agent).',
  },
  {
    icon: BarChart3,
    title: 'Separate Analytics',
    description: 'Track performance metrics, campaign results, and conversation stats independently for each workspace.',
  },
  {
    icon: Zap,
    title: 'Independent Automations',
    description: 'Build unique chatbot flows and automation rules tailored to each brand or client.',
  },
  {
    icon: Shield,
    title: 'Data Isolation',
    description: 'Contacts, messages, and templates are completely isolated between workspaces for security.',
  },
  {
    icon: Settings,
    title: 'Custom Settings',
    description: 'Configure business hours, auto-replies, and preferences separately for each workspace.',
  },
];

const useCases = [
  {
    title: 'Multiple Brands',
    description: 'Run separate WhatsApp channels for different brands under one account.',
    example: 'e.g., Brand A Support, Brand B Sales',
  },
  {
    title: 'Agency Clients',
    description: 'Manage multiple client accounts with complete separation and dedicated teams.',
    example: 'e.g., Client 1, Client 2, Client 3',
  },
  {
    title: 'Departments',
    description: 'Create workspaces for different departments like Sales, Support, and Marketing.',
    example: 'e.g., Sales Team, Customer Support',
  },
  {
    title: 'Regions',
    description: 'Separate workspaces for different geographic regions or languages.',
    example: 'e.g., India, UAE, Singapore',
  },
];

export default function WorkspacesGuide() {
  return (
    <>
      <SeoMeta route="/help/workspaces" fallbackTitle="How Workspaces Work" fallbackDescription="Organize your WhatsApp Business messaging" />
      <Navbar />
      
      <main className="min-h-screen bg-gradient-to-b from-green-50/50 via-white to-white">
        {/* Hero */}
        <section className="py-12 md:py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <Badge className="bg-green-100 text-green-700 border-0 mb-4">
              <HelpCircle className="w-3 h-3 mr-1" />
              Help Guide
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How Workspaces Work
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Workspaces help you organize and manage multiple WhatsApp Business numbers, 
              brands, or clients — all from a single AiReatro account.
            </p>
            
            <div className="inline-flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">1 Workspace = 1 WhatsApp Number</p>
                <p className="text-sm text-gray-500">Each workspace connects to one WhatsApp Business API number</p>
              </div>
            </div>
          </div>
        </section>

        {/* What is a Workspace */}
        <section className="py-12 px-4 bg-white">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What is a Workspace?</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 text-lg leading-relaxed">
                A workspace is a dedicated environment within AiReatro that contains all the resources 
                for managing one WhatsApp Business number. This includes contacts, conversations, 
                message templates, automation flows, team members, and analytics.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed mt-4">
                Think of workspaces like separate "accounts" that share your login but keep 
                everything else completely isolated. This is perfect for agencies managing multiple 
                clients, businesses with multiple brands, or companies with different departments.
              </p>
            </div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Why Use Multiple Workspaces?
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <Card key={index} className="bg-white border-gray-100 hover:border-green-200 transition-colors">
                    <CardContent className="p-6">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                        <Icon className="w-5 h-5 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                      <p className="text-sm text-gray-600">{benefit.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-12 px-4 bg-gray-50">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Common Use Cases
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {useCases.map((useCase, index) => (
                <div 
                  key={index}
                  className="p-5 bg-white rounded-xl border border-gray-100"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{useCase.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{useCase.description}</p>
                  <p className="text-xs text-green-600 font-medium">{useCase.example}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How to Create */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              How to Create a Workspace
            </h2>
            <div className="space-y-4">
              {[
                { step: 1, title: 'Go to Workspace Selector', desc: 'After signing in, you\'ll see the workspace selection page.' },
                { step: 2, title: 'Click "Create Workspace"', desc: 'Choose a name and purpose for your new workspace.' },
                { step: 3, title: 'Connect WhatsApp', desc: 'Link your WhatsApp Business API number to the workspace.' },
                { step: 4, title: 'Invite Team Members', desc: 'Add your team and assign roles (Owner, Admin, Agent).' },
                { step: 5, title: 'Start Messaging', desc: 'Create templates, set up automations, and engage customers!' },
              ].map((item) => (
                <div key={item.step} className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className="py-12 px-4 bg-green-50">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-start gap-4 p-6 bg-white rounded-xl border border-green-100">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Pro Tips</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Name workspaces clearly (e.g., "Brand X Support" or "Client ABC")</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Use the "Demo / Test" purpose for sandbox environments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Assign the right roles — Agents can only access inbox, not settings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Switch between workspaces anytime from the header menu</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-gray-600 mb-6">
              Create your first workspace and connect your WhatsApp Business number.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="bg-green-500 hover:bg-green-600">
                <Link to="/select-workspace">
                  Go to Workspaces
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/help">
                  More Help Articles
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
