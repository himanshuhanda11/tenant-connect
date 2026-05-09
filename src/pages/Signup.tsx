import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthForm } from '@/components/auth/AuthForm';
import { useAuth } from '@/contexts/AuthContext';

export default function Signup() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      // After signup, ALWAYS route to workspace creation/selection.
      // SelectWorkspace decides whether to send the user to onboarding,
      // their existing workspaces, or the plan selector.
      try { sessionStorage.removeItem('lovable.pending_claim_offer'); } catch {}
      navigate('/select-workspace', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return null;
  }

  return <AuthForm mode="signup" />;
}
