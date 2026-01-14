import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  UserMinus,
  Filter,
} from 'lucide-react';
import type { ContactsGrowth } from '@/types/dashboard';

interface ContactsGrowthPanelProps {
  data: ContactsGrowth | null;
  loading?: boolean;
}

export function ContactsGrowthPanel({ data, loading }: ContactsGrowthPanelProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Contacts Growth
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/contacts/segments')}>
              <Filter className="w-4 h-4 mr-1" /> Segments
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/contacts')}>
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* New contacts stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-200/50">
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs text-muted-foreground">Today</span>
            </div>
            <p className="text-xl font-bold text-green-700">
              +{data?.newContactsToday || 0}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-200/50">
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-muted-foreground">7 Days</span>
            </div>
            <p className="text-xl font-bold text-blue-700">
              +{data?.newContacts7d || 0}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-200/50">
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-muted-foreground">30 Days</span>
            </div>
            <p className="text-xl font-bold text-purple-700">
              +{data?.newContacts30d || 0}
            </p>
          </div>
        </div>

        {/* Opt-outs */}
        {(data?.optOuts7d || 0) > 0 && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10 border border-red-200">
            <UserMinus className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-700">
              {data?.optOuts7d} opt-outs in last 7 days
            </span>
          </div>
        )}

        {/* Top sources */}
        <div>
          <p className="text-sm font-medium mb-2">Top Sources</p>
          <div className="flex flex-wrap gap-2">
            {(data?.topSources || []).map((source) => (
              <Badge key={source.source} variant="secondary" className="gap-1">
                {source.source}
                <span className="font-bold">{source.count}</span>
              </Badge>
            ))}
          </div>
        </div>

        {/* Top segments */}
        <div>
          <p className="text-sm font-medium mb-2">Top Segments</p>
          <div className="space-y-2">
            {(data?.topSegments || []).slice(0, 3).map((segment) => (
              <div
                key={segment.id}
                onClick={() => navigate(`/contacts?segment=${segment.id}`)}
                className="flex items-center justify-between p-2 rounded-lg border hover:border-primary/50 hover:bg-muted/50 cursor-pointer"
              >
                <span className="text-sm">{segment.name}</span>
                <Badge variant="secondary">{segment.count.toLocaleString()}</Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
