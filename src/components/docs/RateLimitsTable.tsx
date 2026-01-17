import { AlertCircle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface RateLimit {
  endpoint: string;
  method: string;
  limit: string;
  window: string;
  burstLimit?: string;
  notes?: string;
}

const rateLimits: RateLimit[] = [
  {
    endpoint: '/v1/messages',
    method: 'POST',
    limit: '80 req/s',
    window: 'Per second',
    burstLimit: '100 req/s',
    notes: 'Per phone number'
  },
  {
    endpoint: '/v1/messages/template',
    method: 'POST',
    limit: '80 req/s',
    window: 'Per second',
    burstLimit: '100 req/s',
    notes: 'Per phone number'
  },
  {
    endpoint: '/v1/contacts',
    method: 'GET',
    limit: '100 req/m',
    window: 'Per minute',
    notes: 'Pagination recommended'
  },
  {
    endpoint: '/v1/contacts',
    method: 'POST',
    limit: '50 req/m',
    window: 'Per minute',
  },
  {
    endpoint: '/v1/templates',
    method: 'GET',
    limit: '100 req/m',
    window: 'Per minute',
  },
  {
    endpoint: '/v1/templates',
    method: 'POST',
    limit: '10 req/m',
    window: 'Per minute',
    notes: 'Subject to Meta review'
  },
  {
    endpoint: '/v1/media',
    method: 'POST',
    limit: '30 req/m',
    window: 'Per minute',
    notes: 'Max 100MB per file'
  },
  {
    endpoint: '/v1/webhooks',
    method: 'GET/POST',
    limit: '60 req/m',
    window: 'Per minute',
  }
];

const methodColors: Record<string, string> = {
  GET: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
  POST: 'bg-green-500/20 text-green-600 border-green-500/30',
  PUT: 'bg-amber-500/20 text-amber-600 border-amber-500/30',
  DELETE: 'bg-red-500/20 text-red-600 border-red-500/30',
  'GET/POST': 'bg-purple-500/20 text-purple-600 border-purple-500/30'
};

export function RateLimitsTable() {
  return (
    <div className="space-y-4">
      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
        <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-medium text-foreground mb-1">Rate Limit Headers</p>
          <p className="text-muted-foreground">
            All API responses include <code className="bg-muted px-1 py-0.5 rounded text-xs">X-RateLimit-Limit</code>, 
            <code className="bg-muted px-1 py-0.5 rounded text-xs ml-1">X-RateLimit-Remaining</code>, and 
            <code className="bg-muted px-1 py-0.5 rounded text-xs ml-1">X-RateLimit-Reset</code> headers.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="font-semibold">Endpoint</TableHead>
              <TableHead className="font-semibold">Method</TableHead>
              <TableHead className="font-semibold">Rate Limit</TableHead>
              <TableHead className="font-semibold">Window</TableHead>
              <TableHead className="font-semibold">Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rateLimits.map((limit, index) => (
              <TableRow key={index}>
                <TableCell className="font-mono text-sm">{limit.endpoint}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-xs border ${methodColors[limit.method]}`}>
                    {limit.method}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{limit.limit}</span>
                    {limit.burstLimit && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-3.5 h-3.5 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Burst limit: {limit.burstLimit}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{limit.window}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{limit.notes || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 429 Response */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
        <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-medium text-foreground mb-1">Rate Limit Exceeded (429)</p>
          <p className="text-muted-foreground">
            When rate limited, the API returns a 429 status code with a <code className="bg-muted px-1 py-0.5 rounded text-xs">Retry-After</code> header 
            indicating when you can retry. Implement exponential backoff for best results.
          </p>
        </div>
      </div>
    </div>
  );
}
