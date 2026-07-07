import { FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { confirmPasswordReset } from '../../lib/auth-client';
import './auth.css';

/**
 * Confirm Password Reset Page
 *
 * PocketBase sends an email containing a link to this page with a `?token=…`
 * query parameter. The user sets their new password here.
 *
 * Route: /auth/confirm-reset
 */
export default function ConfirmPasswordResetPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!token) {
      toast.error('Invalid or missing reset token. Please request a new reset link.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setSubmitting(true);
    try {
      await confirmPasswordReset(token, newPassword, confirmPassword);
      toast.success('Password updated! Please sign in with your new password.');
      navigate('/auth/sign-in', { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Reset failed. The link may have expired.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-brand">
            <p className="auth-kicker">Password Reset</p>
            <h1 className="auth-title">Invalid Link</h1>
          </div>
          <p>This reset link is invalid or has expired.</p>
          <p>
            <Link to="/auth/forgot-password">Request a new reset link</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <p className="auth-kicker">Security Update</p>
          <h1 className="auth-title">Reset Password</h1>
        </div>

        <p style={{ marginBottom: '12px' }}>
          Enter your new password below.
        </p>

        <form onSubmit={onSubmit}>
          <label>New Password</label>
          <input
            required
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimum 8 characters"
            minLength={8}
          />

          <label>Confirm New Password</label>
          <input
            required
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
          />

          <button type="submit" disabled={submitting}>
            {submitting ? 'Updating...' : 'Set New Password'}
          </button>
        </form>
      </div>
    </div>
  );
}