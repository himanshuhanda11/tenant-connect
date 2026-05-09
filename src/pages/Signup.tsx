import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthForm } from '@/components/auth/AuthForm';
import { useAuth } from '@/contexts/AuthContext';

export default function Signup() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      const pending = (() => {
        try { return sessionStorage.getItem('lovable.pending_claim_offer'); } catch { return null; }
      })();
      if (pending) {
        try { sessionStorage.removeItem('lovable.pending_claim_offer'); } catch {}
        navigate('/select-workspace');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, loading, navigate]);

  if (loading) {
    return null;
  }

  return <AuthForm mode="signup" />;
}
