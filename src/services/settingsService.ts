import { SiteSettings, SiteSettingsUpdate } from "../types";

async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const settingsService = {
  async getPublicSettings() {
    return requestJson<SiteSettings>("/api/settings");
  },

  async getAdminSiteSettings() {
    return requestJson<SiteSettings>("/api/admins/site-settings");
  },

  async updateAdminSiteSettings(payload: SiteSettingsUpdate) {
    return requestJson<SiteSettings>("/api/admins/site-settings", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },
};