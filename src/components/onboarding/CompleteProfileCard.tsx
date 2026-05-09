import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, ArrowRight, Image as ImageIcon, FileText, Clock, Globe, Mail, MapPin, CheckCircle2,
} from 'lucide-react';

interface Props {
  onMarkDone: () => void;
  phoneId?: string | null;
}

const TASKS = [
  { icon: ImageIcon, label: 'Profile photo' },
  { icon: FileText, label: 'Business description' },
  { icon: Clock, label: 'Working hours' },
  { icon: Globe, label: 'Website' },
  { icon: Mail, label: 'Email' },
  { icon: MapPin, label: 'Address' },
];

export default function CompleteProfileCard({ onMarkDone }: Props) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-2xl overflow-hidden border border-emerald-200/60 bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/40 shadow-[0_20px_50px_-25px_rgba(16,185,129,0.35)]"
    >
      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-emerald-300/20 blur-3xl" />
      <div className="relative p-5 sm:p-7">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] sm:text-xs font-semibold mb-3">
          Final step · 3 of 3
        </div>
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/30">
            <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">Complete your WhatsApp profile</h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
              Build trust with customers and improve conversions. A complete business profile gets up to 30% more replies.
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
          {TASKS.map((t) => (
            <div key={t.label} className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-white border border-emerald-100">
              <t.icon className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span className="text-[11px] sm:text-xs text-slate-700 truncate">{t.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <Button
            onClick={() => navigate('/settings?section=business')}
            className="w-full sm:w-auto h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/30"
          >
            Complete Profile <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
          <Button
            onClick={onMarkDone}
            variant="ghost"
            className="w-full sm:w-auto h-11 rounded-xl text-slate-600 hover:bg-emerald-50 font-medium"
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5" /> I've already done this
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
