import { Link } from "react-router-dom";
import { Car } from "lucide-react";
import { useEffect, useState } from "react";
import { carService } from "../services/carService";
import { useAuthSession } from "../lib/auth-client";
import UserMenu from "./UserMenu";
import { SiteSettings } from "../types";

interface NavbarProps {
  settings: SiteSettings | null;
}

export default function Navbar({ settings }: NavbarProps) {
  const session = useAuthSession();
  const user = session.data?.user ?? null;
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    carService.checkIfAdmin().then(setIsAdmin);
  }, [user]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b-2 border-art-black bg-art-black py-4">
      <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden border-2 border-white bg-white text-art-black">
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt={settings.siteName} className="h-full w-full object-cover" />
            ) : (
              <Car size={28} />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-2xl font-bold tracking-tighter text-white">
              {settings?.siteName || "AutoTrade."}
            </span>
            <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-white/40">
              {settings?.siteSubtitle || "Inventory Management"}
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="font-mono text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white"
          >
            Catalog
          </Link>

          {user ? (
            <div className="flex items-center gap-6">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="font-mono text-[10px] font-bold uppercase tracking-widest text-white hover:text-art-orange"
                >
                  Dashboard
                </Link>
              )}
              <UserMenu />
            </div>
          ) : (
            <Link
              to="/auth/sign-in"
              className="border-2 border-white bg-white px-6 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-art-black transition-all hover:bg-art-orange hover:text-white"
            >
              Log In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}