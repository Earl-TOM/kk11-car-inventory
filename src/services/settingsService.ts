import type { RecordModel } from 'pocketbase';
import { pb } from '../lib/pocketbase';
import { SiteSettings, SiteSettingsUpdate } from '../types';

// ---------------------------------------------------------------------------
// Defaults — used when no app_settings record exists yet
// ---------------------------------------------------------------------------
const DEFAULT_SETTINGS: SiteSettings = {
  id: '',
  siteName: 'AutoTrade',
  siteSubtitle: 'Inventory Management',
  heroKicker: 'Premium Selection',
  heroTitle: 'Find Your Perfect Vehicle',
  heroDescription: 'Browse our curated inventory of quality vehicles.',
  footerText: '',
  whatsappNumber: '',
  signupsEnabled: false,
  logoUrl: '',
  faviconUrl: '',
};

// ---------------------------------------------------------------------------
// Mapper: raw PocketBase record → SiteSettings
// ---------------------------------------------------------------------------
function mapSettings(record: RecordModel): SiteSettings {
  return {
    id: record.id,
    siteName: record.site_name ?? '',
    siteSubtitle: record.site_subtitle ?? '',
    heroKicker: record.hero_kicker ?? '',
    heroTitle: record.hero_title ?? '',
    heroDescription: record.hero_description ?? '',
    footerText: record.footer_text ?? '',
    whatsappNumber: record.whatsapp_number ?? '',
    signupsEnabled: record.signups_enabled ?? false,
    // Resolve file fields to full URLs
    logoUrl: record.logo
      ? pb.files.getUrl(record, record.logo as string)
      : '',
    faviconUrl: record.favicon
      ? pb.files.getUrl(record, record.favicon as string)
      : '',
  };
}

// ---------------------------------------------------------------------------
// Helper: get the single app_settings record, or null if none exists
// ---------------------------------------------------------------------------
async function fetchSettingsRecord(): Promise<RecordModel | null> {
  const result = await pb.collection('app_settings').getList(1, 1);
  return result.items[0] ?? null;
}

// ---------------------------------------------------------------------------
// settingsService
// ---------------------------------------------------------------------------
export const settingsService = {
  /** Fetch site settings. Returns defaults if no record exists yet. */
  async getPublicSettings(): Promise<SiteSettings> {
    const record = await fetchSettingsRecord();
    if (!record) return DEFAULT_SETTINGS;
    return mapSettings(record);
  },

  async getAdminSiteSettings(): Promise<SiteSettings> {
    return this.getPublicSettings();
  },

  /**
   * Update (or create on first run) site settings.
   * `logoFile` / `faviconFile` are optional File objects for brand assets.
   */
  async updateAdminSiteSettings(
    payload: SiteSettingsUpdate,
    logoFile?: File | null,
    faviconFile?: File | null
  ): Promise<SiteSettings> {
    const fd = new FormData();

    if (payload.siteName !== undefined) fd.append('site_name', payload.siteName);
    if (payload.siteSubtitle !== undefined) fd.append('site_subtitle', payload.siteSubtitle);
    if (payload.heroKicker !== undefined) fd.append('hero_kicker', payload.heroKicker);
    if (payload.heroTitle !== undefined) fd.append('hero_title', payload.heroTitle);
    if (payload.heroDescription !== undefined)
      fd.append('hero_description', payload.heroDescription);
    if (payload.footerText !== undefined) fd.append('footer_text', payload.footerText);
    if (payload.whatsappNumber !== undefined)
      fd.append('whatsapp_number', payload.whatsappNumber);

    if (logoFile) fd.append('logo', logoFile);
    if (faviconFile) fd.append('favicon', faviconFile);

    const existing = await fetchSettingsRecord();

    let updated: RecordModel;
    if (existing) {
      // Update existing record
      updated = await pb.collection('app_settings').update(existing.id, fd);
    } else {
      // First-time setup: create the record
      updated = await pb.collection('app_settings').create(fd);
    }

    return mapSettings(updated);
  },
};