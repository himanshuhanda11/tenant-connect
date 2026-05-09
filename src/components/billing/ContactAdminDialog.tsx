import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mail, MessageCircle, Send, Lock, Sparkles } from 'lucide-react';

interface ContactAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinueFree?: () => void;
  reason?: 'trial_already_used' | 'manual' | string;
}

const SUPPORT_EMAIL = 'support@aireatro.com';
const SUPPORT_WHATSAPP = 'https://wa.me/919999999999';
const SUPPORT_TELEGRAM = 'https://t.me/aireatro';

export default function ContactAdminDialog({ open, onOpenChange, onContinueFree, reason }: ContactAdminDialogProps) {
  const isTrialUsed = reason === 'trial_already_used';
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto my-8 sm:my-12 mx-4 sm:mx-auto w-[calc(100%-2rem)] sm:w-full rounded-2xl p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-rose-500/10 px-6 pt-6 pb-4 border-b border-amber-200/50">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-3 shadow-lg shadow-amber-500/30">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <DialogHeader className="text-left space-y-2">
            <DialogTitle className="text-xl sm:text-2xl font-bold leading-tight">
              🚀 Paid Plans Temporarily Manual
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
              {isTrialUsed ? (
                <>You already used your <span className="font-semibold text-foreground">1-month free trial</span> on another workspace.</>
              ) : (
                <>Online payment gateway is currently under setup.</>
              )}
              <br />
              To activate a paid plan for this workspace, please contact admin.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-2.5">
          <a href={`mailto:${SUPPORT_EMAIL}?subject=Activate%20paid%20plan`}
             className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-emerald-400 hover:bg-emerald-50/50 transition-all group">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Mail className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">Email support</div>
              <div className="text-xs text-muted-foreground truncate">{SUPPORT_EMAIL}</div>
            </div>
          </a>

          <a href={SUPPORT_WHATSAPP} target="_blank" rel="noopener noreferrer"
             className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-green-400 hover:bg-green-50/50 transition-all group">
            <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center group-hover:scale-105 transition-transform">
              <MessageCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">Chat on WhatsApp</div>
              <div className="text-xs text-muted-foreground">Fastest response · usually under 1 hr</div>
            </div>
          </a>

          <a href={SUPPORT_TELEGRAM} target="_blank" rel="noopener noreferrer"
             className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-sky-400 hover:bg-sky-50/50 transition-all group">
            <div className="w-9 h-9 rounded-lg bg-sky-100 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Send className="w-4 h-4 text-sky-600" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">Telegram</div>
              <div className="text-xs text-muted-foreground">@aireatro</div>
            </div>
          </a>
        </div>

        <DialogFooter className="px-6 pb-6 pt-2 flex-col sm:flex-col gap-2">
          <Button asChild className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-md shadow-amber-500/20">
            <a href={`mailto:${SUPPORT_EMAIL}?subject=Activate%20paid%20plan`}>
              <Mail className="w-4 h-4 mr-2" /> Contact Admin
            </a>
          </Button>
          {onContinueFree && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => { onOpenChange(false); onContinueFree(); }}
            >
              <Sparkles className="w-4 h-4 mr-2" /> Continue with Free Lifetime
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
