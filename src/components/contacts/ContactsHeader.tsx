import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Plus, 
  Upload, 
  Download, 
  FolderPlus,
  RefreshCw,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ContactsHeaderProps {
  totalCount: number;
  loading: boolean;
  onRefresh: () => void;
  onExport: () => void;
  onCreateSegment: () => void;
  onAddContact: () => void;
}

export function ContactsHeader({
  totalCount,
  loading,
  onRefresh,
  onExport,
  onCreateSegment,
  onAddContact,
}: ContactsHeaderProps) {
  return (
    <div className="shrink-0 px-6 py-5 border-b bg-gradient-to-r from-background via-background to-muted/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
              <Badge variant="secondary" className="font-medium">
                {totalCount.toLocaleString()} total
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm mt-0.5">
              Manage your WhatsApp contacts, segments, and engagement
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onRefresh} 
            disabled={loading}
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Upload className="h-4 w-4" />
                Import / Export
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link to="/contacts/imports" className="flex items-center gap-2 cursor-pointer">
                  <Upload className="h-4 w-4" />
                  Import CSV
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExport} className="gap-2 cursor-pointer">
                <Download className="h-4 w-4" />
                Export CSV
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/contacts/duplicates" className="flex items-center gap-2 cursor-pointer">
                  <Users className="h-4 w-4" />
                  Find Duplicates
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" size="sm" onClick={onCreateSegment} className="gap-2">
            <FolderPlus className="h-4 w-4" />
            Create Segment
          </Button>
          
          <Button onClick={onAddContact} className="gap-2 shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4" />
            Add Contact
          </Button>
        </div>
      </div>
    </div>
  );
}
