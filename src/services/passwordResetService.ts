import { PasswordResetRequest, PasswordResetRequestStatus } from "../types";

type UpdateResetRequestPayload = {
  status?: PasswordResetRequestStatus;
  adminNote?: string;
};

type MyResetRequirement = {
  required: boolean;
  requestId: number | null;
};

async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const passwordResetService = {
  async submitRequest(email: string, reason: string) {
    return requestJson<PasswordResetRequest>("/api/password-reset-requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, reason }),
    });
  },

  async listRequests() {
    return requestJson<PasswordResetRequest[]>("/api/admins/password-reset-requests");
  },

  async updateRequest(id: number, payload: UpdateResetRequestPayload) {
    return requestJson<PasswordResetRequest>(`/api/admins/password-reset-requests/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },

  async getMyResetRequirement() {
    return requestJson<MyResetRequirement>("/api/password-reset-requests/me");
  },

  async changePassword(currentPassword: string, newPassword: string) {
    return requestJson<{ ok?: boolean; token?: string }>("/api/auth/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    });
  },

  async completeMyReset() {
    return requestJson<{ ok: boolean }>("/api/password-reset-requests/complete", {
      method: "POST",
    });
  },
};