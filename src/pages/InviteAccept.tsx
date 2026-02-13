import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle2, XCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const InviteAccept = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'expired' | 'already_accepted'>('loading');
  const [invite, setInvite] = useState<any>(null);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setStatus('invalid');
        return;
      }

      const { data, error } = await supabase
        .from('member_invites')
        .select('*, role:roles(name, color)')
        .eq('token', token)
        .maybeSingle();

      if (error || !data) {
        setStatus('invalid');
        return;
      }

      if (data.accepted_at) {
        setStatus('already_accepted');
        setInvite(data);
        return;
      }

      if (new Date(data.expires_at) < new Date()) {
        setStatus('expired');
        setInvite(data);
        return;
      }

      setInvite(data);
      setStatus('valid');
    };

    validateToken();
  }, [token]);

  const handleAccept = () => {
    // Redirect to signup with the invite token pre-filled
    navigate(`/signup?invite=${token}&email=${encodeURIComponent(invite?.email || '')}`);
  };

  const handleLogin = () => {
    navigate(`/login?redirect=${encodeURIComponent(`/invite/accept?token=${token}`)}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardContent className="p-8 text-center space-y-6">
          {status === 'loading' && (
            <>
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Validating your invitation...</p>
            </>
          )}

          {status === 'valid' && invite && (
            <>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">You're Invited!</h1>
                <p className="text-muted-foreground mt-2">
                  You've been invited to join the team
                  {invite.role?.name && (
                    <> as <span className="font-semibold" style={{ color: invite.role.color }}>{invite.role.name}</span></>
                  )}
                </p>
              </div>
              <div className="space-y-3">
                <Button onClick={handleAccept} className="w-full" size="lg">
                  Create Account & Join
                </Button>
                <Button onClick={handleLogin} variant="outline" className="w-full" size="lg">
                  Already have an account? Sign in
                </Button>
              </div>
            </>
          )}

          {status === 'invalid' && (
            <>
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Invalid Invitation</h1>
                <p className="text-muted-foreground mt-2">
                  This invitation link is invalid or has been revoked. Please ask your administrator to send a new invitation.
                </p>
              </div>
              <Button onClick={() => navigate('/login')} variant="outline" className="w-full">
                Go to Login
              </Button>
            </>
          )}

          {status === 'expired' && (
            <>
              <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto">
                <XCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Invitation Expired</h1>
                <p className="text-muted-foreground mt-2">
                  This invitation has expired. Please ask your administrator to resend the invitation.
                </p>
              </div>
              <Button onClick={() => navigate('/login')} variant="outline" className="w-full">
                Go to Login
              </Button>
            </>
          )}

          {status === 'already_accepted' && (
            <>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Already Accepted</h1>
                <p className="text-muted-foreground mt-2">
                  This invitation has already been accepted. You can sign in to your account.
                </p>
              </div>
              <Button onClick={() => navigate('/login')} className="w-full">
                Sign In
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteAccept;
