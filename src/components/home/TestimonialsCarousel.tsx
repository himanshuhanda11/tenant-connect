import React, { useState, useEffect, useRef } from 'react';
import { 
  Quote,
  ChevronLeft,
  ChevronRight,
  Star,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Head of Growth',
    company: 'StyleBazaar',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    quote: 'AiReatro cut our response time from 4 hours to 15 minutes. Our CSAT went from 72% to 94%.',
    metric: '94%',
    metricLabel: 'CSAT Score',
    rating: 5
  },
  {
    name: 'Rahul Mehta',
    role: 'Founder',
    company: 'FreshKart',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    quote: 'We recovered ₹12L in abandoned carts last month using the automation flows. Insane ROI.',
    metric: '₹12L',
    metricLabel: 'Recovered Revenue',
    rating: 5
  },
  {
    name: 'Sara Al-Rashid',
    role: 'Operations Manager',
    company: 'GulfTech Solutions',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    quote: 'The Meta Ads attribution finally showed us which campaigns actually convert. Game changer.',
    metric: '3.2x',
    metricLabel: 'ROAS Improvement',
    rating: 5
  },
  {
    name: 'Amit Patel',
    role: 'CTO',
    company: 'FinServe India',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    quote: 'The diagnostics caught issues we never knew existed. Our flow completion rate doubled.',
    metric: '2x',
    metricLabel: 'Flow Completion',
    rating: 5
  },
];

export default function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isAutoPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      }, 5000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrev = () => goToSlide((currentIndex - 1 + testimonials.length) % testimonials.length);
  const goToNext = () => goToSlide((currentIndex + 1) % testimonials.length);

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <Badge className="mb-4 bg-amber-100 text-amber-700 border-0">
            <Star className="w-3.5 h-3.5 mr-1.5 fill-amber-500" />
            Customer Stories
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Loved by{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-500">
              2,000+ Teams
            </span>
          </h2>
          <p className="text-lg text-slate-600">
            Real results from real businesses
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Main Carousel */}
          <div className="relative">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-50 to-white">
              <CardContent className="p-8 md:p-12">
                <Quote className="w-12 h-12 text-green-200 mb-6" />
                
                <div className="grid md:grid-cols-3 gap-8 items-center">
                  <div className="md:col-span-2">
                    <p className="text-xl md:text-2xl text-slate-700 leading-relaxed mb-6">
                      "{testimonials[currentIndex].quote}"
                    </p>
                    
                    <div className="flex items-center gap-4">
                      <img 
                        src={testimonials[currentIndex].image}
                        alt={testimonials[currentIndex].name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
                      />
                      <div>
                        <div className="font-semibold text-slate-900">
                          {testimonials[currentIndex].name}
                        </div>
                        <div className="text-sm text-slate-500">
                          {testimonials[currentIndex].role}, {testimonials[currentIndex].company}
                        </div>
                        <div className="flex items-center gap-0.5 mt-1">
                          {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Metric Highlight */}
                  <div className="text-center md:text-right">
                    <div className="inline-block p-6 rounded-2xl bg-green-50 border border-green-200">
                      <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <div className="text-4xl font-bold text-green-600 mb-1">
                        {testimonials[currentIndex].metric}
                      </div>
                      <div className="text-sm text-slate-600">
                        {testimonials[currentIndex].metricLabel}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-4 pointer-events-none">
              <Button 
                variant="outline" 
                size="icon"
                className="rounded-full bg-white shadow-lg pointer-events-auto"
                onClick={goToPrev}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                className="rounded-full bg-white shadow-lg pointer-events-auto"
                onClick={goToNext}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-green-600 w-8' 
                    : 'bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
