import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { CheckCircle2, XCircle, Loader2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import invitationsService from '../../members/services/invitationsService.js';

export default function AcceptInvitationPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useAuth();

  const [state, setState] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isLoaded) return;
    if (!token) {
      setState('error');
      setErrorMsg('Invalid invitation link. No token found.');
      return;
    }
    if (!isSignedIn) {
      // Save token in sessionStorage so we can resume after sign-in
      sessionStorage.setItem('pendingInviteToken', token);
      navigate(`/sign-in?redirect=/invite?token=${encodeURIComponent(token)}`);
    }
  }, [isLoaded, isSignedIn, token]);

  const handleAccept = async () => {
    setState('loading');
    try {
      await invitationsService.acceptInvitation(token);
      setState('success');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setState('error');
      setErrorMsg(err?.response?.data?.error || 'Failed to accept invitation. The link may have expired.');
    }
  };

  if (!isLoaded || (!isSignedIn && token)) {
    return (
      <div className="min-h-screen bg-tetri-bg flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-tetri-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tetri-bg flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="/logo.svg"
            alt="Tetri Copilot"
            className="max-w-[180px] w-full h-auto mx-auto mb-6 object-contain"
            draggable={false}
          />
        </div>

        <div className="bg-white rounded-card border border-tetri-border p-8 text-center">
          {state === 'success' ? (
            <>
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <h1 className="text-lg font-bold text-tetri-text mb-1">You're in!</h1>
              <p className="text-sm text-tetri-muted">Workspace joined. Redirecting to dashboard…</p>
            </>
          ) : state === 'error' ? (
            <>
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-7 h-7 text-tetri-error" />
              </div>
              <h1 className="text-lg font-bold text-tetri-text mb-1">Invitation error</h1>
              <p className="text-sm text-tetri-muted mb-5">{errorMsg}</p>
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Go to dashboard
              </Button>
            </>
          ) : (
            <>
              <div className="w-14 h-14 bg-[#eff4ff] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-tetri-blue" />
              </div>
              <h1 className="text-lg font-bold text-tetri-text mb-1">Accept workspace invitation</h1>
              <p className="text-sm text-tetri-muted mb-6">
                You've been invited to join a Tetri Copilot workspace.
              </p>
              <Button className="w-full" onClick={handleAccept} disabled={state === 'loading'}>
                {state === 'loading' ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Joining…</>
                ) : (
                  'Accept invitation'
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
