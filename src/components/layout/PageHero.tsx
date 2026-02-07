import React from 'react';
import { LucideIcon } from 'lucide-react';
import Breadcrumb from '@/components/layout/Breadcrumb';

interface PageHeroProps {
  badge?: {
    icon?: LucideIcon;
    text: string;
  };
  title: string;
  titleHighlight?: string;
  subtitle: string;
  children?: React.ReactNode;
}

export default function PageHero({ 
  badge, 
  title, 
  titleHighlight, 
  subtitle,
  children 
}: PageHeroProps) {
  return (
    <section className="relative pt-16 pb-12 md:pt-20 md:pb-16 bg-white overflow-hidden">
      {/* Subtle decorative elements */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-primary/3 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <Breadcrumb className="mb-6" />
        <div className="max-w-4xl mx-auto text-center">
          {badge && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              {badge.icon && <badge.icon className="w-4 h-4" />}
              {badge.text}
            </div>
          )}
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            <span className="text-slate-900">{title}</span>
            {titleHighlight && (
              <>
                {' '}
                <span className="text-primary">{titleHighlight}</span>
              </>
            )}
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
            {subtitle}
          </p>
          
          {children && (
            <div className="mt-8">
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
