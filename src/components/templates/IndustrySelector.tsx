import { cn } from '@/lib/utils';
import { INDUSTRIES, IndustryType } from '@/hooks/useTemplates';

interface IndustrySelectorProps {
  selected: IndustryType | 'all';
  onSelect: (industry: IndustryType | 'all') => void;
}

export function IndustrySelector({ selected, onSelect }: IndustrySelectorProps) {
  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex gap-3 min-w-max">
        {/* All Industries */}
        <button
          onClick={() => onSelect('all')}
          className={cn(
            'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all min-w-[120px]',
            'hover:border-primary/50 hover:bg-accent/50',
            selected === 'all'
              ? 'border-primary bg-accent shadow-soft'
              : 'border-border bg-card'
          )}
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-2xl">
            📋
          </div>
          <div className="text-center">
            <p className="font-medium text-sm">All Templates</p>
            <p className="text-xs text-muted-foreground">
              {INDUSTRIES.reduce((acc, i) => acc + i.count, 0)} available
            </p>
          </div>
        </button>

        {/* Industry Cards */}
        {INDUSTRIES.map((industry) => (
          <button
            key={industry.id}
            onClick={() => onSelect(industry.id)}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all min-w-[120px]',
              'hover:border-primary/50 hover:bg-accent/50',
              selected === industry.id
                ? 'border-primary bg-accent shadow-soft'
                : 'border-border bg-card'
            )}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-2xl">
              {industry.icon}
            </div>
            <div className="text-center">
              <p className="font-medium text-sm">{industry.name}</p>
              <p className="text-xs text-muted-foreground">
                {industry.count} templates
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
