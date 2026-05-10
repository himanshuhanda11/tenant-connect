import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { AlertTriangle, MessageCircle, X, Send, Phone } from 'lucide-react';
import type { Widget, WidgetAgent } from '@/types/widget';
import { cn } from '@/lib/utils';

interface Props {
  widget: Pick<Widget, 'name' | 'whatsapp_number' | 'config'>;
  agents?: WidgetAgent[];
  device?: 'desktop' | 'mobile';
  forceOpen?: boolean;
}

export function WidgetPreview({ widget, agents = [], device = 'desktop', forceOpen }: Props) {
  const cfg = widget.config && typeof widget.config === 'object' ? widget.config : {};
  const [open, setOpen] = useState(true);
  const isOpen = forceOpen ?? open;
  const previewIssues = [
    !widget.whatsapp_number ? 'WhatsApp number is missing' : null,
    cfg.type === 'multi-agent' && agents.length === 0 ? 'Add at least one agent or switch widget type' : null,
    cfg.type === 'minimal-icon' ? 'Minimal icon mode shows only the button on the live site' : null,
  ].filter(Boolean) as string[];
  const showFallbackNotice = previewIssues.length > 0;

  const primary = cfg.primaryColor || '#10B981';
  const accent = cfg.accentColor || '#059669';
  const bg = cfg.darkMode ? '#0b1220' : (cfg.bgColor || '#ffffff');
  const text = cfg.darkMode ? '#e2e8f0' : (cfg.textColor || '#0f172a');
  const radius = `${cfg.radius ?? 20}px`;
  const isLeft = cfg.position === 'bottom-left';

  const animClass = ({
    pulse: 'aw-pulse',
    glow: 'aw-glow',
    bounce: 'animate-bounce',
    float: 'animate-[float_4s_ease-in-out_infinite]',
  } as Record<string, string>)[cfg.animation || 'pulse'] || '';

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl border border-border/40',
        'bg-gradient-to-br from-slate-100 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900',
      )}
      style={{
        width: device === 'mobile' ? 360 : '100%',
        maxWidth: device === 'mobile' ? 360 : '100%',
        height: device === 'mobile' ? 720 : 560,
        margin: '0 auto',
      }}
    >
      {/* mock site background */}
      <div className="absolute inset-0 p-6">
        <div className="h-3 w-32 rounded-full bg-slate-300/50 dark:bg-slate-700/50 mb-4" />
        <div className="h-6 w-2/3 rounded-lg bg-slate-300/40 dark:bg-slate-700/40 mb-2" />
        <div className="h-4 w-1/2 rounded-lg bg-slate-300/30 dark:bg-slate-700/30 mb-6" />
        <div className="grid grid-cols-2 gap-3">
          {[0,1,2,3].map(i => (
            <div key={i} className="h-24 rounded-xl bg-slate-300/30 dark:bg-slate-700/30" />
          ))}
        </div>
      </div>

      {showFallbackNotice && (
        <div className="absolute left-4 right-4 top-4 z-30 rounded-xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground">Preview is using safe fallback data</div>
              <div className="mt-1 text-xs leading-5 text-muted-foreground">
                {previewIssues.join(' • ')}. The widget remains visible here, but publish needs these fields completed.
              </div>
            </div>
          </div>
        </div>
      )}

      {cfg.type === 'sticky-bar' ? (
        <div
          className="absolute left-0 right-0 bottom-0 z-20 flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white shadow-2xl cursor-pointer"
          style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
        >
          <MessageCircle className="h-4 w-4" />
          {cfg.ctaText || 'Chat with us on WhatsApp'}
        </div>
      ) : (
        <>
          {/* Bubble */}
          <button
            onClick={() => setOpen(o => !o)}
            className={cn(
              'absolute z-10 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-2xl transition-transform hover:scale-110',
              animClass,
            )}
            style={{
              background: `linear-gradient(135deg, ${primary}, ${accent})`,
              bottom: 16,
              [isLeft ? 'left' : 'right']: 16,
              boxShadow: `0 10px 30px ${primary}55`,
            }}
            aria-label="Open chat"
          >
            <MessageCircle className="h-6 w-6" />
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.96 }}
                transition={{ duration: 0.22, ease: [0.2, 0.9, 0.3, 1.4] }}
                className="absolute z-20 w-[320px] max-w-[90%] overflow-hidden shadow-2xl"
                style={{
                  bottom: 88,
                  [isLeft ? 'left' : 'right']: 16,
                  background: bg,
                  color: text,
                  borderRadius: radius,
                  boxShadow: '0 24px 60px rgba(2,6,23,0.45)',
                }}
              >
                {/* header */}
                <div
                  className="relative px-4 pt-4 pb-3 text-white"
                  style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
                >
                  <button
                    onClick={() => setOpen(false)}
                    className="absolute right-2 top-2 text-white/80 hover:text-white"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-white/25 overflow-hidden flex items-center justify-center text-white">
                      {cfg.logoUrl ? <img src={cfg.logoUrl} alt="" className="h-full w-full object-cover" /> : <MessageCircle className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{cfg.brandName || widget.name}</div>
                      <div className="text-[11px] opacity-90 flex items-center gap-1.5 mt-0.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-white/30" />
                        {cfg.online === false ? 'Offline' : (cfg.subtitle || 'Typically replies in minutes')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* body */}
                <div className="p-4">
                  <div
                    className="rounded-2xl rounded-tl-sm px-3 py-2.5 text-sm whitespace-pre-line max-w-[90%]"
                    style={{ background: cfg.darkMode ? '#111827' : '#f1f5f9' }}
                  >
                    {cfg.greeting || 'Hi 👋 How can we help?'}
                  </div>
                  {cfg.showTyping && (
                    <div className="mt-2 inline-flex gap-1 px-3 py-2 rounded-2xl rounded-tl-sm" style={{ background: cfg.darkMode ? '#111827' : '#f1f5f9' }}>
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" />
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.15s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.3s]" />
                    </div>
                  )}

                  {cfg.type === 'multi-agent' && agents.length > 0 ? (
                    <div className="mt-3 grid gap-2">
                      {agents.map(a => (
                        <div
                          key={a.id}
                          className="flex items-center gap-2.5 rounded-xl border border-transparent p-2.5 cursor-pointer hover:border-current transition"
                          style={{ background: cfg.darkMode ? '#0f172a' : '#f8fafc' }}
                        >
                          <div className="h-9 w-9 rounded-full bg-slate-300 overflow-hidden">
                            {a.avatar_url && <img src={a.avatar_url} alt="" className="h-full w-full object-cover" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold truncate" style={{ color: text }}>{a.name}</div>
                            <div className="text-[10px] text-slate-500 truncate">{a.role}{a.department ? ` • ${a.department}` : ''}</div>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-500">Chat</span>
                        </div>
                      ))}
                    </div>
                  ) : cfg.collectLead ? (
                    <div className="mt-3 grid gap-2">
                      {cfg.fieldName !== false && <input className="rounded-lg border px-3 py-2 text-sm bg-transparent" placeholder="Your name" style={{ borderColor: cfg.darkMode ? '#1f2937' : '#e2e8f0', color: text }} />}
                      {cfg.fieldPhone !== false && <input className="rounded-lg border px-3 py-2 text-sm bg-transparent" placeholder="Phone (with country code)" style={{ borderColor: cfg.darkMode ? '#1f2937' : '#e2e8f0', color: text }} />}
                      {cfg.fieldEmail && <input className="rounded-lg border px-3 py-2 text-sm bg-transparent" placeholder="Email (optional)" style={{ borderColor: cfg.darkMode ? '#1f2937' : '#e2e8f0', color: text }} />}
                      <textarea rows={2} className="rounded-lg border px-3 py-2 text-sm bg-transparent resize-none" placeholder="How can we help?" style={{ borderColor: cfg.darkMode ? '#1f2937' : '#e2e8f0', color: text }} />
                      <button
                        className="mt-1 flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-white"
                        style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
                      >
                        <Send className="h-4 w-4" /> {cfg.ctaText || 'Start Chat'}
                      </button>
                    </div>
                  ) : (
                    <button
                      className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-white"
                      style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
                    >
                      <Phone className="h-4 w-4" /> {cfg.ctaText || 'Start Chat on WhatsApp'}
                    </button>
                  )}
                </div>

                {!cfg.hideBranding && (
                  <div className="px-3 py-2 text-center text-[10px] text-slate-400 border-t" style={{ borderColor: cfg.darkMode ? '#1f2937' : '#eef2f7' }}>
                    ⚡ Powered by Aireatro
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </>
      )}

      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .aw-pulse::after { content:''; position:absolute; inset:0; border-radius:50%; border:2px solid ${primary}; animation: aw-pulse-anim 2s infinite; pointer-events:none; }
        @keyframes aw-pulse-anim { 0% { transform: scale(1); opacity:.7;} 100% { transform: scale(1.6); opacity:0;} }
        .aw-glow { box-shadow: 0 0 0 0 ${primary}; animation: aw-glow-anim 2.4s infinite; }
        @keyframes aw-glow-anim { 0% { box-shadow: 0 0 0 0 ${primary}66;} 70% { box-shadow: 0 0 0 18px ${primary}00;} 100% { box-shadow: 0 0 0 0 ${primary}00;} }
      `}</style>
    </div>
  );
}
