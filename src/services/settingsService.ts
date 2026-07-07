import type { RecordModel } from 'pocketbase';
import { pb } from '../lib/pocketbase';
import { SiteSettings, SiteSettingsUpdate } from '../types';

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
// settingsService
// ---------------------------------------------------------------------------
export const settingsService = {
  /** Fetch site settings (public & admin both read the same record). */
  async getPublicSettings(): Promise<SiteSettings> {
    const record = await pb
      .collection('app_settings')
      .getFirstListItem('');
    return mapSettings(record);
  },

  async getAdminSiteSettings(): Promise<SiteSettings> {
    return this.getPublicSettings();
  },

  /**
   * Update site settings.
   * `logoFile` / `faviconFile` are optional File objects for brand assets.
   */
  async updateAdminSiteSettings(
    payload: SiteSettingsUpdate,
    logoFile?: File | null,
    faviconFile?: File | null
  ): Promise<SiteSettings> {
    const record = await pb
      .collection('app_settings')
      .getFirstListItem('');

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

    const updated = await pb
      .collection('app_settings')
      .update(record.id, fd);

    return mapSettings(updated);
  },
};