import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles,
  MessageSquare,
  Bot,
  Send,
  Clock,
  GitBranch,
  Users,
  Zap,
  Tag,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const flowTemplates = [
  { label: 'Recover abandoned carts', icon: Zap },
  { label: 'Welcome new leads', icon: Users },
  { label: 'Follow up after 24hrs', icon: Clock },
  { label: 'Route to sales team', icon: GitBranch },
];

const flowNodes = [
  { id: 1, label: 'Cart Abandoned', type: 'trigger', icon: Zap, description: 'When customer leaves items' },
  { id: 2, label: 'Wait 1 Hour', type: 'delay', icon: Clock, description: 'Give time to return' },
  { id: 3, label: 'Send Reminder', type: 'action', icon: Send, description: 'WhatsApp template message' },
  { id: 4, label: 'Check Reply', type: 'condition', icon: GitBranch, description: 'Did they respond?' },
  { id: 5, label: 'Apply Tag', type: 'action', icon: Tag, description: 'Mark as engaged' },
  { id: 6, label: 'Offer Discount', type: 'action', icon: Sparkles, description: '10% off coupon' },
];

const nodeColors = {
  trigger: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'bg-purple-500', text: 'text-purple-700' },
  delay: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'bg-amber-500', text: 'text-amber-700' },
  action: { bg: 'bg-green-50', border: 'border-green-200', icon: 'bg-green-500', text: 'text-green-700' },
  condition: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'bg-blue-500', text: 'text-blue-700' },
};

export default function AIFlowBuilderSection() {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showFlow, setShowFlow] = useState(false);
  const [activeNodeIndex, setActiveNodeIndex] = useState(-1);

  const handleGenerateFlow = () => {
    if (!inputValue.trim()) {
      setInputValue('Recover abandoned carts');
    }
    setIsGenerating(true);
    setShowFlow(false);
    setActiveNodeIndex(-1);
    
    setTimeout(() => {
      setIsGenerating(false);
      setShowFlow(true);
      // Animate nodes appearing one by one
      flowNodes.forEach((_, index) => {
        setTimeout(() => setActiveNodeIndex(index), index * 300);
      });
    }, 1500);
  };

  const handleTemplateClick = (template: string) => {
    setInputValue(template);
    handleGenerateFlow();
  };

  return (
    <section className="py-10 sm:py-12 md:py-16 lg:py-20 bg-gradient-to-b from-green-50/50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <Badge className="mb-3 sm:mb-4 bg-green-100 text-green-700 border-0 text-xs sm:text-sm">
            <Bot className="w-3 sm:w-3.5 h-3 sm:h-3.5 mr-1 sm:mr-1.5" />
            AI Flow Builder
          </Badge>
          <h2 className="text-2xl xs:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-3 sm:mb-4">
            Describe Your Goal,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
              Get an Automation
            </span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 px-4">
            Type what you want to achieve in plain English — AI builds the complete flow for you
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Main Builder Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-4 sm:p-6 md:p-8">
            {/* Input Section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">AI Flow Generator</h3>
                  <p className="text-sm text-slate-500">Powered by AI</p>
                </div>
              </div>

              <div className="relative mb-4">
                <Input
                  placeholder="Type your business goal... e.g., 'Recover abandoned carts'"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerateFlow()}
                  className="h-12 sm:h-14 pr-32 sm:pr-36 text-sm sm:text-base border-slate-200 focus:border-green-500 focus:ring-green-500/20"
                />
                <Button
                  onClick={handleGenerateFlow}
                  disabled={isGenerating}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 sm:h-10 px-3 sm:px-4 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
                >
                  {isGenerating ? (
                    <span className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="hidden xs:inline">Generating...</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                      <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                      Generate
                    </span>
                  )}
                </Button>
              </div>

              {/* Quick Templates */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-slate-500">Try:</span>
                {flowTemplates.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => handleTemplateClick(template.label)}
                    className="text-xs px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors flex items-center gap-1"
                  >
                    <template.icon className="w-3 h-3" />
                    {template.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Flow Preview */}
            <div className="border-t border-slate-100 pt-6">
              <div className={cn(
                "relative min-h-[300px] sm:min-h-[350px] transition-all duration-500",
                showFlow ? "opacity-100" : "opacity-60"
              )}>
                {!showFlow && !isGenerating && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                        <Bot className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-sm text-slate-500 mb-2">Type your goal and click Generate</p>
                      <p className="text-xs text-slate-400">AI will create a complete automation flow</p>
                    </div>
                  </div>
                )}
                
                {isGenerating && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center">
                          <Sparkles className="w-8 h-8 text-green-600 animate-pulse" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-ping" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-slate-700">AI is analyzing your goal...</p>
                        <p className="text-xs text-slate-500 mt-1">Building optimal automation flow</p>
                      </div>
                    </div>
                  </div>
                )}

                {showFlow && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm font-medium text-green-700">Flow Generated Successfully</span>
                      </div>
                      <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                        6 Nodes
                      </Badge>
                    </div>

                    <div className="grid gap-3">
                      {flowNodes.map((node, index) => {
                        const colors = nodeColors[node.type as keyof typeof nodeColors];
                        const isVisible = index <= activeNodeIndex;
                        
                        return (
                          <div 
                            key={node.id}
                            className={cn(
                              "flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border transition-all duration-300",
                              colors.bg, colors.border,
                              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                            )}
                          >
                            <div className={cn(
                              "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0",
                              colors.icon
                            )}>
                              <node.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-900 text-sm sm:text-base">{node.label}</span>
                                <Badge className={cn("text-[10px] border-0", colors.bg, colors.text)}>
                                  {node.type}
                                </Badge>
                              </div>
                              <p className="text-xs sm:text-sm text-slate-500 truncate">{node.description}</p>
                            </div>
                            {index < flowNodes.length - 1 && (
                              <ArrowRight className="w-4 h-4 text-slate-300 hidden sm:block" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex flex-col xs:flex-row gap-3 mt-6">
                      <Button 
                        className="flex-1 h-12 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
                        onClick={() => navigate('/signup')}
                      >
                        Use This Flow
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      <Button 
                        variant="outline"
                        className="flex-1 h-12 border-slate-300"
                        onClick={() => {
                          setShowFlow(false);
                          setInputValue('');
                          setActiveNodeIndex(-1);
                        }}
                      >
                        Try Another
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Stats */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10 mt-8 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">50+</div>
              <div className="text-xs sm:text-sm text-slate-500">Flow Templates</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-green-600">95%</div>
              <div className="text-xs sm:text-sm text-slate-500">Time Saved</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">2 min</div>
              <div className="text-xs sm:text-sm text-slate-500">Avg. Setup Time</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
