import { useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  Users,
  RefreshCw,
  Upload,
  Download,
  Plus,
  ListPlus,
  ChevronDown,
  Search,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface Props {
  totalCount: number;
  loading?: boolean;
  lastSyncAt?: Date | null;
  onRefresh: () => void;
  onImportCsv?: () => void;
  onImportFromMeta?: () => void;
  onExportCsv: () => void;
  onExportJson?: () => void;
  onCreateSegment: () => void;
  onAddContact: () => void;
  searchValue?: string;
  onSearchChange?: (v: string) => void;
}

export function ContactsCrmHeader({
  totalCount,
  loading,
  lastSyncAt,
  onRefresh,
  onImportCsv,
  onImportFromMeta,
  onExportCsv,
  onExportJson,
  onCreateSegment,
  onAddContact,
  searchValue,
  onSearchChange,
}: Props) {
  const syncLabel = useMemo(() => {
    if (!lastSyncAt) return 'just now';
    try {
      return formatDistanceToNow(lastSyncAt, { addSuffix: true });
    } catch {
      return 'just now';
    }
  }, [lastSyncAt]);

  return (
    <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border/40">
      {/* Soft ambient gradient strip */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="px-4 md:px-8 py-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: title + meta */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/20 via-emerald-500/10 to-transparent border border-primary/20 flex items-center justify-center shrink-0 shadow-sm">
            <Users className="h-5 w-5 text-primary" />
            <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-background animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight truncate">Contacts</h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-primary/15 to-emerald-500/10 text-primary text-[10px] font-semibold uppercase tracking-wider border border-primary/20">
                <Sparkles className="h-2.5 w-2.5" /> CRM
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2.5 text-xs text-muted-foreground">
              <span className="tabular-nums">
                <span className="font-semibold text-foreground">{totalCount.toLocaleString()}</span> total
              </span>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
              <button
                onClick={onRefresh}
                className="inline-flex items-center gap-1 hover:text-foreground transition"
                disabled={loading}
              >
                <RefreshCw className={cn('h-3 w-3', loading && 'animate-spin')} />
                Synced {syncLabel}
              </button>
            </div>
          </div>
        </div>

        {/* Right: search + actions */}
        <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap">
          {onSearchChange && (
            <div className="relative flex-1 lg:flex-none lg:w-72 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={searchValue ?? ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search contacts, phone, tag…"
                className="w-full h-10 pl-9 pr-3 rounded-xl bg-muted/40 hover:bg-muted/60 focus:bg-card border border-border/60 focus:border-primary/40 focus:ring-2 focus:ring-primary/15 outline-none text-sm transition placeholder:text-muted-foreground/70"
              />
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-10 rounded-xl gap-1.5 border-border/60 hover:border-border hover:bg-muted/50">
                <Upload className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Import</span> <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-xl">
              <DropdownMenuItem onSelect={() => onImportCsv?.()}>
                <Upload className="h-3.5 w-3.5 mr-2" /> Import CSV
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onImportFromMeta?.()}>
                <Upload className="h-3.5 w-3.5 mr-2" /> From Meta Lead Forms
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-10 rounded-xl gap-1.5 border-border/60 hover:border-border hover:bg-muted/50">
                <Download className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Export</span> <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-xl">
              <DropdownMenuItem onSelect={onExportCsv}>
                <Download className="h-3.5 w-3.5 mr-2" /> Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onExportJson?.()}>
                <Download className="h-3.5 w-3.5 mr-2" /> Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            className="h-10 rounded-xl gap-1.5 border-border/60 hover:border-border hover:bg-muted/50"
            onClick={onCreateSegment}
          >
            <ListPlus className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Segment</span>
          </Button>

          <Button
            size="sm"
            onClick={onAddContact}
            className={cn(
              'h-10 px-4 rounded-xl gap-1.5 font-semibold',
              'bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-600',
              'text-white shadow-[0_4px_16px_-4px_hsl(152_60%_40%/0.5)] hover:shadow-[0_6px_20px_-4px_hsl(152_60%_40%/0.65)]',
              'hover:-translate-y-[1px] transition-all'
            )}
          >
            <Plus className="h-4 w-4" /> Add Contact
          </Button>
        </div>
      </div>
    </header>
  );
}
