import React, { useState } from 'react';
import { Mail, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const ADMIN_EMAIL = 'admin@aireatro.com';

interface ContactAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: string;
}

export function ContactAdminDialog({ open, onOpenChange, feature }: ContactAdminDialogProps) {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    await navigator.clipboard.writeText(ADMIN_EMAIL);
    setCopied(true);
    toast.success('Email copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const mailtoHref = `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(
    `Activate Feature: ${feature || 'Workspace Feature'}`,
  )}&body=${encodeURIComponent(
    `Hi Aireatro Admin,\n\nPlease help me with the following:\n\nFeature: ${feature}\n\nThanks.`,
  )}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Contact Aireatro Admin</DialogTitle>
          <DialogDescription className="text-center">
            {feature ? (
              <>
                To proceed with <span className="font-medium text-foreground">{feature}</span>, please contact our admin team.
              </>
            ) : (
              <>This action requires admin assistance. Please contact our team to proceed.</>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between gap-2 p-3 rounded-lg border border-border bg-muted/40">
          <span className="text-sm font-medium text-foreground truncate">{ADMIN_EMAIL}</span>
          <Button variant="ghost" size="sm" onClick={copyEmail} className="h-8">
            {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <a href={mailtoHref}>
              <Mail className="w-4 h-4 mr-2" />
              Email Admin
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
