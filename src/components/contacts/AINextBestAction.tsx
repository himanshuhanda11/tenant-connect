import { useState, useEffect } from 'react';
import { Contact } from '@/types/contact';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Lightbulb, 
  MessageSquare, 
  Send, 
  Tag, 
  UserPlus, 
  Clock,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AINextBestActionProps {
  contact: Contact;
  onAction?: (action: string, data?: Record<string, unknown>) => void;
}

interface SuggestedAction {
  id: string;
  type: 'message' | 'tag' | 'assign' | 'followup' | 'escalate' | 'campaign';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  impact: string;
  confidence: number;
  icon: React.ReactNode;
}

export function AINextBestAction({ contact, onAction }: AINextBestActionProps) {
  const [loading, setLoading] = useState(true);
  const [actions, setActions] = useState<SuggestedAction[]>([]);

  useEffect(() => {
    // Simulate AI analysis
    const timer = setTimeout(() => {
      const suggestedActions = generateActions(contact);
      setActions(suggestedActions);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [contact]);

  const generateActions = (contact: Contact): SuggestedAction[] => {
    const suggestions: SuggestedAction[] = [];

    // Check for follow-up needed
    if (contact.followup_due) {
      const dueDate = new Date(contact.followup_due);
      if (dueDate <= new Date()) {
        suggestions.push({
          id: 'followup-overdue',
          type: 'followup',
          title: 'Overdue Follow-up',
          description: 'Scheduled follow-up is past due. Reach out now to maintain momentum.',
          priority: 'high',
          impact: '+40% reply rate if contacted within 24h',
          confidence: 95,
          icon: <AlertTriangle className="h-5 w-5" />,
        });
      }
    }

    // Check engagement
    if (contact.mau_status === 'inactive') {
      suggestions.push({
        id: 're-engage',
        type: 'campaign',
        title: 'Re-engagement Campaign',
        description: 'Contact has been inactive. Send a personalized check-in message.',
        priority: 'medium',
        impact: '25% of inactive contacts re-engage after outreach',
        confidence: 78,
        icon: <TrendingUp className="h-5 w-5" />,
      });
    }

    // Check for hot leads
    if (contact.lead_status === 'qualified' && contact.priority_level === 'high') {
      suggestions.push({
        id: 'proposal',
        type: 'message',
        title: 'Send Proposal',
        description: 'High-value qualified lead ready for proposal. Strike while hot!',
        priority: 'high',
        impact: 'Qualified leads convert 3x faster with timely proposals',
        confidence: 88,
        icon: <Send className="h-5 w-5" />,
      });
    }

    // Check for unassigned contacts
    if (!contact.assigned_agent_id && contact.priority_level !== 'low') {
      suggestions.push({
        id: 'assign',
        type: 'assign',
        title: 'Assign to Agent',
        description: 'This contact needs dedicated attention. Assign to an available agent.',
        priority: contact.priority_level === 'urgent' ? 'high' : 'medium',
        impact: 'Assigned contacts see 60% faster resolution',
        confidence: 92,
        icon: <UserPlus className="h-5 w-5" />,
      });
    }

    // Check for tagging opportunities
    if (!contact.tags?.length) {
      suggestions.push({
        id: 'tag',
        type: 'tag',
        title: 'Add Tags',
        description: 'Categorize this contact for better segmentation and automation.',
        priority: 'low',
        impact: 'Tagged contacts get 45% more relevant communications',
        confidence: 85,
        icon: <Tag className="h-5 w-5" />,
      });
    }

    // Default suggestion if none apply
    if (suggestions.length === 0) {
      suggestions.push({
        id: 'nurture',
        type: 'message',
        title: 'Continue Nurturing',
        description: 'Contact is on track. Consider sending value-add content.',
        priority: 'low',
        impact: 'Consistent nurturing increases conversion by 20%',
        confidence: 70,
        icon: <MessageSquare className="h-5 w-5" />,
      });
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  };

  const handleAction = (action: SuggestedAction) => {
    onAction?.(action.type, { actionId: action.id });
  };

  const priorityColors = {
    high: 'border-red-200 bg-red-50',
    medium: 'border-amber-200 bg-amber-50',
    low: 'border-slate-200 bg-slate-50',
  };

  const priorityBadgeColors = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-slate-100 text-slate-700',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <RefreshCw className="h-5 w-5 animate-spin mr-2" />
        <span className="text-sm">AI analyzing contact...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-gradient-to-br from-violet-100 to-purple-100">
          <Sparkles className="h-4 w-4 text-violet-600" />
        </div>
        <div>
          <h4 className="text-sm font-semibold">AI Recommended Actions</h4>
          <p className="text-xs text-muted-foreground">Based on contact behavior & patterns</p>
        </div>
      </div>

      {/* Action Cards */}
      <div className="space-y-3">
        {actions.map((action, index) => (
          <Card 
            key={action.id}
            className={cn(
              "p-4 border-l-4 transition-all hover:shadow-md cursor-pointer",
              priorityColors[action.priority]
            )}
            onClick={() => handleAction(action)}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "p-2 rounded-lg shrink-0",
                action.priority === 'high' ? 'bg-red-100 text-red-600' :
                action.priority === 'medium' ? 'bg-amber-100 text-amber-600' :
                'bg-slate-100 text-slate-600'
              )}>
                {action.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{action.title}</span>
                  <Badge className={cn("text-[10px]", priorityBadgeColors[action.priority])}>
                    {action.priority}
                  </Badge>
                  {index === 0 && (
                    <Badge variant="secondary" className="text-[10px] bg-violet-100 text-violet-700">
                      Top Pick
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {action.description}
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Lightbulb className="h-3 w-3" />
                    {action.impact}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {action.confidence}% confidence
                  </span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>
          </Card>
        ))}
      </div>

      {/* Refresh */}
      <Button 
        variant="ghost" 
        size="sm" 
        className="w-full text-muted-foreground"
        onClick={() => {
          setLoading(true);
          setTimeout(() => {
            setActions(generateActions(contact));
            setLoading(false);
          }, 1000);
        }}
      >
        <RefreshCw className="h-3 w-3 mr-2" />
        Refresh Recommendations
      </Button>
    </div>
  );
}
