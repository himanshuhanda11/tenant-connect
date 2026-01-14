import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  ExternalLink, 
  CheckCircle2, 
  Circle,
  Settings,
  Shield,
  Globe,
  Key,
  Link2,
  X
} from 'lucide-react';

interface MetaAppStatusChecklistProps {
  errorCode?: string;
  errorMessage?: string;
  onDismiss?: () => void;
}

const META_ERROR_CODES: Record<string, { title: string; description: string }> = {
  '1349205': {
    title: 'Facebook Login Unavailable',
    description: 'The Facebook Login product is not properly configured for this Meta App.',
  },
  '1349003': {
    title: 'Feature Unavailable',
    description: 'This feature requires additional permissions or the app is in Development mode.',
  },
  '1349220': {
    title: 'Access Denied',
    description: 'The user does not have permission to use this app, or the app is restricted.',
  },
  '100': {
    title: 'Invalid Scopes',
    description: 'One or more requested permissions are invalid or not available for this app.',
  },
};

const CHECKLIST_ITEMS = [
  {
    id: 'facebook-login',
    label: 'Facebook Login product added',
    description: 'Go to Meta App Dashboard → Add Products → Facebook Login',
    critical: true,
  },
  {
    id: 'client-oauth',
    label: 'Client OAuth Login enabled',
    description: 'Facebook Login → Settings → Client OAuth Login = ON',
    critical: true,
  },
  {
    id: 'web-oauth',
    label: 'Web OAuth Login enabled',
    description: 'Facebook Login → Settings → Web OAuth Login = ON',
    critical: true,
  },
  {
    id: 'redirect-uri',
    label: 'Valid OAuth Redirect URI configured',
    description: 'Add: https://fygwjpdasnhaomoqdvcu.supabase.co/functions/v1/waba-connect-callback',
    critical: true,
  },
  {
    id: 'app-domains',
    label: 'App Domains configured',
    description: 'Settings → Basic → App Domains includes your domain',
    critical: false,
  },
  {
    id: 'live-mode',
    label: 'App in Live mode (for external users)',
    description: 'Development mode only allows app developers/testers',
    critical: false,
  },
  {
    id: 'business-verification',
    label: 'Business Verification completed',
    description: 'Required for WhatsApp Business API access with external users',
    critical: false,
  },
];

export function MetaAppStatusChecklist({ errorCode, errorMessage, onDismiss }: MetaAppStatusChecklistProps) {
  const errorInfo = errorCode ? META_ERROR_CODES[errorCode] : null;

  return (
    <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <div>
              <CardTitle className="text-base text-amber-900 dark:text-amber-100">
                Meta App Configuration Required
              </CardTitle>
              <CardDescription className="text-amber-700 dark:text-amber-300">
                The WhatsApp connection flow was blocked by Meta
              </CardDescription>
            </div>
          </div>
          {onDismiss && (
            <Button variant="ghost" size="icon" onClick={onDismiss} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Error Details */}
        {(errorCode || errorMessage) && (
          <Alert variant="destructive" className="bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="text-sm">
              {errorInfo?.title || 'Meta OAuth Error'}
              {errorCode && (
                <Badge variant="outline" className="ml-2 text-xs">
                  Code: {errorCode}
                </Badge>
              )}
            </AlertTitle>
            <AlertDescription className="text-xs mt-1">
              {errorInfo?.description || errorMessage || 'An error occurred during the Meta OAuth flow.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Checklist */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-amber-900 dark:text-amber-100">
            Configuration Checklist
          </h4>
          <div className="space-y-1.5">
            {CHECKLIST_ITEMS.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-2 p-2 rounded-md bg-white/60 dark:bg-white/5 border border-amber-100 dark:border-amber-800/50"
              >
                <Circle className="h-4 w-4 mt-0.5 text-amber-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {item.label}
                    </span>
                    {item.critical && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                        Required
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => window.open('https://developers.facebook.com/apps/', '_blank')}
          >
            <Settings className="h-3.5 w-3.5" />
            Meta App Dashboard
            <ExternalLink className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => window.open('https://developers.facebook.com/docs/facebook-login/guides/access-tokens/', '_blank')}
          >
            <Key className="h-3.5 w-3.5" />
            OAuth Docs
            <ExternalLink className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => window.open('https://developers.facebook.com/docs/whatsapp/embedded-signup/', '_blank')}
          >
            <Link2 className="h-3.5 w-3.5" />
            Embedded Signup Docs
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>

        {/* Tip */}
        <div className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2">
          <strong>Tip:</strong> If you're testing in Development mode, make sure the user completing 
          the flow is added as a developer or tester in the Meta App settings. For external users, 
          the app must be in Live mode with Business Verification completed.
        </div>
      </CardContent>
    </Card>
  );
}
