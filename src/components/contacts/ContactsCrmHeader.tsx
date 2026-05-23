import { useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Users, RefreshCw, Upload, Download, Plus, ListPlus, ChevronDown } from 'lucide-react';
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
    <header className="sticky top-0 z-20 bg-card/95 backdrop-blur border-b border-border/60">
      <div className="px-4 md:px-6 py-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: title + meta */}
        <div className="flex items-start gap-3 min-w-0">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/15 to-emerald-500/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg md:text-xl font-bold tracking-tight truncate">Contacts</h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider">
                CRM
              </span>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              Manage your WhatsApp contacts, segments, and engagement
            </p>
            <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="tabular-nums">
                <span className="font-semibold text-foreground">{totalCount.toLocaleString()}</span> contacts
              </span>
              <span className="opacity-60">•</span>
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

        {/* Right: actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5">
                <Upload className="h-3.5 w-3.5" /> Import <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
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
              <Button variant="outline" size="sm" className="h-9 gap-1.5">
                <Download className="h-3.5 w-3.5" /> Export <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onSelect={onExportCsv}>
                <Download className="h-3.5 w-3.5 mr-2" /> Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onExportJson?.()}>
                <Download className="h-3.5 w-3.5 mr-2" /> Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={onCreateSegment}>
            <ListPlus className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Create</span> Segment
          </Button>

          <Button
            size="sm"
            className="h-9 gap-1.5 bg-emerald-600 hover:bg-emerald-600/90 text-white shadow-sm hover:shadow-md hover:shadow-emerald-500/30"
            onClick={onAddContact}
          >
            <Plus className="h-4 w-4" /> Add Contact
          </Button>
        </div>
      </div>
    </header>
  );
}
