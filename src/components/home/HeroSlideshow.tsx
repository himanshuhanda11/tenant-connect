import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

import slideInbox from '@/assets/slides/slide-inbox.png';
import slideTags from '@/assets/slides/slide-tags.png';
import slideTemplates from '@/assets/slides/slide-templates.png';
import slideAutomation from '@/assets/slides/slide-automation.png';
import slideFormRules from '@/assets/slides/slide-form-rules.png';
import slideFlowBuilder from '@/assets/slides/slide-flow-builder.png';
import slideMetaAds from '@/assets/slides/slide-meta-ads.png';
import slideTeam from '@/assets/slides/slide-team.png';
import slideBilling from '@/assets/slides/slide-billing.png';

const slides = [
  { src: slideInbox, label: 'Team Inbox', description: 'Manage conversations with VIP tagging & SLA tracking' },
  { src: slideTemplates, label: 'Templates', description: 'Create & submit WhatsApp message templates' },
  { src: slideAutomation, label: 'Automation', description: 'Build powerful When → If → Then workflows' },
  { src: slideFlowBuilder, label: 'Flow Builder', description: 'Visual drag-and-drop conversation flows' },
  { src: slideFormRules, label: 'Auto-Form Rules', description: 'Trigger forms based on user intent' },
  { src: slideMetaAds, label: 'Meta Ads', description: 'Connect Click-to-WhatsApp ad tracking' },
  { src: slideTags, label: 'Tags', description: 'Organize contacts with intelligent tagging' },
  { src: slideTeam, label: 'Team', description: 'Manage roles, permissions & routing' },
  { src: slideBilling, label: 'Billing', description: 'Flexible plans from Starter to Enterprise' },
];

export default function HeroSlideshow() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(next, 3500);
    return () => clearInterval(timer);
  }, [isPaused, next]);

  return (
    <div
      className="relative max-w-5xl mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main display */}
      <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-900">
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          {slides.map((slide, i) => (
            <img
              key={slide.label}
              src={slide.src}
              alt={`AiReatro ${slide.label} - ${slide.description}`}
              className={cn(
                'absolute inset-0 w-full h-full object-cover object-top transition-all duration-700 ease-in-out',
                i === current ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              )}
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
            />
          ))}
        </div>

        {/* Bottom label bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-3 sm:p-5">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-white font-semibold text-sm sm:text-lg">{slides[current].label}</p>
              <p className="text-white/70 text-xs sm:text-sm">{slides[current].description}</p>
            </div>
            <span className="text-white/50 text-xs font-mono">{current + 1}/{slides.length}</span>
          </div>
        </div>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5 mt-4">
        {slides.map((slide, i) => (
          <button
            key={slide.label}
            onClick={() => setCurrent(i)}
            aria-label={`Go to ${slide.label}`}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              i === current ? 'w-6 bg-green-500' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
            )}
          />
        ))}
      </div>

      {/* Feature pill tabs (desktop) */}
      <div className="hidden md:flex flex-wrap justify-center gap-2 mt-4">
        {slides.map((slide, i) => (
          <button
            key={slide.label}
            onClick={() => setCurrent(i)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border',
              i === current
                ? 'bg-green-50 text-green-700 border-green-200 shadow-sm'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700'
            )}
          >
            {slide.label}
          </button>
        ))}
      </div>
    </div>
  );
}
