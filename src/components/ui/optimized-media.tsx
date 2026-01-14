import React, { useState, useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'skeleton';
}

export function OptimizedImage({
  src,
  alt,
  className,
  fallbackClassName,
  priority = false,
  placeholder = 'skeleton',
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(priority);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  if (error) {
    return (
      <div className={cn("bg-muted flex items-center justify-center", fallbackClassName || className)}>
        <span className="text-muted-foreground text-sm">{alt}</span>
      </div>
    );
  }

  return (
    <div ref={imgRef} className="relative">
      {!loaded && placeholder === 'skeleton' && (
        <Skeleton className={cn("absolute inset-0", className)} />
      )}
      {inView && (
        <img
          src={src}
          alt={alt}
          className={cn(className, !loaded && "opacity-0", loaded && "opacity-100 transition-opacity duration-300")}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      )}
    </div>
  );
}

interface OptimizedVideoProps {
  src: string;
  className?: string;
  poster?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
}

export function OptimizedVideo({
  src,
  className,
  poster,
  autoPlay = true,
  muted = true,
  loop = true,
  playsInline = true,
}: OptimizedVideoProps) {
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={videoRef} className="relative">
      {!loaded && (
        <div className={cn("bg-muted animate-pulse rounded-2xl", className)}>
          <Skeleton className="w-full aspect-video" />
        </div>
      )}
      {inView && (
        <video
          src={src}
          poster={poster}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          playsInline={playsInline}
          preload="metadata"
          className={cn(className, !loaded && "hidden")}
          onLoadedData={() => setLoaded(true)}
        />
      )}
    </div>
  );
}
