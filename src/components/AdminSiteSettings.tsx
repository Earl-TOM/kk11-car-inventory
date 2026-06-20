import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { settingsService } from "../services/settingsService";
import { SiteSettingsUpdate } from "../types";
import { Settings2 } from "lucide-react";
import BrandAssetUploader from "./BrandAssetUploader";

const defaults: SiteSettingsUpdate = {
  siteName: "",
  siteSubtitle: "",
  heroKicker: "",
  heroTitle: "",
  heroDescription: "",
  footerText: "",
  logoUrl: "",
  faviconUrl: "",
  whatsappNumber: "",
};

function normalizeWhatsAppNumber(value: string) {
  return value.trim().replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
}

function isInternationalNumber(value: string) {
  return /^\+[1-9]\d{7,14}$/.test(value);
}

export default function AdminSiteSettings() {
  const [formData, setFormData] = useState<SiteSettingsUpdate>(defaults);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsService.getAdminSiteSettings().then((data) => {
      setFormData({
        siteName: data.siteName,
        siteSubtitle: data.siteSubtitle,
        heroKicker: data.heroKicker,
        heroTitle: data.heroTitle,
        heroDescription: data.heroDescription,
        footerText: data.footerText,
        logoUrl: data.logoUrl,
        faviconUrl: data.faviconUrl,
        whatsappNumber: data.whatsappNumber,
      });
    });
  }, []);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);

    const normalizedWhatsApp = normalizeWhatsAppNumber(formData.whatsappNumber || "");
    if (normalizedWhatsApp && !isInternationalNumber(normalizedWhatsApp)) {
      setSaving(false);
      toast.error("Use international format with country code (e.g. +260...)");
      return;
    }

    const payload: SiteSettingsUpdate = {
      ...formData,
      whatsappNumber: normalizedWhatsApp,
    };

    const updated = await settingsService.updateAdminSiteSettings(payload);
    setFormData({
      siteName: updated.siteName,
      siteSubtitle: updated.siteSubtitle,
      heroKicker: updated.heroKicker,
      heroTitle: updated.heroTitle,
      heroDescription: updated.heroDescription,
      footerText: updated.footerText,
      logoUrl: updated.logoUrl,
      faviconUrl: updated.faviconUrl,
      whatsappNumber: updated.whatsappNumber,
    });

    setSaving(false);
    toast.success("Site settings updated");
  };

  return (
    <section className="border-2 border-art-black bg-white p-6 brutalist-shadow">
      <div className="mb-4 flex items-center gap-2">
        <Settings2 size={16} className="text-art-orange" />
        <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-art-black/70">
          Site & Hero Settings
        </h3>
      </div>

      <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
        <input
          className="border-2 border-art-black px-3 py-2 font-serif text-sm"
          placeholder="Site Name"
          value={formData.siteName || ""}
          onChange={(e) => setFormData((p) => ({ ...p, siteName: e.target.value }))}
        />
        <input
          className="border-2 border-art-black px-3 py-2 font-serif text-sm"
          placeholder="Site Subtitle"
          value={formData.siteSubtitle || ""}
          onChange={(e) => setFormData((p) => ({ ...p, siteSubtitle: e.target.value }))}
        />
        <input
          className="border-2 border-art-black px-3 py-2 font-serif text-sm"
          placeholder="Hero Kicker"
          value={formData.heroKicker || ""}
          onChange={(e) => setFormData((p) => ({ ...p, heroKicker: e.target.value }))}
        />
        <input
          className="border-2 border-art-black px-3 py-2 font-serif text-sm"
          placeholder="Hero Title (supports line breaks)"
          value={formData.heroTitle || ""}
          onChange={(e) => setFormData((p) => ({ ...p, heroTitle: e.target.value }))}
        />
        <input
          className="border-2 border-art-black px-3 py-2 font-serif text-sm md:col-span-2"
          placeholder="Hero Description"
          value={formData.heroDescription || ""}
          onChange={(e) => setFormData((p) => ({ ...p, heroDescription: e.target.value }))}
        />
        <input
          className="border-2 border-art-black px-3 py-2 font-serif text-sm md:col-span-2"
          placeholder="Footer Text"
          value={formData.footerText || ""}
          onChange={(e) => setFormData((p) => ({ ...p, footerText: e.target.value }))}
        />

        <BrandAssetUploader
          label="Logo"
          value={formData.logoUrl || ""}
          onChange={(value) => setFormData((p) => ({ ...p, logoUrl: value }))}
          disabled={saving}
          hint="Upload a square logo for best navbar fit."
        />

        <BrandAssetUploader
          label="Favicon"
          value={formData.faviconUrl || ""}
          onChange={(value) => setFormData((p) => ({ ...p, faviconUrl: value }))}
          disabled={saving}
          hint="Upload a small icon (32x32 or 64x64 recommended)."
        />

        <input
          className="border-2 border-art-black px-3 py-2 font-serif text-sm md:col-span-2"
          placeholder="WhatsApp Number (must include country code, e.g. +260...)"
          value={formData.whatsappNumber || ""}
          onChange={(e) => setFormData((p) => ({ ...p, whatsappNumber: normalizeWhatsAppNumber(e.target.value) }))}
        />

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="border-2 border-art-black bg-art-black px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:bg-art-orange disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Site Settings"}
          </button>
        </div>
      </form>
    </section>
  );
}