import { sql } from "./db";

export type SiteSettings = {
  siteName: string;
  siteSubtitle: string;
  heroKicker: string;
  heroTitle: string;
  heroDescription: string;
  footerText: string;
  logoUrl: string;
  faviconUrl: string;
  whatsappNumber: string;
  signupsEnabled: boolean;
};

type SiteSettingsRow = {
  site_name: string;
  site_subtitle: string;
  hero_kicker: string;
  hero_title: string;
  hero_description: string;
  footer_text: string;
  logo_url: string;
  favicon_url: string;
  whatsapp_number: string;
  signups_enabled: boolean;
};

export type SiteSettingsUpdatePayload = {
  siteName?: unknown;
  siteSubtitle?: unknown;
  heroKicker?: unknown;
  heroTitle?: unknown;
  heroDescription?: unknown;
  footerText?: unknown;
  logoUrl?: unknown;
  faviconUrl?: unknown;
  whatsappNumber?: unknown;
};

function cleanOptionalText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return undefined;
  }
  return value.trim().slice(0, maxLength);
}

function cleanOptionalWhatsApp(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }
  const normalized = value.trim().replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
  return normalized.slice(0, 20);
}

function mapRow(row: SiteSettingsRow): SiteSettings {
  return {
    siteName: row.site_name,
    siteSubtitle: row.site_subtitle,
    heroKicker: row.hero_kicker,
    heroTitle: row.hero_title,
    heroDescription: row.hero_description,
    footerText: row.footer_text,
    logoUrl: row.logo_url,
    faviconUrl: row.favicon_url,
    whatsappNumber: row.whatsapp_number,
    signupsEnabled: row.signups_enabled,
  };
}

async function ensureSettingsRow() {
  await sql`
    INSERT INTO app_settings (id, signups_enabled)
    VALUES (1, TRUE)
    ON CONFLICT (id) DO NOTHING
  `;
}

export async function getSiteSettings() {
  await ensureSettingsRow();

  const rows = await sql<SiteSettingsRow[]>`
    SELECT
      site_name,
      site_subtitle,
      hero_kicker,
      hero_title,
      hero_description,
      footer_text,
      logo_url,
      favicon_url,
      whatsapp_number,
      signups_enabled
    FROM app_settings
    WHERE id = 1
    LIMIT 1
  `;

  return mapRow(rows[0]);
}

export function sanitizeSiteSettingsPayload(input: SiteSettingsUpdatePayload) {
  return {
    siteName: cleanOptionalText(input.siteName, 120),
    siteSubtitle: cleanOptionalText(input.siteSubtitle, 120),
    heroKicker: cleanOptionalText(input.heroKicker, 120),
    heroTitle: cleanOptionalText(input.heroTitle, 180),
    heroDescription: cleanOptionalText(input.heroDescription, 400),
    footerText: cleanOptionalText(input.footerText, 220),
    logoUrl: cleanOptionalText(input.logoUrl, 2_000_000),
    faviconUrl: cleanOptionalText(input.faviconUrl, 2_000_000),
    whatsappNumber: cleanOptionalWhatsApp(input.whatsappNumber),
  };
}

export async function updateSiteSettings(input: SiteSettingsUpdatePayload) {
  await ensureSettingsRow();
  const payload = sanitizeSiteSettingsPayload(input);

  const rows = await sql<SiteSettingsRow[]>`
    UPDATE app_settings
    SET
      site_name = COALESCE(${payload.siteName ?? null}, site_name),
      site_subtitle = COALESCE(${payload.siteSubtitle ?? null}, site_subtitle),
      hero_kicker = COALESCE(${payload.heroKicker ?? null}, hero_kicker),
      hero_title = COALESCE(${payload.heroTitle ?? null}, hero_title),
      hero_description = COALESCE(${payload.heroDescription ?? null}, hero_description),
      footer_text = COALESCE(${payload.footerText ?? null}, footer_text),
      logo_url = COALESCE(${payload.logoUrl ?? null}, logo_url),
      favicon_url = COALESCE(${payload.faviconUrl ?? null}, favicon_url),
      whatsapp_number = COALESCE(${payload.whatsappNumber ?? null}, whatsapp_number),
      updated_at = NOW()
    WHERE id = 1
    RETURNING
      site_name,
      site_subtitle,
      hero_kicker,
      hero_title,
      hero_description,
      footer_text,
      logo_url,
      favicon_url,
      whatsapp_number,
      signups_enabled
  `;

  return mapRow(rows[0]);
}