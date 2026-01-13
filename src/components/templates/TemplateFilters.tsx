import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { TemplateCategory, TemplateStatus, IndustryType, INDUSTRIES } from '@/hooks/useTemplates';

interface TemplateFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  industry: IndustryType | 'all';
  onIndustryChange: (value: IndustryType | 'all') => void;
  category: TemplateCategory | 'all';
  onCategoryChange: (value: TemplateCategory | 'all') => void;
  status: TemplateStatus | 'all';
  onStatusChange: (value: TemplateStatus | 'all') => void;
  language: string;
  onLanguageChange: (value: string) => void;
  onReset: () => void;
}

export function TemplateFilters({
  search,
  onSearchChange,
  industry,
  onIndustryChange,
  category,
  onCategoryChange,
  status,
  onStatusChange,
  language,
  onLanguageChange,
  onReset,
}: TemplateFiltersProps) {
  const hasActiveFilters =
    search ||
    industry !== 'all' ||
    category !== 'all' ||
    status !== 'all' ||
    language;

  const languages = [
    { code: 'all', name: 'All Languages' },
    { code: 'en', name: 'English' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'pt', name: 'Portuguese' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Industry */}
      <Select value={industry} onValueChange={(v) => onIndustryChange(v as IndustryType | 'all')}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Industry" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Industries</SelectItem>
          {INDUSTRIES.map((ind) => (
            <SelectItem key={ind.id} value={ind.id}>
              {ind.icon} {ind.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Category */}
      <Select value={category} onValueChange={(v) => onCategoryChange(v as TemplateCategory | 'all')}>
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="UTILITY">🟢 Utility</SelectItem>
          <SelectItem value="MARKETING">🔵 Marketing</SelectItem>
          <SelectItem value="AUTHENTICATION">🟣 Authentication</SelectItem>
        </SelectContent>
      </Select>

      {/* Status */}
      <Select value={status} onValueChange={(v) => onStatusChange(v as TemplateStatus | 'all')}>
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="APPROVED">Approved</SelectItem>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="REJECTED">Rejected</SelectItem>
          <SelectItem value="PAUSED">Paused</SelectItem>
          <SelectItem value="DISABLED">Disabled</SelectItem>
        </SelectContent>
      </Select>

      {/* Language */}
      <Select value={language || 'all'} onValueChange={(v) => onLanguageChange(v === 'all' ? '' : v)}>
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Reset */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onReset}>
          <X className="h-4 w-4 mr-1" />
          Reset
        </Button>
      )}
    </div>
  );
}
