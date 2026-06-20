import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthSession } from "../../lib/auth-client";
import { passwordResetService } from "../../services/passwordResetService";
import "./auth.css";

export default function ForcePasswordResetPage() {
  const session = useAuthSession();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (session.isPending || !session.data?.user) {
      return;
    }

    passwordResetService.getMyResetRequirement().then((result) => {
      if (!result.required) {
        navigate("/", { replace: true });
        return;
      }

      setChecking(false);
    });
  }, [session.isPending, session.data?.user, navigate]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    setSubmitting(true);

    await passwordResetService.changePasswordWithTemporary(currentPassword, newPassword);
    await passwordResetService.completeMyReset(currentPassword);

    setSubmitting(false);
    toast.success("Password updated successfully");
    navigate("/", { replace: true });
  };

  if (session.isPending || checking) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-brand">
            <p className="auth-kicker">Security Check</p>
            <h1 className="auth-title">Verifying</h1>
          </div>
          <p>Checking your reset requirement...</p>
        </div>
      </div>
    );
  }

  if (!session.data?.user) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-brand">
            <p className="auth-kicker">Access Required</p>
            <h1 className="auth-title">Sign In</h1>
          </div>
          <p>You need to sign in first.</p>
          <p>
            Continue to <Link to="/auth/sign-in">sign in</Link>
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

        <p style={{ marginBottom: "12px" }}>
          Your account is flagged for a required password update. Please set a new password now.
        </p>

        <form onSubmit={onSubmit}>
          <label>Current Password</label>
          <input
            required
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
          />

          <label>New Password</label>
          <input
            required
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimum 8 characters"
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
            {submitting ? "Updating..." : "Set New Password"}
          </button>
        </form>
      </div>
    </div>
  );
}