import { Badge } from '@/components/ui/badge';

interface HealthBadgeProps {
  score: number;
}

export function HealthBadge({ score }: HealthBadgeProps) {
  const level =
    score >= 80
      ? { label: 'Good', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
      : score >= 55
        ? { label: 'Watch', className: 'bg-amber-50 text-amber-700 border-amber-200' }
        : { label: 'At Risk', className: 'bg-red-50 text-red-700 border-red-200' };

  return (
    <Badge variant="outline" className={`rounded-full text-[10px] ${level.className}`}>
      {level.label} • {score}
    </Badge>
  );
}

/** Compute a simple health score for a workspace based on available metrics */
export function computeWorkspaceHealth(workspace: {
  is_suspended?: boolean;
  sending_paused?: boolean;
  phone_numbers_count?: number;
  members_count?: number;
  conversations_count?: number;
}): number {
  let score = 100;

  if (workspace.is_suspended) score -= 50;
  if (workspace.sending_paused) score -= 15;
  if ((workspace.phone_numbers_count ?? 0) === 0) score -= 20;
  if ((workspace.members_count ?? 0) <= 1) score -= 10;
  if ((workspace.conversations_count ?? 0) === 0) score -= 5;

  return Math.max(0, Math.min(100, score));
}
