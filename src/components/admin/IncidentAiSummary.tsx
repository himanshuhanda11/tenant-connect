import { useState } from 'react';
import { useAdminApi } from '@/hooks/useAdminApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface IncidentAiSummaryProps {
  incidentId: string;
}

export function IncidentAiSummary({ incidentId }: IncidentAiSummaryProps) {
  const { post } = useAdminApi();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    try {
      const data = await post(`incidents/${incidentId}/ai-summary`, {});
      setSummary(data.summary || 'No summary available.');
    } catch (e: any) {
      toast({ title: 'AI Summary failed', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-2xl shadow-sm border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-purple-50 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-purple-600" />
          </div>
          AI Incident Summary
        </CardTitle>
        <Button
          size="sm"
          variant="outline"
          className="rounded-xl h-7 text-xs"
          onClick={generate}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
          {loading ? 'Analyzing...' : 'Generate'}
        </Button>
      </CardHeader>
      <CardContent>
        {summary ? (
          <div className="bg-muted/50 rounded-xl p-4 text-sm whitespace-pre-wrap leading-relaxed">
            {summary}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Generate an executive summary and timeline from incident logs and actions.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
