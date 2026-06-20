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
    if (authPath !== "sign-up") return;
    settingsService.getPublicSettings().then((settings) => setSignupsEnabled(settings.signupsEnabled));
  }, [authPath]);

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
          credentials={{ forgotPassword: true }}
        />
      </div>
    </div>
  );
}