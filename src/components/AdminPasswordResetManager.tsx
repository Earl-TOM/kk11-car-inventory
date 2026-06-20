import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { KeyRound, CheckCircle2, Ban, Clock3 } from "lucide-react";
import { PasswordResetRequest } from "../types";
import { passwordResetService } from "../services/passwordResetService";

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export default function AdminPasswordResetManager() {
  const [items, setItems] = useState<PasswordResetRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<number | null>(null);

  const loadItems = async () => {
    const requests = await passwordResetService.listRequests();
    setItems(requests);
    setLoading(false);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const approveResetRequirement = async (item: PasswordResetRequest) => {
    setWorkingId(item.id);
    await passwordResetService.updateRequest(item.id, {
      status: "approved",
      generateTemporaryPassword: false,
      adminNote: "Password reset required on next login.",
    });
    setWorkingId(null);
    await loadItems();
    toast.success("Reset requirement approved for this user");
  };

  const markCompleted = async (item: PasswordResetRequest) => {
    setWorkingId(item.id);
    await passwordResetService.updateRequest(item.id, {
      status: "completed",
      adminNote: "Reset completed by admin.",
    });
    setWorkingId(null);
    await loadItems();
    toast.success("Password reset marked as completed");
  };

  const rejectRequest = async (item: PasswordResetRequest) => {
    setWorkingId(item.id);
    await passwordResetService.updateRequest(item.id, {
      status: "rejected",
      adminNote: "Request rejected by admin.",
    });
    setWorkingId(null);
    await loadItems();
    toast.success("Reset request rejected");
  };

  return (
    <section className="border-2 border-art-black bg-white p-6 brutalist-shadow">
      <div className="mb-4 flex items-center gap-2">
        <KeyRound size={16} className="text-art-orange" />
        <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-art-black/70">
          Password Resets
        </h3>
      </div>

      <p className="mb-4 border border-art-black/20 bg-art-beige px-3 py-2 font-serif text-sm text-art-black/80">
        Users submit reset requests here; admins can approve a mandatory reset and users will be required to change password after sign-in.
      </p>

      {loading ? (
        <p className="font-serif text-sm text-art-black/70">Loading reset requests...</p>
      ) : items.length === 0 ? (
        <p className="font-serif text-sm text-art-black/70">No reset requests yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="border-2 border-art-black/20 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <p className="font-serif text-base text-art-black">{item.email}</p>
                  <p className="font-mono text-[9px] uppercase tracking-wider text-art-black/50">
                    Requested {formatDate(item.createdAt)}
                  </p>
                  {item.reason ? (
                    <p className="font-serif text-sm italic text-art-black/80">“{item.reason}”</p>
                  ) : null}
                </div>

                <span className="inline-flex w-fit items-center gap-1 border border-art-black px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-art-black">
                  <Clock3 size={12} />
                  {item.status}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => approveResetRequirement(item)}
                  disabled={workingId === item.id}
                  className="inline-flex items-center gap-1 border-2 border-art-black bg-art-black px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:bg-art-orange disabled:opacity-50"
                >
                  <KeyRound size={12} />
                  Approve Reset Requirement
                </button>
                <button
                  type="button"
                  onClick={() => markCompleted(item)}
                  disabled={workingId === item.id}
                  className="inline-flex items-center gap-1 border-2 border-art-black bg-white px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-art-black transition-all hover:bg-art-beige disabled:opacity-50"
                >
                  <CheckCircle2 size={12} />
                  Mark Completed
                </button>
                <button
                  type="button"
                  onClick={() => rejectRequest(item)}
                  disabled={workingId === item.id}
                  className="inline-flex items-center gap-1 border-2 border-art-black bg-white px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-art-black transition-all hover:bg-art-orange hover:text-white disabled:opacity-50"
                >
                  <Ban size={12} />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}