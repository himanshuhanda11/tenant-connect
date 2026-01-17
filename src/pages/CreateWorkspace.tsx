import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Redirect to select-workspace - workspace creation is now handled via modal there
export default function CreateWorkspace() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        navigate('/select-workspace', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }
  }, [user, authLoading, navigate]);

  return null;
}
