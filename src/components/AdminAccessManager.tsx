import { FormEvent, useEffect, useState } from 'react';
import { accessService } from '../services/accessService';
import { AllowedAccount } from '../types';
import { ShieldPlus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminAccessManager() {
  const [email, setEmail] = useState('');
  const [items, setItems] = useState<AllowedAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [signupsEnabled, setSignupsEnabled] = useState<boolean | null>(null);
  const [savingToggle, setSavingToggle] = useState(false);
  // id is now string (PocketBase record ID)
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadItems = async () => {
    const [accounts, settings] = await Promise.all([
      accessService.listAllowedAccounts(),
      accessService.getSignupSettings(),
    ]);

    setItems(accounts);
    setSignupsEnabled(settings.enabled);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const normalized = email.trim().toLowerCase();
    if (!normalized) return;

    setLoading(true);
    await accessService.addAllowedAccount(normalized);
    setEmail('');
    await loadItems();
    setLoading(false);
    toast.success('Account access approved');
  };

  const onToggleSignups = async () => {
    if (signupsEnabled === null) return;

    const nextValue = !signupsEnabled;
    setSavingToggle(true);
    const result = await accessService.updateSignupSettings(nextValue);
    setSignupsEnabled(result.enabled);
    setSavingToggle(false);

    toast.success(result.enabled ? 'Signups enabled' : 'Signups disabled');
  };

  const onRemoveApprovedAccount = async (item: AllowedAccount) => {
    const confirmed = window.confirm(`Remove ${item.email} from approved signups?`);
    if (!confirmed) return;

    setRemovingId(item.id);
    await accessService.removeAllowedAccount(item.id);
    await loadItems();
    setRemovingId(null);
    toast.success('Approved account removed');
  };

  return (
    <section className="mb-12 border-2 border-art-black bg-white p-6 brutalist-shadow">
      <div className="mb-4 flex items-center gap-2">
        <ShieldPlus size={16} className="text-art-orange" />
        <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-art-black/70">
          Account Access Control
        </h3>
      </div>

      <p className="mb-4 border border-art-black/20 bg-art-beige px-3 py-2 font-serif text-sm text-art-black/80">
        Approved emails can create accounts only when public signup is enabled, and when signup is disabled the signup form is hidden.
      </p>

      <div className="mb-6 flex flex-col gap-3 border-2 border-art-black bg-art-beige p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-art-black/50">
            Public Signup
          </p>
          <p className="mt-1 font-serif text-sm text-art-black">
            {signupsEnabled ? 'Enabled' : 'Disabled'}
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleSignups}
          disabled={savingToggle || signupsEnabled === null}
          className="border-2 border-art-black bg-art-black px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:bg-art-orange disabled:opacity-50"
        >
          {savingToggle
            ? 'Saving...'
            : signupsEnabled
              ? 'Disable Signups'
              : 'Enable Signups'}
        </button>
      </div>

      <form onSubmit={onSubmit} className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          required
          placeholder="user@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border-2 border-art-black bg-white px-4 py-3 font-serif text-sm outline-none focus:border-art-orange"
        />
        <button
          type="submit"
          disabled={loading}
          className="border-2 border-art-black bg-art-black px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:bg-art-orange disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Approve Email'}
        </button>
      </form>

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between border border-art-black/20 px-3 py-2">
            <span className="font-serif text-sm text-art-black">{item.email}</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] uppercase tracking-wider text-art-black/40">
                Approved
              </span>
              <button
                type="button"
                onClick={() => onRemoveApprovedAccount(item)}
                disabled={removingId === item.id}
                className="border border-art-black px-2 py-1 text-art-black transition-all hover:bg-art-orange hover:text-white disabled:opacity-50"
                aria-label={`Remove ${item.email}`}
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}