import { 
  Hand as HandWaving,
  Moon,
  Search,
  Crown,
  Repeat,
  AlertTriangle,
  AlertOctagon,
  ShieldOff,
  Download,
  MessageSquare,
  Route,
  Clock,
  Shield
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StarterAutomation } from '@/types/automation';
import { CATEGORY_INFO } from '@/data/starterAutomations';

const ICON_MAP: Record<string, React.ElementType> = {
  HandWaving,
  Moon,
  Search,
  Crown,
  Repeat,
  AlertTriangle,
  AlertOctagon,
  ShieldOff,
  MessageSquare,
  Route,
  Clock,
  Shield,
};

interface StarterAutomationCardProps {
  automation: StarterAutomation;
  onInstall: (automation: StarterAutomation) => void;
  installing?: boolean;
}

export function StarterAutomationCard({
  automation,
  onInstall,
  installing = false,
}: StarterAutomationCardProps) {
  const IconComponent = ICON_MAP[automation.icon] || MessageSquare;
  const category = CATEGORY_INFO[automation.category];

  return (
    <Card className="group hover:shadow-md transition-all hover:border-primary/50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
            <IconComponent className="h-5 w-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-foreground truncate text-sm">
                {automation.name}
              </h3>
              <Badge variant="secondary" className={`text-xs ${category.color}`}>
                {category.label}
              </Badge>
            </div>
            
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
              {automation.description}
            </p>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => onInstall(automation)}
                disabled={installing}
              >
                <Download className="h-3 w-3 mr-1" />
                {installing ? 'Installing...' : 'Install'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
