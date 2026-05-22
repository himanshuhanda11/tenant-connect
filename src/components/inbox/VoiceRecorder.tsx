import { useEffect, useRef, useState } from 'react';
import { Mic, Square, Trash2, Send, Play, Pause, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface VoiceRecorderProps {
  onCancel: () => void;
  onSend: (file: File) => Promise<void> | void;
  isOutbound?: boolean;
}

// Pick the best supported audio container for WhatsApp Cloud API.
// WhatsApp accepts: audio/aac, audio/mp4, audio/mpeg, audio/amr, audio/ogg (opus).
// Order matters — prefer formats Meta accepts directly.
function pickMime(): { mimeType?: string; ext: string } {
  if (typeof MediaRecorder === 'undefined') return { ext: 'webm' };
  const candidates: Array<{ m: string; ext: string }> = [
    { m: 'audio/ogg;codecs=opus', ext: 'ogg' },
    { m: 'audio/mp4;codecs=mp4a.40.2', ext: 'm4a' },
    { m: 'audio/mp4', ext: 'm4a' },
    { m: 'audio/webm;codecs=opus', ext: 'webm' },
    { m: 'audio/webm', ext: 'webm' },
  ];
  for (const c of candidates) {
    try { if ((MediaRecorder as any).isTypeSupported?.(c.m)) return { mimeType: c.m, ext: c.ext }; } catch {}
  }
  return { ext: 'webm' };
}

function fmt(s: number) {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export function VoiceRecorder({ onCancel, onSend }: VoiceRecorderProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const startedAtRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);
  const liveBarsRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const [phase, setPhase] = useState<'recording' | 'review'>('recording');
  const [elapsed, setElapsed] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [recordedFile, setRecordedFile] = useState<File | null>(null);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [sending, setSending] = useState(false);

  // Auto-start recording on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;

        // Live mic-level visualization
        try {
          const Ctx: typeof AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
          const ctx = new Ctx();
          audioCtxRef.current = ctx;
          const src = ctx.createMediaStreamSource(stream);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64;
          src.connect(analyser);
          analyserRef.current = analyser;
          const data = new Uint8Array(analyser.frequencyBinCount);
          const tick = () => {
            if (!analyserRef.current || !liveBarsRef.current) {
              animFrameRef.current = requestAnimationFrame(tick);
              return;
            }
            analyserRef.current.getByteFrequencyData(data);
            const bars = liveBarsRef.current.children;
            for (let i = 0; i < bars.length; i++) {
              const v = data[i % data.length] / 255;
              (bars[i] as HTMLElement).style.height = `${Math.max(12, Math.round(v * 100))}%`;
            }
            animFrameRef.current = requestAnimationFrame(tick);
          };
          animFrameRef.current = requestAnimationFrame(tick);
        } catch { /* visualization is optional */ }

        const { mimeType, ext } = pickMime();
        const rec = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
        mediaRecorderRef.current = rec;
        chunksRef.current = [];
        rec.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data); };
        rec.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: rec.mimeType || mimeType || 'audio/webm' });
          const file = new File([blob], `voice-${Date.now()}.${ext}`, { type: blob.type });
          setRecordedFile(file);
          setPreviewUrl(URL.createObjectURL(blob));
          setPhase('review');
        };
        rec.start(250);
        startedAtRef.current = Date.now();
        timerRef.current = window.setInterval(() => {
          const e = (Date.now() - startedAtRef.current) / 1000;
          setElapsed(e);
          // Hard-cap at 5 minutes (WhatsApp limit ~16MB)
          if (e >= 300) stopRecording();
        }, 200);
      } catch (err: any) {
        const msg = err?.name === 'NotAllowedError'
          ? 'Microphone access denied. Please allow mic access in your browser.'
          : 'Could not start recording — microphone unavailable.';
        toast.error(msg);
        onCancel();
      }
    })();

    return () => {
      cancelled = true;
      cleanup();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cleanup = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
    try { mediaRecorderRef.current?.state === 'recording' && mediaRecorderRef.current.stop(); } catch {}
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    try { audioCtxRef.current?.close(); } catch {}
    audioCtxRef.current = null;
    analyserRef.current = null;
  };

  const stopRecording = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    try { mediaRecorderRef.current?.stop(); } catch {}
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
    try { audioCtxRef.current?.close(); } catch {}
  };

  const cancel = () => {
    cleanup();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    onCancel();
  };

  const togglePreview = () => {
    const a = audioElRef.current;
    if (!a) return;
    if (previewPlaying) a.pause(); else a.play().catch(() => {});
  };

  const handleSend = async () => {
    if (!recordedFile || sending) return;
    setSending(true);
    try {
      await onSend(recordedFile);
      cancel();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send voice message');
      setSending(false);
    }
  };

  return (
    <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-card border border-border/60 shadow-sm">
      {/* Cancel */}
      <button
        onClick={cancel}
        className="h-9 w-9 rounded-full flex items-center justify-center text-destructive hover:bg-destructive/10 active:scale-95 transition-all shrink-0"
        aria-label="Cancel voice message"
        disabled={sending}
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {phase === 'recording' ? (
        <>
          {/* Pulsing record dot */}
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive" />
          </span>

          {/* Live waveform */}
          <div
            ref={liveBarsRef}
            className="flex-1 flex items-end justify-center gap-[2px] h-7 overflow-hidden"
          >
            {Array.from({ length: 28 }).map((_, i) => (
              <span key={i} className="flex-1 rounded-full bg-primary/70 transition-[height] duration-100" style={{ height: '14%' }} />
            ))}
          </div>

          <span className="text-xs font-medium tabular-nums text-foreground/80 shrink-0">{fmt(elapsed)}</span>

          {/* Stop → go to review */}
          <button
            onClick={stopRecording}
            className="h-9 w-9 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all shrink-0"
            aria-label="Stop recording"
          >
            <Square className="h-3.5 w-3.5 fill-current" />
          </button>
        </>
      ) : (
        <>
          {/* Preview play */}
          <button
            onClick={togglePreview}
            className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all shrink-0"
            aria-label={previewPlaying ? 'Pause preview' : 'Play preview'}
          >
            {previewPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
          </button>

          {/* Static bars preview */}
          <div className="flex-1 flex items-end justify-center gap-[2px] h-7">
            {Array.from({ length: 28 }).map((_, i) => (
              <span
                key={i}
                className="flex-1 rounded-full bg-primary/60"
                style={{ height: `${30 + ((i * 37) % 70)}%` }}
              />
            ))}
          </div>

          <span className="text-xs font-medium tabular-nums text-foreground/80 shrink-0">{fmt(elapsed)}</span>

          <audio
            ref={audioElRef}
            src={previewUrl || undefined}
            onPlay={() => setPreviewPlaying(true)}
            onPause={() => setPreviewPlaying(false)}
            onEnded={() => setPreviewPlaying(false)}
          />

          {/* Send */}
          <button
            onClick={handleSend}
            disabled={sending}
            className={cn(
              'h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md transition-all shrink-0',
              sending ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
            )}
            aria-label="Send voice message"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </>
      )}
    </div>
  );
}
