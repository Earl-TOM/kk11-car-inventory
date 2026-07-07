import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Admin from './pages/Admin';
import AuthProvider from './components/AuthProvider';
import AuthPage from './pages/auth/AuthPage';
import ConfirmPasswordResetPage from './pages/auth/ForcePasswordResetPage';
import { SiteSettings } from './types';
import { settingsService } from './services/settingsService';

export default function App() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    settingsService.getPublicSettings().then(setSettings).catch(console.error);
  }, []);

  useEffect(() => {
    if (!settings) return;

    document.title = settings.siteName;

    if (settings.faviconUrl) {
      let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = settings.faviconUrl;
    }
  }, [settings]);

  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-[#fcfaf7] font-sans text-slate-900">
          <Navbar settings={settings} />
          <Routes>
            <Route path="/" element={<Home settings={settings} />} />
            <Route path="/admin" element={<Admin />} />
            {/* Auth routes */}
            <Route path="/auth/confirm-reset" element={<ConfirmPasswordResetPage />} />
            <Route path="/auth/:path" element={<AuthPage />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}