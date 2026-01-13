import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, XCircle, TrendingUp, Info } from 'lucide-react';

interface TemplateScoreMeterProps {
  score: number;
  errorCount: number;
  warningCount: number;
  approvedCount?: number;
  rejectedCount?: number;
}

export function TemplateScoreMeter({
  score,
  errorCount,
  warningCount,
  approvedCount = 0,
  rejectedCount = 0
}: TemplateScoreMeterProps) {
  const getScoreColor = () => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-destructive';
  };

  const getScoreLabel = () => {
    if (score >= 90) return { label: 'Excellent', description: 'High chance of approval' };
    if (score >= 80) return { label: 'Very Good', description: 'Good chance of approval' };
    if (score >= 60) return { label: 'Good', description: 'Moderate chance of approval' };
    if (score >= 40) return { label: 'Fair', description: 'Some improvements needed' };
    return { label: 'Needs Work', description: 'Significant improvements needed' };
  };

  const getProgressColor = () => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-destructive';
  };

  const { label, description } = getScoreLabel();
  const totalHistory = approvedCount + rejectedCount;
  const approvalRate = totalHistory > 0 ? Math.round((approvedCount / totalHistory) * 100) : null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Template Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Display */}
        <div className="flex items-center justify-between">
          <div>
            <span className={`text-4xl font-bold ${getScoreColor()}`}>{score}</span>
            <span className="text-2xl text-muted-foreground">/100</span>
          </div>
          <Badge 
            variant="outline" 
            className={`text-base px-3 py-1 ${
              score >= 80 ? 'border-green-500 text-green-700' :
              score >= 60 ? 'border-yellow-500 text-yellow-700' :
              score >= 40 ? 'border-orange-500 text-orange-700' :
              'border-destructive text-destructive'
            }`}
          >
            {label}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
            <div 
              className={`h-full transition-all ${getProgressColor()}`}
              style={{ width: `${score}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>

        {/* Score Breakdown */}
        <div className="space-y-2 pt-2">
          <h4 className="text-sm font-medium">Score Factors</h4>
          
          <div className="grid gap-2">
            {/* Validation Issues */}
            <div className="flex items-center justify-between p-2 rounded bg-muted/50">
              <div className="flex items-center gap-2">
                {errorCount === 0 ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive" />
                )}
                <span className="text-sm">Validation Errors</span>
              </div>
              <Badge variant={errorCount === 0 ? 'secondary' : 'destructive'}>
                {errorCount}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-muted/50">
              <div className="flex items-center gap-2">
                {warningCount === 0 ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                )}
                <span className="text-sm">Warnings</span>
              </div>
              <Badge variant="secondary" className={warningCount > 0 ? 'bg-yellow-100 text-yellow-800' : ''}>
                {warningCount}
              </Badge>
            </div>

            {/* Historical Approval Rate */}
            {totalHistory > 0 && (
              <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Past Approval Rate</span>
                </div>
                <Badge variant="outline">
                  {approvalRate}% ({approvedCount}/{totalHistory})
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Improvement Tips */}
        {score < 80 && (
          <div className="pt-2 border-t">
            <h4 className="text-sm font-medium mb-2">Tips to Improve</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              {errorCount > 0 && (
                <li>• Fix all validation errors (-20 points each)</li>
              )}
              {warningCount > 0 && (
                <li>• Address warnings for better score (-5 points each)</li>
              )}
              <li>• Use clear, professional language</li>
              <li>• Match content to template category</li>
              <li>• Provide sample values for all variables</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
