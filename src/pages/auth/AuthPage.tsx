import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthView } from "@neondatabase/auth/react";
import { settingsService } from "../../services/settingsService";
import "./auth.css";

export default function AuthPage() {
  const { path } = useParams<{ path: string }>();
  const authPath = path || "sign-in";
  const [signupsEnabled, setSignupsEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    settingsService.getPublicSettings().then((settings) => setSignupsEnabled(settings.signupsEnabled));
  }, []);

  if (authPath === "sign-up" && signupsEnabled === null) {
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

  if (authPath === "sign-up" && signupsEnabled === false) {
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

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <p className="auth-kicker">Account Access</p>
          <h1 className="auth-title">AutoTrade</h1>
        </div>
        <AuthView
          path={authPath}
          redirectTo="/"
          credentials={{ forgotPassword: false }}
        />
        <p style={{ marginTop: "14px" }}>
          {authPath === "sign-up" ? (
            <>
              Already have an account? <Link to="/auth/sign-in">Sign in</Link>
            </>
          ) : signupsEnabled === false ? (
            <>
              Need access? Ask an admin to approve your email and enable signups.
            </>
          ) : (
            <>
              Approved email and new here? <Link to="/auth/sign-up">Create your account</Link>
            </>
          )}
        </p>
        {authPath === "sign-in" ? (
          <p style={{ marginTop: "8px" }}>
            Forgot your password? <Link to="/auth/request-reset">Send a reset request to admin</Link>
          </p>
        ) : null}
      </div>
    </div>
  );
}