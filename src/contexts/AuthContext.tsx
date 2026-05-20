import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { signInWithManagedGoogle } from '@/lib/auth/googleOAuth';
import type { Profile } from '@/types/tenant';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  // Keep a ref to the current user id so we can skip unnecessary setUser calls
  // that would create new object references and cascade re-renders through the app.
  const userIdRef = useRef<string | null>(null);



  // Stable setUser: only updates state if the user id actually changed
  const setUser = (newUser: User | null) => {
    const newId = newUser?.id ?? null;
    if (newId === userIdRef.current) return; // same user, skip re-render
    userIdRef.current = newId;
    setUserState(newUser);
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // If Supabase reports the user is gone or token refresh failed,
      // wipe local state so the app redirects to /login.
      if (event === 'USER_DELETED' as any || event === 'TOKEN_REFRESHED' && !session) {
        try { localStorage.removeItem('whatsapp-isv-current-tenant'); } catch {}
        setSession(null);
        setUser(null);
        setProfile(null);
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);

      // Only notify on a GENUINE post-mount sign-in. The first SIGNED_IN event
      // after page load just means the existing session was restored, not that
      // the user actually logged in. Without this guard, customers received a
      // "new login detected" email on every reload, tab focus, or token refresh.
      const isInitialAuthEvent = !hasProcessedInitialAuthRef.current;
      hasProcessedInitialAuthRef.current = true;

      if (
        !isInitialAuthEvent &&
        event === 'SIGNED_IN' &&
        session?.user &&
        !shouldSkipLoginNotification(session.user.email)
      ) {
        const notificationKey = `${session.user.id}:${session.user.last_sign_in_at || ''}`;
        const inMemory = lastLoginNotificationRef.current;
        const persisted = readPersistedLoginNotification();
        const alreadyNotified =
          (inMemory && inMemory.key === notificationKey) ||
          (persisted && persisted.key === notificationKey && Date.now() - persisted.at < LOGIN_NOTIFICATION_TTL_MS);

        if (!alreadyNotified) {
          lastLoginNotificationRef.current = { key: notificationKey, at: Date.now() };
          writePersistedLoginNotification(notificationKey);
          setTimeout(() => {
            sendLoginNotifications(session.user).catch((err) => {
              console.warn('[Auth] Login notification email failed:', err);
            });
          }, 0);
        }
      }

      // Defer profile fetch and onboarding step update
      if (session?.user) {
        setTimeout(() => {
          fetchProfileAndUpdateOnboarding(session.user.id, event);
        }, 0);
      } else {
        setProfile(null);
      }
    });

    const init = async () => {
      try {
        // If we returned from an OAuth PKCE flow, exchange the auth code for a session first.
        // This prevents a race where getSession() runs before the exchange completes,
        // causing route guards to redirect to /login.
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error) {
            url.searchParams.delete('code');
            url.searchParams.delete('state');
            window.history.replaceState({}, document.title, url.pathname + url.search + url.hash);
          }
        }

        // THEN check for existing session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        // Validate the session against the server. If the user has been
        // deleted by an admin, the local JWT is still present but invalid
        // — force a clean sign-out so the UI redirects to /login.
        if (session?.user) {
          const { data: serverUser, error: getUserError } = await supabase.auth.getUser();
          if (getUserError || !serverUser?.user) {
            console.warn('[Auth] Stored session invalid (user deleted?). Signing out.');
            try { localStorage.removeItem('whatsapp-isv-current-tenant'); } catch {}
            await supabase.auth.signOut().catch(() => {});
            setSession(null);
            setUser(null);
            setProfile(null);
            return;
          }
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          fetchProfile(session.user.id);
        }
      } finally {
        setLoading(false);
      }
    };

    init();

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfileAndUpdateOnboarding = async (userId: string, event: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (!error && data) {
      // Both email/password AND Google signups go through the org details stepper.
      // The stepper will pre-fill name from Google metadata when available.
      setProfile(data as Profile);
    }
  };

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (!error && data) {
      setProfile(data as Profile);
    }
  };

  const sendLoginNotifications = async (signedInUser: User) => {
    const userEmail = signedInUser.email;
    if (shouldSkipLoginNotification(userEmail)) return;

    const fullName =
      signedInUser.user_metadata?.full_name ||
      signedInUser.user_metadata?.name ||
      userEmail!.split('@')[0];

    const templateData = {
      userId: signedInUser.id,
      email: userEmail,
      fullName,
      recipientName: fullName,
      loginTime: new Date().toUTCString(),
      method: signedInUser.app_metadata?.provider === 'google' ? 'Google' : 'Email/password',
      device: getLoginDeviceLabel(),
    };

    const eventId = `${signedInUser.id}-${signedInUser.last_sign_in_at || Date.now()}`;
    const results = await Promise.allSettled([
      supabase.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'login-notification-customer',
          recipientEmail: userEmail,
          idempotencyKey: `login-customer-${eventId}`,
          templateData,
        },
      }),
      supabase.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'login-notification-admin',
          recipientEmail: 'admin@aireatro.com',
          idempotencyKey: `login-admin-${eventId}`,
          templateData,
        },
      }),
    ]);

    results.forEach((result) => {
      if (result.status === 'rejected') {
        console.warn('[Auth] Login notification email failed:', result.reason);
      } else if (result.value.error) {
        console.warn('[Auth] Login notification email failed:', result.value.error);
      }
    });
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName
        }
      }
    });
    
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { error: error as Error | null };
  };

  const signInWithGoogle = async () => {
    const { error } = await signInWithManagedGoogle({
      nextPath: '/select-workspace',
      extraParams: {
        prompt: 'select_account',
      },
    });

    return { error: error ?? null };
  };

  const signOut = async () => {
    // Clear any persisted workspace selection to avoid redirect loops after logout.
    try {
      localStorage.removeItem('whatsapp-isv-current-tenant');
    } catch {
      // ignore
    }

    try {
      await supabase.auth.signOut();
    } catch (err) {
      // Don't block UI navigation on sign-out errors.
      console.error('Sign out error:', err);
    } finally {
      setProfile(null);
      setSession(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
