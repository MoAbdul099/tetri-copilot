import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClerk } from '@clerk/clerk-react';
import { Building2, ArrowRight, LogOut } from 'lucide-react';
import onboardingService from '../services/onboardingService.js';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { signOut } = useClerk();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Workspace name is required');
      return;
    }
    if (trimmed.length > 255) {
      setError('Workspace name must be 255 characters or less');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onboardingService.bootstrapWorkspace(trimmed);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.details?.[0]?.message ||
        'Failed to create workspace. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-tetri-bg flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="/logo.svg"
            alt="Tetri Copilot"
            className="h-9 w-auto mx-auto mb-6"
            draggable={false}
          />
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#eff4ff] rounded-2xl mb-4">
            <Building2 className="w-7 h-7 text-tetri-blue" />
          </div>
          <h1 className="text-2xl font-bold text-tetri-text">Set up your workspace</h1>
          <p className="text-tetri-muted text-sm mt-1">
            Enter your business name to get started with Tetri Copilot
          </p>
        </div>

        <div className="bg-tetri-surface rounded-card border border-tetri-border p-6">
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label
                htmlFor="workspace-name"
                className="block text-sm font-medium text-tetri-text mb-1.5"
              >
                Workspace / Business Name
              </label>
              <input
                id="workspace-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                placeholder="e.g. Acme Consulting"
                maxLength={255}
                disabled={loading}
                className={`w-full px-3 py-2.5 border rounded-xl text-sm text-tetri-text placeholder:text-tetri-neutral focus:outline-none focus:ring-2 focus:ring-tetri-blue focus:border-transparent disabled:bg-tetri-bg disabled:cursor-not-allowed transition-shadow ${
                  error ? 'border-tetri-error' : 'border-tetri-border'
                }`}
              />
              {error && <p className="mt-1.5 text-xs text-tetri-error">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-tetri-blue text-white text-sm font-semibold rounded-btn hover:bg-tetri-blue-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating workspace…
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-4">
          <button
            onClick={() => signOut({ redirectUrl: '/sign-in' })}
            className="inline-flex items-center gap-1.5 text-xs text-tetri-neutral hover:text-tetri-muted transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
