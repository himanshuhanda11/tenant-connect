import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MessageSquare, ArrowRight, ShieldCheck, Zap, Bot, Send } from 'lucide-react';

interface Props {
  onConnect: () => void;
}

export default function ConnectWhatsAppCard({ onConnect }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 text-white shadow-[0_20px_50px_-20px_rgba(16,185,129,0.55)]"
    >
      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-teal-300/20 blur-3xl" />

      <div className="relative p-5 sm:p-7">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-[10px] sm:text-xs font-semibold mb-3">
          Step 2 of 3
        </div>
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-bold leading-tight">Connect your WhatsApp API</h3>
            <p className="text-xs sm:text-sm text-emerald-50/90 mt-1 max-w-xl">
              Authenticate with Meta to start messaging, run campaigns, automate replies, and unlock the team inbox.
            </p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {[
                { icon: Bot, label: 'AI Auto Replies' },
                { icon: Send, label: 'Bulk Messaging' },
                { icon: Zap, label: 'Automation Flows' },
                { icon: ShieldCheck, label: 'Official Meta API' },
              ].map((b) => (
                <span key={b.label} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/15 backdrop-blur text-[10px] sm:text-[11px] font-medium">
                  <b.icon className="w-3 h-3" /> {b.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <Button
            onClick={onConnect}
            className="w-full sm:w-auto h-11 rounded-xl bg-white text-emerald-700 hover:bg-emerald-50 font-semibold shadow-md"
          >
            Connect WhatsApp API <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
          <span className="text-[11px] text-emerald-50/80">Takes &lt; 5 minutes · Powered by Meta Embedded Signup</span>
        </div>
      </div>
    </motion.div>
  );
}
