import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Play,
  Sparkles,
  MessageSquare,
  Bot,
  Send,
  CheckCircle,
  Users,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const flowNodes = [
  { id: 1, label: 'Cart Abandoned', type: 'trigger', icon: Zap },
  { id: 2, label: 'Wait 1 hour', type: 'delay', icon: MessageSquare },
  { id: 3, label: 'Send Reminder', type: 'action', icon: Send },
  { id: 4, label: 'Check Reply', type: 'condition', icon: Bot },
  { id: 5, label: 'Offer Discount', type: 'action', icon: Sparkles },
];

export default function HeroSection() {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showFlow, setShowFlow] = useState(false);

  const handleGenerateFlow = () => {
    if (!inputValue.trim()) {
      setInputValue('Recover abandoned carts');
    }
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowFlow(true);
    }, 1500);
  };

  return (
    <section className="relative min-h-[85vh] lg:min-h-[90vh] flex items-center bg-white overflow-hidden">
      {/* Subtle AI-inspired background shapes */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient orbs - smaller on mobile */}
        <div className="absolute top-10 sm:top-20 right-[5%] sm:right-[10%] w-[200px] sm:w-[350px] lg:w-[500px] h-[200px] sm:h-[350px] lg:h-[500px] bg-gradient-to-br from-green-100/60 via-emerald-50/40 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-5 sm:bottom-10 left-[5%] w-[150px] sm:w-[280px] lg:w-[400px] h-[150px] sm:h-[280px] lg:h-[400px] bg-gradient-to-tr from-blue-50/50 via-cyan-50/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] lg:w-[800px] h-[400px] sm:h-[600px] lg:h-[800px] bg-gradient-to-r from-green-50/20 via-transparent to-emerald-50/20 rounded-full blur-3xl" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:40px_40px] sm:bg-[size:60px_60px] lg:bg-[size:80px_80px]" />
        
        {/* Abstract shapes - hidden on small mobile */}
        <svg className="absolute top-32 right-[15%] w-10 sm:w-12 lg:w-16 h-10 sm:h-12 lg:h-16 text-green-200/60 hidden xs:block" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="currentColor" />
        </svg>
        <svg className="absolute bottom-40 left-[20%] w-8 sm:w-10 lg:w-12 h-8 sm:h-10 lg:h-12 text-blue-100/80 hidden xs:block" viewBox="0 0 100 100">
          <rect x="10" y="10" width="80" height="80" rx="20" fill="currentColor" />
        </svg>
      </div>

      <div className="container mx-auto px-4 py-10 sm:py-14 md:py-16 lg:py-20 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <Badge className="mb-4 sm:mb-6 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">
                <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5 mr-1.5 sm:mr-2" />
                AI-Powered WhatsApp Platform
              </Badge>
              
              <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6 text-slate-900">
                Run WhatsApp Like a{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
                  Growth Machine
                </span>
                {' '}— Powered by AI.
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-slate-600 mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0">
                AI-driven WhatsApp automation, team inbox, Meta Ads attribution, and flow diagnostics — all in one platform.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col xs:flex-row flex-wrap gap-3 sm:gap-4 mb-4 sm:mb-6 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 shadow-lg shadow-green-500/25 transition-all hover:shadow-xl hover:shadow-green-500/30" 
                  onClick={() => navigate('/signup')}
                >
                  Start Free Trial
                  <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base border-slate-300 hover:bg-slate-50" 
                  onClick={() => navigate('/contact')}
                >
                  Book Demo
                </Button>
                <Button 
                  variant="ghost" 
                  size="lg" 
                  className="h-12 sm:h-14 px-4 sm:px-6 text-sm sm:text-base text-green-700 hover:text-green-800 hover:bg-green-50" 
                  onClick={() => navigate('/dashboard')}
                >
                  <Play className="w-4 sm:w-5 h-4 sm:h-5 mr-2 fill-green-600" />
                  Try Live Demo
                </Button>
              </div>

              {/* Trust Line */}
              <div className="text-xs sm:text-sm text-slate-500 flex items-center gap-2 justify-center lg:justify-start flex-wrap">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-green-500" />
                  No credit card
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-green-500" />
                  Setup in minutes
                </span>
                <span className="hidden xs:inline text-slate-300">•</span>
                <span className="hidden xs:flex items-center gap-1">
                  <CheckCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-green-500" />
                  WhatsApp Cloud API
                </span>
              </div>
            </div>

            {/* Right - Interactive AI Demo */}
            <div className="relative order-1 lg:order-2">
              {/* AI Demo Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-200/50 p-4 sm:p-6 md:p-8">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">AI Flow Generator</h3>
                    <p className="text-sm text-slate-500">Describe your goal, get an automation</p>
                  </div>
                </div>

                {/* Input */}
                <div className="relative mb-6">
                  <Input
                    placeholder="Recover abandoned carts"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="h-14 pr-36 text-base border-slate-200 focus:border-green-500 focus:ring-green-500/20"
                  />
                  <Button
                    onClick={handleGenerateFlow}
                    disabled={isGenerating}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
                  >
                    {isGenerating ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Generate
                      </span>
                    )}
                  </Button>
                </div>

                {/* Flow Preview */}
                <div className={cn(
                  "relative min-h-[200px] transition-all duration-500",
                  showFlow ? "opacity-100" : "opacity-50"
                )}>
                  {!showFlow && !isGenerating && (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                      <p className="text-sm">Type your goal and click Generate</p>
                    </div>
                  )}
                  
                  {isGenerating && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-green-600 animate-pulse" />
                        </div>
                        <p className="text-sm text-slate-500">AI is generating your flow...</p>
                      </div>
                    </div>
                  )}

                  {showFlow && (
                    <div className="space-y-3">
                      {flowNodes.map((node, index) => (
                        <div 
                          key={node.id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border transition-all duration-300",
                            "animate-fade-in",
                            node.type === 'trigger' && "bg-purple-50 border-purple-200",
                            node.type === 'delay' && "bg-amber-50 border-amber-200",
                            node.type === 'action' && "bg-green-50 border-green-200",
                            node.type === 'condition' && "bg-blue-50 border-blue-200"
                          )}
                          style={{ animationDelay: `${index * 150}ms` }}
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center",
                            node.type === 'trigger' && "bg-purple-500",
                            node.type === 'delay' && "bg-amber-500",
                            node.type === 'action' && "bg-green-500",
                            node.type === 'condition' && "bg-blue-500"
                          )}>
                            <node.icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium text-slate-700 text-sm">{node.label}</span>
                          {index < flowNodes.length - 1 && (
                            <ArrowRight className="w-4 h-4 text-slate-300 ml-auto" />
                          )}
                        </div>
                      ))}
                      <Button 
                        className="w-full mt-4 bg-slate-900 hover:bg-slate-800"
                        onClick={() => navigate('/signup')}
                      >
                        Use This Flow
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Floating Stats */}
              <div className="absolute -bottom-2 sm:-bottom-4 -left-2 sm:-left-4 bg-white rounded-lg sm:rounded-xl border border-slate-200 shadow-lg p-2 sm:p-4 hidden sm:block animate-fade-in">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Users className="w-4 sm:w-5 h-4 sm:h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm sm:text-lg font-bold text-slate-900">2,000+</div>
                    <div className="text-[10px] sm:text-xs text-slate-500">Active Teams</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 bg-white rounded-lg sm:rounded-xl border border-slate-200 shadow-lg p-2 sm:p-4 hidden sm:block animate-fade-in" style={{ animationDelay: '200ms' }}>
                <div className="text-lg sm:text-2xl font-bold text-green-600">98.5%</div>
                <div className="text-[10px] sm:text-xs text-slate-500">Delivery Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
