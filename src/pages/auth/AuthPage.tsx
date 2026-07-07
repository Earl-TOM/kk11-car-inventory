import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { signIn, signUp, requestPasswordReset } from '../../lib/auth-client';
import { settingsService } from '../../services/settingsService';
import './auth.css';

type AuthPath = 'sign-in' | 'sign-up' | 'forgot-password';
const ALLOWED: Set<string> = new Set(['sign-in', 'sign-up', 'forgot-password']);

export default function AuthPage() {
  const { path } = useParams<{ path: string }>();
  const navigate = useNavigate();

  const requestedPath = path || 'sign-in';
  const authPath: AuthPath = ALLOWED.has(requestedPath)
    ? (requestedPath as AuthPath)
    : 'sign-in';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [signupsEnabled, setSignupsEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    settingsService
      .getPublicSettings()
      .then((s) => setSignupsEnabled(s.signupsEnabled))
      .catch(() => setSignupsEnabled(false));
  }, []);

  // -------------------------------------------------------------------------
  // Sign In
  // -------------------------------------------------------------------------
  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signIn(email, password);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign in failed';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------------------
  // Sign Up
  // -------------------------------------------------------------------------
  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signUp(email, password, name);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------------------
  // Forgot Password
  // -------------------------------------------------------------------------
  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await requestPasswordReset(email);
      toast.success('Password reset email sent! Check your inbox.');
      setEmail('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send reset email';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------------------
  // Guard: invalid path
  // -------------------------------------------------------------------------
  if (requestedPath !== authPath) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-brand">
            <p className="auth-kicker">Account Access</p>
            <h1 className="auth-title">AutoTrade</h1>
          </div>
          <p>That auth page is not available.</p>
          <p>
            Continue to <Link to="/auth/sign-in">sign in</Link>
          </p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Guard: sign-up when disabled
  // -------------------------------------------------------------------------
  if (authPath === 'sign-up' && signupsEnabled === null) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-brand">
            <p className="auth-kicker">Account Access</p>
            <h1 className="auth-title">AutoTrade</h1>
          </div>
          <p>Loading access policy...</p>
        </div>
      </div>
    );
  }

  if (authPath === 'sign-up' && signupsEnabled === false) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-brand">
            <p className="auth-kicker">Account Access</p>
            <h1 className="auth-title">AutoTrade</h1>
          </div>
          <p>New account registration is currently disabled.</p>
          <p>
            If your email is approved, an admin can re-enable signups and you can continue here.
          </p>
          <p>
            <Link to="/auth/sign-in">Go to sign in</Link>
          </p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Forgot Password form
  // -------------------------------------------------------------------------
  if (authPath === 'forgot-password') {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-brand">
            <p className="auth-kicker">Password Assistance</p>
            <h1 className="auth-title">Forgot Password</h1>
          </div>
          <p style={{ marginBottom: '12px' }}>
            Enter your account email and we'll send you a password reset link.
          </p>
          <form onSubmit={handleForgotPassword}>
            <label>Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
            />
            <button type="submit" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send Reset Email'}
            </button>
          </form>
          <p style={{ marginTop: '14px' }}>
            Remembered your password? <Link to="/auth/sign-in">Go to sign in</Link>
          </p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Sign In form
  // -------------------------------------------------------------------------
  if (authPath === 'sign-in') {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-brand">
            <p className="auth-kicker">Account Access</p>
            <h1 className="auth-title">Sign In</h1>
          </div>
          <form onSubmit={handleSignIn}>
            <label>Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
            />
            <label>Password</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <button type="submit" disabled={submitting}>
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p style={{ marginTop: '14px' }}>
            {signupsEnabled === false ? (
              <>Need access? Ask an admin to approve your email and enable signups.</>
            ) : (
              <>
                Approved email and new here?{' '}
                <Link to="/auth/sign-up">Create your account</Link>
              </>
            )}
          </p>
          <p style={{ marginTop: '8px' }}>
            <Link to="/auth/forgot-password">Forgot your password?</Link>
          </p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Sign Up form
  // -------------------------------------------------------------------------
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <p className="auth-kicker">Account Access</p>
          <h1 className="auth-title">Create Account</h1>
        </div>
        <form onSubmit={handleSignUp}>
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
          <label>Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
          />
          <label>Password</label>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 8 characters"
            minLength={8}
          />
          <button type="submit" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p style={{ marginTop: '14px' }}>
          Already have an account? <Link to="/auth/sign-in">Sign in</Link>
        </p>
      </div>
    </div>
  );
}