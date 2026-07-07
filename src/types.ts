// ---------------------------------------------------------------------------
// Core domain types — aligned to PocketBase collection schema
// ---------------------------------------------------------------------------

export type CarStatus = 'Available' | 'Sold' | 'Reserved';

/**
 * Mirrors the `cars` collection.
 * `photos` contains full URLs (resolved by carService via pb.files.getUrl).
 */
export interface Car {
  id: string;
  collectionId: string;
  collectionName: string;
  make: string;
  model: string;
  year: number;
  engine?: string;
  mileage?: number;
  /** Mapped from `original_colour` in PocketBase */
  originalColour?: string;
  photos: string[];   // Full CDN URLs — ready to use in <img src>
  price: number;
  status: CarStatus;
  description?: string;
  created: string;    // ISO timestamp
  updated: string;    // ISO timestamp
  createdBy: string;  // user relation id
}

/**
 * Mirrors the `allowed_accounts` collection.
 * NOTE: id is a string (PocketBase record ID).
 */
export interface AllowedAccount {
  id: string;
  email: string;
  created: string;
  createdBy: string;
}

/**
 * Mirrors the `app_settings` collection.
 * A single record holds all site configuration.
 */
export interface SiteSettings {
  id: string;           // Needed to update the record
  siteName: string;
  siteSubtitle: string;
  heroKicker: string;
  heroTitle: string;
  heroDescription: string;
  footerText: string;
  whatsappNumber: string;
  signupsEnabled: boolean;
  logoUrl: string;      // Resolved file URL (empty string if unset)
  faviconUrl: string;   // Resolved file URL (empty string if unset)
}

/**
 * Payload for updating text fields of `app_settings`.
 * File fields (logo / favicon) are passed separately as `File | null`.
 */
export interface SiteSettingsUpdate {
  siteName?: string;
  siteSubtitle?: string;
  heroKicker?: string;
  heroTitle?: string;
  heroDescription?: string;
  footerText?: string;
  whatsappNumber?: string;
}