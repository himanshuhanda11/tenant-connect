import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useWorkspaceBilling } from '@/hooks/useWorkspaceBilling';

export default function BillingReturnPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { data: billing, refetch } = useWorkspaceBilling();
  const [tries, setTries] = useState(0);
  const sessionId = params.get('session_id');

  // Poll until webhook activates the subscription
  useEffect(() => {
    if (!sessionId) { navigate('/onboarding/plan', { replace: true }); return; }
    const id = setInterval(() => { setTries((t) => t + 1); refetch(); }, 1500);
    return () => clearInterval(id);
  }, [sessionId, refetch, navigate]);

  const ready = billing && (billing.status === 'trialing' || billing.status === 'active' || billing.is_trialing);

  useEffect(() => {
    if (ready) {
      const t = setTimeout(() => navigate('/dashboard', { replace: true }), 1200);
      return () => clearTimeout(t);
    }
    if (tries > 20) {
      // Fall through to dashboard regardless after ~30s
      navigate('/dashboard', { replace: true });
    }
  }, [ready, tries, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-8"
      >
        {ready ? (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 text-emerald-300" />
            </div>
            <h1 className="text-2xl font-bold mb-1">You're in! 🎉</h1>
            <p className="text-sm text-white/70">Trial activated — redirecting to your dashboard…</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
              <Loader2 className="w-9 h-9 text-white animate-spin" />
            </div>
            <h1 className="text-2xl font-bold mb-1">Activating your subscription</h1>
            <p className="text-sm text-white/70">Confirming with Stripe… this takes a few seconds.</p>
          </>
        )}
      </motion.div>
    </div>
  );
}
