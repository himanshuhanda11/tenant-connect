import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowRight, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Head of Customer Success',
    company: 'TechFlow Inc',
    content: 'aireatro transformed our customer support. We now handle 3x more conversations with the same team size.',
    avatar: 'SC',
    rating: 5,
    metric: '3x more conversations',
    metricType: 'Efficiency'
  },
  {
    name: 'Michael Rodriguez',
    role: 'Marketing Director',
    company: 'GrowthLabs',
    content: 'The broadcast feature helped us achieve 95% open rates on our promotional campaigns. Email doesn\'t come close.',
    avatar: 'MR',
    rating: 5,
    metric: '95% open rate',
    metricType: 'Engagement'
  },
  {
    name: 'Priya Sharma',
    role: 'Operations Manager',
    company: 'QuickServe',
    content: 'Setup was incredibly easy. We were sending messages within 10 minutes of signing up. The onboarding is seamless.',
    avatar: 'PS',
    rating: 5,
    metric: '10 min setup',
    metricType: 'Time Saved'
  }
];

export default function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 text-yellow-600 text-sm font-medium mb-6">
            <Star className="w-4 h-4 fill-yellow-500" />
            Customer Stories
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Loved by Businesses Worldwide
          </h2>
          <p className="text-lg text-muted-foreground">
            See what our customers have to say about their experience with aireatro
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-10">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-card border-border/50 hover:shadow-xl transition-shadow relative">
              <CardContent className="pt-8 pb-6 px-6">
                {/* Quote icon */}
                <Quote className="w-8 h-8 text-muted-foreground/20 absolute top-4 right-4" />
                
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-foreground mb-6 leading-relaxed">"{testimonial.content}"</p>

                {/* Metric highlight */}
                <div className="mb-6 p-3 bg-green-500/10 rounded-lg">
                  <span className="text-xs text-muted-foreground block">{testimonial.metricType}</span>
                  <span className="text-lg font-bold text-green-600">{testimonial.metric}</span>
                </div>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}, {testimonial.company}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button variant="outline" asChild>
            <Link to="/case-studies">
              Read Full Case Studies
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
