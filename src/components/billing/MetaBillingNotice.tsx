import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MetaBillingNotice() {
  return (
    <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
      <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      <AlertTitle className="text-blue-900 dark:text-blue-100">
        About WhatsApp Messaging Costs
      </AlertTitle>
      <AlertDescription className="text-blue-800 dark:text-blue-200">
        <p className="mb-2">
          SMEKSH subscription is billed by SMEKSH. WhatsApp conversation and message fees are 
          billed separately by Meta based on conversation category (marketing, utility, service, 
          authentication) and destination country.
        </p>
        <Button 
          variant="link" 
          className="h-auto p-0 text-blue-700 dark:text-blue-300"
          onClick={() => window.open('https://developers.facebook.com/docs/whatsapp/pricing', '_blank')}
        >
          Learn more about Meta pricing <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
      </AlertDescription>
    </Alert>
  );
}
