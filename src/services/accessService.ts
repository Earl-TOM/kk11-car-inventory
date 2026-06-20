import { AllowedAccount, SignupSettings } from "../types";

async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const accessService = {
  async listAllowedAccounts() {
    return requestJson<AllowedAccount[]>("/api/account-access");
  },

  async addAllowedAccount(email: string) {
    return requestJson<AllowedAccount>("/api/account-access", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
  },

  async getSignupSettings() {
    return requestJson<SignupSettings>("/api/admins/signup-settings");
  },

  async updateSignupSettings(enabled: boolean) {
    return requestJson<SignupSettings>("/api/admins/signup-settings", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ enabled }),
    });
  },
};