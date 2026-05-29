import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/authService';

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, admin } = await login(email, password);
      signIn(token, admin);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-tetri-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Brand mark */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-tetri-primary text-white mb-4">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-tetri-text">Admin Portal</h1>
          <p className="text-sm text-tetri-neutral mt-1">Tetri Copilot Platform Administration</p>
        </div>

        <div className="bg-white border border-tetri-border rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-tetri-text mb-1.5">Email address</label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@tetrisuite.com"
                className="w-full px-3.5 py-2.5 text-sm border border-tetri-border rounded-xl bg-white text-tetri-text placeholder:text-tetri-muted focus:outline-none focus:ring-2 focus:ring-tetri-primary/20 focus:border-tetri-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-tetri-text mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-sm border border-tetri-border rounded-xl bg-white text-tetri-text placeholder:text-tetri-muted focus:outline-none focus:ring-2 focus:ring-tetri-primary/20 focus:border-tetri-primary transition-colors"
              />
            </div>

            {error && (
              <div className="text-sm text-tetri-error bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-tetri-primary text-white text-sm font-semibold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-tetri-primary/40 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Signing in…' : 'Sign in to Admin Portal'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-tetri-muted mt-6">
          Tetri Copilot — Platform Admin · Restricted Access
        </p>
      </div>
    </div>
  );
}
