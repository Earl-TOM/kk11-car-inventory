import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { carService } from "../services/carService";
import { Car } from "../types";
import AdminCarForm from "../components/AdminCarForm";
import AdminAccessManager from "../components/AdminAccessManager";
import AdminSiteSettings from "../components/AdminSiteSettings";
import { useAuthSession } from "../lib/auth-client";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";
import { cn } from "../lib/utils";
import toast from "react-hot-toast";
import { formatZMW } from "../lib/currency";

type AdminTab = "inventory" | "settings";

export default function Admin() {
  const session = useAuthSession();
  const user = session.data?.user ?? null;
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>("inventory");

  const BOOTSTRAP_ADMIN_EMAIL = "thomas.lifuti@gmail.com";

  useEffect(() => {
    if (!user) {
      setCars([]);
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    carService.checkIfAdmin().then(setIsAdmin);
    const unsubscribe = carService.subscribeToCars(setCars);
    setLoading(false);
    return () => unsubscribe();
  }, [user]);

  const handleSetupAdmin = async () => {
    await carService.bootstrapAdmin();
    setIsAdmin(true);
    toast.success("You are now an admin");
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this listing?")) {
      await carService.deleteCar(id);
      toast.success("Listing deleted");
    }
  };

  const filteredCars = cars.filter(car =>
    car.make.toLowerCase().includes(search.toLowerCase()) ||
    car.model.toLowerCase().includes(search.toLowerCase())
  );

  if (session.isPending || loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fcfaf7] px-4">
        <div className="w-full max-w-md text-center p-8 bg-white rounded-3xl border border-[#e5e0d8] shadow-xl">
          <AlertTriangle size={48} className="mx-auto text-amber-500 mb-4" />
          <h2 className="text-2xl font-bold text-slate-900">Access Restricted</h2>
          <p className="mt-2 text-slate-500">Please sign in to access the dashboard.</p>
          <Link
            to="/auth/sign-in"
            className="mt-6 inline-block border-2 border-art-black bg-art-black px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:bg-art-orange"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-art-beige px-4 py-12 sm:px-8">
      <header className="container mx-auto mb-16 flex flex-col gap-8 border-b-2 border-art-black pb-12 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col">
          <span className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-art-black/60">
            System Overdrive
          </span>
          <h1 className="font-serif text-6xl font-bold tracking-tighter text-art-black sm:text-8xl">
            Inventory<br />
            Control
          </h1>
        </div>

        {!isAdmin && user.email === BOOTSTRAP_ADMIN_EMAIL && (
          <button
            onClick={handleSetupAdmin}
            className="flex items-center gap-2 border-2 border-art-black bg-art-orange px-8 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:bg-art-black"
          >
            <ShieldCheck size={16} />
            Setup Admin
          </button>
        )}
      </header>

      <main className="container mx-auto">
        {!isAdmin ? (
          <div className="mx-auto max-w-2xl border-4 border-art-black bg-white p-12 text-center brutalist-shadow">
            <ShieldCheck size={48} className="mx-auto mb-6 text-art-orange" />
            <h3 className="font-serif text-3xl font-bold text-art-black">Access Denied</h3>
            <p className="mt-4 font-serif italic text-art-black/60">
              Your credentials lack the necessary administrative clearance for secure data modification.
            </p>
            <div className="mt-8 font-mono text-[10px] uppercase tracking-widest opacity-40">
              UID: {user.id}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-wrap gap-3 border-b-2 border-art-black pb-4">
              <button
                type="button"
                onClick={() => setActiveTab("inventory")}
                className={cn(
                  "border-2 px-5 py-2 font-mono text-[10px] font-bold uppercase tracking-widest transition-all",
                  activeTab === "inventory"
                    ? "border-art-black bg-art-black text-white"
                    : "border-art-black bg-white text-art-black hover:bg-art-orange hover:text-white"
                )}
              >
                Inventory
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("settings")}
                className={cn(
                  "border-2 px-5 py-2 font-mono text-[10px] font-bold uppercase tracking-widest transition-all",
                  activeTab === "settings"
                    ? "border-art-black bg-art-black text-white"
                    : "border-art-black bg-white text-art-black hover:bg-art-orange hover:text-white"
                )}
              >
                Settings
              </button>
            </div>

            {activeTab === "settings" ? (
              <div className="space-y-12">
                <AdminSiteSettings />
                <AdminAccessManager />
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setEditingCar(null);
                      setShowForm(true);
                    }}
                    className="flex items-center gap-2 border-2 border-art-black bg-art-black px-8 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:bg-art-orange"
                  >
                    <Plus size={16} />
                    Add Inventory
                  </button>
                </div>

                <div className="max-w-md">
                  <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-widest text-art-black/40">Search Data</label>
                  <div className="relative border-b-2 border-art-black">
                    <Search className="absolute top-1/2 left-0 -translate-y-1/2 text-art-black" size={18} />
                    <input
                      type="text"
                      placeholder="FILTER BY ATTRIBUTES..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full bg-transparent py-3 pl-8 font-serif text-xl outline-none"
                    />
                  </div>
                </div>

                <div className="overflow-hidden border-2 border-art-black bg-white brutalist-shadow">
                  <table className="w-full text-left">
                    <thead className="border-b-2 border-art-black bg-art-black">
                      <tr>
                        <th className="px-6 py-4 font-mono text-[10px] font-bold uppercase tracking-widest text-white">Entry</th>
                        <th className="px-6 py-4 font-mono text-[10px] font-bold uppercase tracking-widest text-white">Status</th>
                        <th className="px-6 py-4 font-mono text-[10px] font-bold uppercase tracking-widest text-white">Valuation</th>
                        <th className="px-6 py-4 font-mono text-[10px] font-bold uppercase tracking-widest text-white text-right">Ops</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-art-black">
                      {filteredCars.map((car) => (
                        <tr key={car.id} className="transition-colors hover:bg-art-beige">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-6">
                              <div className="h-16 w-16 border-2 border-art-black bg-slate-100 flex-shrink-0 overflow-hidden">
                                <img
                                  src={car.photos[0] || "https://images.unsplash.com/photo-1542362567-b05503f35259?auto=format&fit=crop&q=80&w=100"}
                                  className="h-full w-full object-cover"
                                  alt=""
                                />
                              </div>
                              <div>
                                <div className="font-serif text-xl font-bold leading-tight text-art-black">{car.make} {car.model}</div>
                                <div className="font-mono text-[9px] uppercase font-bold text-art-black/40">
                                  {car.year} // {car.engine || "N/A"} // {car.mileage?.toLocaleString()} KM // {car.originalColour || "Standard"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "border-2 px-3 py-1 font-mono text-[9px] font-bold uppercase",
                              car.status === "Available" ? "border-emerald-600 bg-emerald-500 text-white" :
                              car.status === "Sold" ? "border-rose-600 bg-rose-500 text-white" :
                              "border-amber-600 bg-amber-500 text-white"
                            )}>
                              {car.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-serif text-lg font-bold text-art-black">{formatZMW(car.price)}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => {
                                  setEditingCar(car);
                                  setShowForm(true);
                                }}
                                className="border-2 border-art-black bg-white p-2 text-art-black transition-all hover:bg-art-black hover:text-white"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(car.id)}
                                className="border-2 border-art-black bg-white p-2 text-art-black transition-all hover:bg-art-orange hover:text-white"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {showForm && (
        <AdminCarForm
          car={editingCar}
          onClose={() => setShowForm(false)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
}