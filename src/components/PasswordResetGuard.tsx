import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthSession } from "../lib/auth-client";
import { passwordResetService } from "../services/passwordResetService";

export default function PasswordResetGuard() {
  const session = useAuthSession();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (session.isPending || !session.data?.user) {
      return;
    }

    const pathname = location.pathname;

    if (pathname === "/auth/request-reset") {
      return;
    }

    passwordResetService.getMyResetRequirement().then((result) => {
      if (result.required && pathname !== "/auth/force-reset") {
        navigate("/auth/force-reset", { replace: true });
        return;
      }

      if (!result.required && pathname === "/auth/force-reset") {
        navigate("/", { replace: true });
      }
    });
  }, [session.isPending, session.data?.user, location.pathname, navigate]);

  return null;
}