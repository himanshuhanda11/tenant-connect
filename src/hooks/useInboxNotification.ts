import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

export function useInboxNotification() {
  const { currentTenant } = useTenant();
  const [unreadNewCount, setUnreadNewCount] = useState(0);
  const prevConvIdsRef = useRef<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isInitialLoadRef = useRef(true);

  // Create audio element once
  useEffect(() => {
    // Use a simple bell tone via Web Audio API
    audioRef.current = null; // Will use Web Audio API instead
  }, []);

  const playNotificationSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(830, ctx.currentTime);
      oscillator.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.4);
    } catch (e) {
      // Audio not supported or blocked
    }
  }, []);

  // Listen for new inbound messages via realtime
  useEffect(() => {
    if (!currentTenant?.id) return;

    const channel = supabase
      .channel('inbox-notification-bell')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `tenant_id=eq.${currentTenant.id}`,
        },
        (payload) => {
          const msg = payload.new as any;
          // Only notify for regular inbound messages, NOT form session responses
          const isFormResponse = msg.metadata?.is_form_response === true;
          if (msg.direction === 'inbound' && !isFormResponse) {
            setUnreadNewCount(prev => prev + 1);
            playNotificationSound();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTenant?.id, playNotificationSound]);

  const clearNotifications = useCallback(() => {
    setUnreadNewCount(0);
  }, []);

  return {
    unreadNewCount,
    clearNotifications,
    playNotificationSound,
  };
}
