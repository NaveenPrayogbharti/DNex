import { useState } from 'react';
import { useNavigate } from 'react-router';
import { signInAdmin } from '../services/authService';
import { Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';

const NAVY = '#0A1628';
const GOLD = '#C9963C';

export function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await signInAdmin(email, password);
      navigate('/admin/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login" style={{ background: `linear-gradient(145deg, ${NAVY} 0%, #132038 50%, #1a2d4a 100%)` }}>
      {/* Decorative background elements */}
      <div className="admin-login__bg-orb admin-login__bg-orb--1" style={{ background: `radial-gradient(circle, ${GOLD}15, transparent 70%)` }} />
      <div className="admin-login__bg-orb admin-login__bg-orb--2" style={{ background: `radial-gradient(circle, #2563eb10, transparent 70%)` }} />

      <div className="admin-login__container">
        {/* Logo */}
        <div className="admin-login__logo">
          <div
            className="admin-login__logo-icon"
            style={{ background: `linear-gradient(135deg, ${GOLD}, #E8B85E)` }}
          >
            <span style={{ color: NAVY, fontWeight: 800, fontSize: '22px' }}>DN</span>
          </div>
          <h1 className="admin-login__brand">
            DNex <span style={{ color: GOLD }}>Admin</span>
          </h1>
        </div>

        {/* Card */}
        <div className="admin-login__card">
          <div className="admin-login__card-header">
            <h2>Welcome back</h2>
            <p>Sign in to access the admin portal</p>
          </div>

          {error && (
            <div className="admin-login__error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="admin-login__form">
            <div className="admin-login__field">
              <label htmlFor="admin-email">Email Address</label>
              <div className="admin-login__input-wrapper">
                <Mail size={18} className="admin-login__input-icon" />
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@dnex.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="admin-login__field">
              <label htmlFor="admin-password">Password</label>
              <div className="admin-login__input-wrapper">
                <Lock size={18} className="admin-login__input-icon" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="admin-login__eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="admin-login__submit"
              disabled={loading}
              style={{ background: `linear-gradient(135deg, ${GOLD}, #E8B85E)` }}
            >
              {loading ? (
                <div className="admin-login__spinner" />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="admin-login__footer">
            <p>
              <Lock size={12} /> Secured with Supabase Authentication
            </p>
          </div>
        </div>

        <p className="admin-login__copyright">
          © {new Date().getFullYear()} DNex Business Consultants. All rights reserved.
        </p>
      </div>
    </div>
  );
}
