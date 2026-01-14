import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Calendar as CalendarIcon,
  Phone,
  Users,
  Filter,
  Bookmark,
  RefreshCw,
} from 'lucide-react';
import type { DashboardFilters } from '@/types/dashboard';
import { format } from 'date-fns';

interface DashboardFiltersBarProps {
  filters: DashboardFilters;
  onChange: (filters: DashboardFilters) => void;
  onRefresh: () => void;
  loading?: boolean;
}

const dateRangeOptions = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: 'custom', label: 'Custom Range' },
];

const sourceOptions = [
  { value: 'all', label: 'All Sources' },
  { value: 'meta_ads', label: 'Meta Ads' },
  { value: 'website', label: 'Website' },
  { value: 'qr', label: 'QR Code' },
  { value: 'api', label: 'API' },
];

export function DashboardFiltersBar({
  filters,
  onChange,
  onRefresh,
  loading,
}: DashboardFiltersBarProps) {
  const [savedPresets] = useState([
    { name: 'Ops View', filters: { dateRange: '7d', source: 'all' } },
    { name: 'Sales View', filters: { dateRange: 'today', source: 'meta_ads' } },
  ]);

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-lg border">
      {/* Date Range */}
      <div className="flex items-center gap-2">
        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
        <Select
          value={filters.dateRange}
          onValueChange={(value) => onChange({ ...filters, dateRange: value as any })}
        >
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {dateRangeOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Phone Number filter */}
      <div className="flex items-center gap-2">
        <Phone className="w-4 h-4 text-muted-foreground" />
        <Select
          value={filters.phoneNumberId || 'all'}
          onValueChange={(value) => onChange({ ...filters, phoneNumberId: value === 'all' ? null : value })}
        >
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="All Numbers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Numbers</SelectItem>
            {/* Phone numbers would be populated dynamically */}
          </SelectContent>
        </Select>
      </div>

      {/* Team filter */}
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-muted-foreground" />
        <Select
          value={filters.teamId || 'all'}
          onValueChange={(value) => onChange({ ...filters, teamId: value === 'all' ? null : value })}
        >
          <SelectTrigger className="w-[130px] h-9">
            <SelectValue placeholder="All Teams" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Teams</SelectItem>
            {/* Teams would be populated dynamically */}
          </SelectContent>
        </Select>
      </div>

      {/* Source filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <Select
          value={filters.source}
          onValueChange={(value) => onChange({ ...filters, source: value as any })}
        >
          <SelectTrigger className="w-[130px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sourceOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Saved presets */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1 h-9">
            <Bookmark className="w-4 h-4" />
            Presets
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2">
          <div className="space-y-1">
            {savedPresets.map((preset) => (
              <Button
                key={preset.name}
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => onChange({ ...filters, ...preset.filters } as DashboardFilters)}
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Refresh button */}
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 ml-auto"
        onClick={onRefresh}
        disabled={loading}
      >
        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
}
