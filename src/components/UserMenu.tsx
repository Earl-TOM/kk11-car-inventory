import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthSession, signOut } from '../lib/auth-client';

export default function UserMenu() {
  const session = useAuthSession();
  const navigate = useNavigate();

  if (session.isPending || !session.data?.user) {
    return null;
  }

  const handleSignOut = () => {
    signOut();
    navigate('/', { replace: true });
  };

  return (
    <div className="flex items-center gap-4">
      <span className="hidden border border-white/30 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-white/80 sm:inline-block">
        {session.data.user.name || session.data.user.email}
      </span>
      <button
        onClick={handleSignOut}
        className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-art-orange"
      >
        <LogOut size={14} />
        Logout
      </button>
    </div>
  );
}