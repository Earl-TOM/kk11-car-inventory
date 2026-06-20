import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import AuthProvider from "./components/AuthProvider";
import AuthPage from "./pages/auth/AuthPage";
import PasswordResetRequestPage from "./pages/auth/PasswordResetRequestPage";
import ForcePasswordResetPage from "./pages/auth/ForcePasswordResetPage";
import PasswordResetGuard from "./components/PasswordResetGuard";
import { SiteSettings } from "./types";
import { settingsService } from "./services/settingsService";

export default function App() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    settingsService.getPublicSettings().then(setSettings);
  }, []);

  useEffect(() => {
    if (!settings) return;

    document.title = settings.siteName;

    if (settings.faviconUrl) {
      let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = settings.faviconUrl;
    }
  }, [settings]);

  return (
    <Router>
      <AuthProvider>
        <PasswordResetGuard />
        <div className="min-h-screen bg-[#fcfaf7] font-sans text-slate-900">
          <Navbar settings={settings} />
          <Routes>
            <Route path="/" element={<Home settings={settings} />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/auth/:path" element={<AuthPage />} />
            <Route path="/auth/request-reset" element={<PasswordResetRequestPage />} />
            <Route path="/auth/force-reset" element={<ForcePasswordResetPage />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}