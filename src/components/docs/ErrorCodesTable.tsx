import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface ErrorCode {
  code: string;
  httpStatus: number;
  title: string;
  description: string;
  resolution: string;
}

interface ErrorCategory {
  category: string;
  description: string;
  errors: ErrorCode[];
}

const errorCategories: ErrorCategory[] = [
  {
    category: 'Authentication Errors',
    description: 'Errors related to API authentication and authorization',
    errors: [
      {
        code: 'AUTH_001',
        httpStatus: 401,
        title: 'Invalid API Key',
        description: 'The provided API key is invalid or has been revoked.',
        resolution: 'Generate a new API key from your dashboard and update your integration.'
      },
      {
        code: 'AUTH_002',
        httpStatus: 401,
        title: 'Expired Token',
        description: 'The authentication token has expired.',
        resolution: 'Refresh your token or generate a new one.'
      },
      {
        code: 'AUTH_003',
        httpStatus: 403,
        title: 'Insufficient Permissions',
        description: 'Your API key lacks permissions for this operation.',
        resolution: 'Contact your admin to update API key permissions.'
      }
    ]
  },
  {
    category: 'Message Errors',
    description: 'Errors when sending or processing messages',
    errors: [
      {
        code: 'MSG_001',
        httpStatus: 400,
        title: 'Invalid Phone Number',
        description: 'The recipient phone number is invalid or not on WhatsApp.',
        resolution: 'Verify the phone number format (+country code) and ensure it\'s registered on WhatsApp.'
      },
      {
        code: 'MSG_002',
        httpStatus: 400,
        title: 'Template Not Found',
        description: 'The specified template does not exist or is not approved.',
        resolution: 'Check template name/ID and ensure it\'s approved by Meta.'
      },
      {
        code: 'MSG_003',
        httpStatus: 400,
        title: 'Session Expired',
        description: 'The 24-hour messaging window has closed.',
        resolution: 'Use an approved template message to re-engage the customer.'
      },
      {
        code: 'MSG_004',
        httpStatus: 400,
        title: 'Media Upload Failed',
        description: 'Failed to upload or process media file.',
        resolution: 'Ensure file type is supported and under 100MB limit.'
      }
    ]
  },
  {
    category: 'Rate Limit Errors',
    description: 'Errors when exceeding API rate limits',
    errors: [
      {
        code: 'RATE_001',
        httpStatus: 429,
        title: 'Rate Limit Exceeded',
        description: 'Too many requests in a short period.',
        resolution: 'Implement exponential backoff. Check Retry-After header.'
      },
      {
        code: 'RATE_002',
        httpStatus: 429,
        title: 'Daily Limit Reached',
        description: 'Daily message quota exceeded for this phone number.',
        resolution: 'Wait for quota reset or upgrade your messaging tier.'
      }
    ]
  },
  {
    category: 'Webhook Errors',
    description: 'Errors related to webhook delivery',
    errors: [
      {
        code: 'HOOK_001',
        httpStatus: 400,
        title: 'Invalid Webhook URL',
        description: 'The webhook URL is invalid or unreachable.',
        resolution: 'Verify URL is publicly accessible and returns 200 OK.'
      },
      {
        code: 'HOOK_002',
        httpStatus: 400,
        title: 'Signature Verification Failed',
        description: 'Webhook signature does not match.',
        resolution: 'Ensure you\'re using the correct webhook secret for verification.'
      }
    ]
  }
];

const statusColors: Record<number, string> = {
  400: 'bg-amber-500/20 text-amber-600',
  401: 'bg-red-500/20 text-red-600',
  403: 'bg-red-500/20 text-red-600',
  404: 'bg-slate-500/20 text-slate-600',
  429: 'bg-orange-500/20 text-orange-600',
  500: 'bg-red-500/20 text-red-600'
};

export function ErrorCodesTable() {
  return (
    <Accordion type="single" collapsible className="space-y-3">
      {errorCategories.map((category) => (
        <AccordionItem 
          key={category.category} 
          value={category.category}
          className="border border-border/50 rounded-xl px-4 data-[state=open]:bg-muted/20"
        >
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex flex-col items-start gap-1">
              <span className="font-semibold text-foreground">{category.category}</span>
              <span className="text-sm text-muted-foreground font-normal">{category.description}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-4">
              {category.errors.map((error) => (
                <div 
                  key={error.code}
                  className="p-4 rounded-lg bg-card border border-border/50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
                        {error.code}
                      </code>
                      <Badge className={`text-xs ${statusColors[error.httpStatus]}`}>
                        {error.httpStatus}
                      </Badge>
                    </div>
                  </div>
                  <h5 className="font-medium text-foreground mb-1">{error.title}</h5>
                  <p className="text-sm text-muted-foreground mb-3">{error.description}</p>
                  <div className="p-3 rounded-md bg-green-500/5 border border-green-500/20">
                    <p className="text-sm">
                      <span className="font-medium text-green-600">Resolution: </span>
                      <span className="text-muted-foreground">{error.resolution}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
