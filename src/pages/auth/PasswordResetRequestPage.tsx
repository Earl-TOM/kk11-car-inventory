import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { passwordResetService } from "../../services/passwordResetService";
import "./auth.css";

export default function PasswordResetRequestPage() {
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    await passwordResetService.submitRequest(email, reason);

    setSubmitting(false);
    setEmail("");
    setReason("");
    toast.success("Reset request sent to admin");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <p className="auth-kicker">Password Assistance</p>
          <h1 className="auth-title">Request Reset</h1>
        </div>

        <p style={{ marginBottom: "12px" }}>
          Password resets are handled by admins only. Submit your request below.
        </p>

        <form onSubmit={onSubmit}>
          <label>Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
          />

          <label>Reason (optional)</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="I forgot my password"
          />

          <button type="submit" disabled={submitting}>
            {submitting ? "Sending..." : "Send Request"}
          </button>
        </form>

        <p style={{ marginTop: "14px" }}>
          Remembered your password? <Link to="/auth/sign-in">Go to sign in</Link>
        </p>
      </div>
    </div>
  );
}