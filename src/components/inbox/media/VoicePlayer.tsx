import { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, Loader2, AlertCircle, Download, Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMediaUrl } from '@/hooks/useMediaUrl';
import { Button } from '@/components/ui/button';

interface VoicePlayerProps {
  messageId?: string;
  url: string;
  isOutbound: boolean;
  mediaBucket?: string;
  mediaPath?: string;
  fileName?: string;
}

const SPEEDS = [1, 1.5, 2] as const;
const BAR_COUNT = 28;

function formatTime(s: number) {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

// Deterministic pseudo-waveform from url (no decoding cost)
function useFakeWaveform(seed: string) {
  return useMemo(() => {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
    const bars: number[] = [];
    for (let i = 0; i < BAR_COUNT; i++) {
      h = (h * 1103515245 + 12345) & 0x7fffffff;
      const v = (h % 100) / 100; // 0..1
      bars.push(0.25 + v * 0.75); // 0.25..1
    }
    return bars;
  }, [seed]);
}

export function VoicePlayer({ messageId, url, isOutbound, mediaBucket, mediaPath, fileName }: VoicePlayerProps) {
  const { url: mediaUrl, refresh, loading: refreshing, hasRefreshSource } = useMediaUrl(url, mediaBucket, mediaPath, messageId);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hydrateAttemptedRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [speedIdx, setSpeedIdx] = useState(0);
  const [errored, setErrored] = useState(false);
  const [loading, setLoading] = useState(false);

  const bars = useFakeWaveform(mediaPath || url || 'voice');
  const isValid = mediaUrl?.startsWith('http') || mediaUrl?.startsWith('blob:');
  const progress = duration > 0 ? current / duration : 0;

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.playbackRate = SPEEDS[speedIdx];
  }, [speedIdx]);

  useEffect(() => {
    if (isValid || !hasRefreshSource || hydrateAttemptedRef.current) return;
    hydrateAttemptedRef.current = true;
    void refresh().then((u) => { if (!u) setErrored(true); });
  }, [hasRefreshSource, isValid, refresh]);

  const togglePlay = async () => {
    const a = audioRef.current;
    if (!a) return;
    try {
      if (playing) {
        a.pause();
      } else {
        setLoading(true);
        await a.play();
      }
    } catch {
      setErrored(true);
    } finally {
      setLoading(false);
    }
  };

  const onSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current;
    if (!a || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    a.currentTime = ratio * duration;
    setCurrent(a.currentTime);
  };

  const handleError = async () => {
    if (hasRefreshSource) {
      const u = await refresh();
      if (!u) setErrored(true);
    } else {
      setErrored(true);
    }
  };

  if (!isValid && hasRefreshSource && refreshing && !errored) {
    return (
      <div className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-2xl min-w-[240px]',
        isOutbound ? 'bg-primary-foreground/10' : 'bg-muted/40 border border-border/40'
      )}>
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm flex-1">Loading voice message…</span>
      </div>
    );
  }

  if (!isValid || errored) {
    return (
      <div className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-2xl min-w-[240px]',
        isOutbound ? 'bg-primary-foreground/10' : 'bg-muted/40 border border-border/40'
      )}>
        <AlertCircle className="h-4 w-4 text-destructive" />
        <span className="text-sm flex-1">Voice message unavailable</span>
        {hasRefreshSource && (
          <Button
            size="sm" variant="ghost" className="h-7 px-2 text-xs"
            onClick={async () => { setErrored(false); const u = await refresh(); if (!u) setErrored(true); }}
          >
            {refreshing ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Retry'}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      'flex items-center gap-3 px-3 py-2.5 rounded-2xl min-w-[240px] max-w-[340px]',
      isOutbound
        ? 'bg-primary-foreground/15'
        : 'bg-background/70 border border-border/40 shadow-sm'
    )}>
      {/* Play / Pause */}
      <button
        onClick={togglePlay}
        className={cn(
          'h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-95',
          isOutbound
            ? 'bg-primary-foreground/25 hover:bg-primary-foreground/35 text-primary-foreground'
            : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20'
        )}
        aria-label={playing ? 'Pause voice message' : 'Play voice message'}
      >
        {loading
          ? <Loader2 className="h-4 w-4 animate-spin" />
          : playing
            ? <Pause className="h-5 w-5" />
            : <Play className="h-5 w-5 ml-0.5" />}
      </button>

      {/* Waveform + meta */}
      <div className="flex-1 min-w-0">
        <div
          className="flex items-end gap-[2px] h-7 cursor-pointer select-none"
          onClick={onSeek}
        >
          {bars.map((h, i) => {
            const filled = i / BAR_COUNT < progress;
            return (
              <span
                key={i}
                className={cn(
                  'flex-1 rounded-full transition-colors',
                  filled
                    ? isOutbound ? 'bg-primary-foreground' : 'bg-primary'
                    : isOutbound ? 'bg-primary-foreground/35' : 'bg-foreground/25',
                )}
                style={{ height: `${Math.round(h * 100)}%` }}
              />
            );
          })}
        </div>
        <div className={cn(
          'mt-1 flex items-center justify-between text-[10.5px] font-medium tabular-nums',
          isOutbound ? 'text-primary-foreground/80' : 'text-muted-foreground'
        )}>
          <span>{formatTime(playing || current > 0 ? current : duration)}</span>
          <button
            onClick={() => setSpeedIdx((s) => (s + 1) % SPEEDS.length)}
            className={cn(
              'flex items-center gap-1 px-1.5 py-0.5 rounded-md transition-colors',
              isOutbound ? 'hover:bg-primary-foreground/15' : 'hover:bg-muted'
            )}
            title="Playback speed"
          >
            <Gauge className="h-3 w-3" />
            {SPEEDS[speedIdx]}x
          </button>
        </div>
      </div>

      {/* Hidden audio engine */}
      <audio
        ref={audioRef}
        src={mediaUrl}
        preload="metadata"
        onLoadedMetadata={(e) => {
          const d = (e.currentTarget.duration);
          if (isFinite(d)) setDuration(d);
        }}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setCurrent(0); }}
        onError={handleError}
      />
    </div>
  );
}
