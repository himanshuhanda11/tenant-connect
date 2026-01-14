import { useState } from 'react';
import { Contact } from '@/types/contact';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  Brain, 
  Globe, 
  Building2, 
  Briefcase,
  MapPin,
  Languages,
  Clock,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ContactEnrichmentCardProps {
  contact: Contact;
  onEnrich?: (enrichedData: Partial<Contact>) => void;
}

interface EnrichmentField {
  key: string;
  label: string;
  value: string | null;
  icon: React.ReactNode;
  confidence: number;
  source: string;
}

export function ContactEnrichmentCard({ contact, onEnrich }: ContactEnrichmentCardProps) {
  const [loading, setLoading] = useState(false);
  const [enrichmentData, setEnrichmentData] = useState<EnrichmentField[] | null>(null);

  // Calculate enrichment completeness
  const completenessFields = [
    contact.name,
    contact.country,
    contact.language,
    contact.timezone,
    contact.source,
    contact.segment,
  ];
  const filledFields = completenessFields.filter(Boolean).length;
  const completenessScore = Math.round((filledFields / completenessFields.length) * 100);

  const handleEnrich = async () => {
    setLoading(true);
    
    // Simulate AI enrichment (in real app, this would call an edge function)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockEnrichment: EnrichmentField[] = [
      {
        key: 'country',
        label: 'Country',
        value: contact.country || 'United States',
        icon: <MapPin className="h-4 w-4" />,
        confidence: 95,
        source: 'Phone number analysis',
      },
      {
        key: 'timezone',
        label: 'Timezone',
        value: contact.timezone || 'America/New_York',
        icon: <Clock className="h-4 w-4" />,
        confidence: 90,
        source: 'Location inference',
      },
      {
        key: 'language',
        label: 'Primary Language',
        value: contact.language || 'English',
        icon: <Languages className="h-4 w-4" />,
        confidence: 85,
        source: 'Message analysis',
      },
      {
        key: 'segment',
        label: 'Suggested Segment',
        value: 'High-Value Prospect',
        icon: <Building2 className="h-4 w-4" />,
        confidence: 78,
        source: 'Behavioral analysis',
      },
    ];
    
    setEnrichmentData(mockEnrichment);
    setLoading(false);
    toast.success('Contact enriched with AI insights');
  };

  const applyEnrichment = () => {
    if (!enrichmentData || !onEnrich) return;
    
    const updates: Partial<Contact> = {};
    enrichmentData.forEach(field => {
      if (field.value && field.confidence > 70) {
        (updates as Record<string, unknown>)[field.key] = field.value;
      }
    });
    
    onEnrich(updates);
    toast.success('Enrichment data applied');
  };

  return (
    <div className="space-y-4">
      {/* Profile Completeness */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/20 border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Profile Completeness</span>
          </div>
          <Badge variant="secondary" className={cn(
            completenessScore >= 80 ? 'bg-emerald-100 text-emerald-700' :
            completenessScore >= 50 ? 'bg-amber-100 text-amber-700' :
            'bg-red-100 text-red-700'
          )}>
            {completenessScore}%
          </Badge>
        </div>
        <Progress value={completenessScore} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2">
          {filledFields} of {completenessFields.length} fields populated
        </p>
      </div>

      {/* Enrichment Button */}
      {!enrichmentData && (
        <Button
          onClick={handleEnrich}
          disabled={loading}
          className="w-full gap-2"
          variant="outline"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Enriching with AI...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Enrich with AI
            </>
          )}
        </Button>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
          ))}
        </div>
      )}

      {/* Enrichment Results */}
      {enrichmentData && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
            <CheckCircle className="h-4 w-4" />
            AI Enrichment Complete
          </div>
          
          {enrichmentData.map((field) => (
            <div 
              key={field.key}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-muted"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                {field.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground">{field.label}</div>
                <div className="font-medium truncate">{field.value}</div>
              </div>
              <div className="text-right shrink-0">
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-xs",
                    field.confidence >= 85 ? 'bg-emerald-100 text-emerald-700' :
                    field.confidence >= 70 ? 'bg-amber-100 text-amber-700' :
                    'bg-muted text-muted-foreground'
                  )}
                >
                  {field.confidence}%
                </Badge>
                <div className="text-[10px] text-muted-foreground mt-1">
                  {field.source}
                </div>
              </div>
            </div>
          ))}

          {onEnrich && (
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={applyEnrichment}
                className="flex-1 gap-2"
                size="sm"
              >
                <CheckCircle className="h-4 w-4" />
                Apply All
              </Button>
              <Button 
                variant="outline"
                onClick={() => setEnrichmentData(null)}
                size="sm"
              >
                Dismiss
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Pro Features Teaser */}
      <div className="p-3 rounded-lg bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200">
        <div className="flex items-center gap-2 text-violet-700">
          <Lock className="h-4 w-4" />
          <span className="text-xs font-medium">Pro Feature</span>
        </div>
        <p className="text-xs text-violet-600 mt-1">
          Upgrade for advanced enrichment: company data, social profiles, and predictive scoring.
        </p>
      </div>
    </div>
  );
}
