import { sql } from "./db";

export type PasswordResetStatus = "pending" | "approved" | "completed" | "rejected";

export type PasswordResetRequestRow = {
  id: number;
  email: string;
  reason: string;
  status: PasswordResetStatus;
  admin_note: string;
  temporary_password: string;
  handled_by: string | null;
  created_at: string | Date;
  updated_at: string | Date;
};

type UpdatePasswordResetRequestInput = {
  status?: PasswordResetStatus;
  adminNote?: string;
  handledBy?: string;
  generateTemporaryPassword?: boolean;
};

const VALID_STATUSES = new Set<PasswordResetStatus>(["pending", "approved", "completed", "rejected"]);

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return undefined;
  return value.trim().slice(0, maxLength);
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function generateTemporaryPassword(length = 12) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  let output = "";
  for (let i = 0; i < length; i += 1) {
    output += chars[Math.floor(Math.random() * chars.length)];
  }
  return output;
}

export function mapPasswordResetRow(row: PasswordResetRequestRow) {
  return {
    id: row.id,
    email: row.email,
    reason: row.reason,
    status: row.status,
    adminNote: row.admin_note,
    temporaryPassword: row.temporary_password,
    handledBy: row.handled_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createPasswordResetRequest(emailInput: unknown, reasonInput: unknown) {
  const email = typeof emailInput === "string" ? normalizeEmail(emailInput) : "";
  const reason = cleanText(reasonInput, 600) ?? "";

  if (!email || !email.includes("@")) {
    return null;
  }

  const rows = await sql<PasswordResetRequestRow[]>`
    INSERT INTO password_reset_requests (email, reason)
    VALUES (${email}, ${reason})
    ON CONFLICT ((LOWER(email))) WHERE status = 'pending'
    DO UPDATE SET
      reason = EXCLUDED.reason,
      updated_at = NOW()
    RETURNING
      id, email, reason, status, admin_note, temporary_password, handled_by, created_at, updated_at
  `;

  return rows[0] ?? null;
}

export async function listPasswordResetRequests() {
  return sql<PasswordResetRequestRow[]>`
    SELECT
      id, email, reason, status, admin_note, temporary_password, handled_by, created_at, updated_at
    FROM password_reset_requests
    ORDER BY
      CASE status
        WHEN 'pending' THEN 0
        WHEN 'approved' THEN 1
        WHEN 'completed' THEN 2
        WHEN 'rejected' THEN 3
        ELSE 4
      END,
      created_at DESC
  `;
}

export async function updatePasswordResetRequest(id: number, input: UpdatePasswordResetRequestInput) {
  const status =
    typeof input.status === "string" && VALID_STATUSES.has(input.status)
      ? input.status
      : undefined;

  const adminNote = cleanText(input.adminNote, 1000);
  const handledBy = cleanText(input.handledBy, 200);
  const temporaryPassword =
    input.generateTemporaryPassword === true ? generateTemporaryPassword() : undefined;

  const rows = await sql<PasswordResetRequestRow[]>`
    UPDATE password_reset_requests
    SET
      status = COALESCE(${status ?? null}, status),
      admin_note = COALESCE(${adminNote ?? null}, admin_note),
      temporary_password = COALESCE(${temporaryPassword ?? null}, temporary_password),
      handled_by = COALESCE(${handledBy ?? null}, handled_by),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING
      id, email, reason, status, admin_note, temporary_password, handled_by, created_at, updated_at
  `;

  return rows[0] ?? null;
}

export async function getApprovedPasswordResetRequestByEmail(email: string) {
  const normalized = normalizeEmail(email);

  const rows = await sql<PasswordResetRequestRow[]>`
    SELECT
      id, email, reason, status, admin_note, temporary_password, handled_by, created_at, updated_at
    FROM password_reset_requests
    WHERE LOWER(email) = ${normalized}
      AND status = 'approved'
    ORDER BY updated_at DESC
    LIMIT 1
  `;

  return rows[0] ?? null;
}

export async function completeApprovedPasswordResetRequest(
  id: number,
  email: string,
  temporaryPassword?: string,
) {
  const normalized = normalizeEmail(email);
  const temp = typeof temporaryPassword === "string" ? temporaryPassword.trim() : "";

  if (temp.length > 0) {
    const rows = await sql<PasswordResetRequestRow[]>`
      UPDATE password_reset_requests
      SET
        status = 'completed',
        updated_at = NOW()
      WHERE id = ${id}
        AND LOWER(email) = ${normalized}
        AND status = 'approved'
        AND temporary_password = ${temp}
      RETURNING
        id, email, reason, status, admin_note, temporary_password, handled_by, created_at, updated_at
    `;
    return rows[0] ?? null;
  }

  const rows = await sql<PasswordResetRequestRow[]>`
    UPDATE password_reset_requests
    SET
      status = 'completed',
      updated_at = NOW()
    WHERE id = ${id}
      AND LOWER(email) = ${normalized}
      AND status = 'approved'
      AND (temporary_password IS NULL OR temporary_password = '')
    RETURNING
      id, email, reason, status, admin_note, temporary_password, handled_by, created_at, updated_at
  `;

  return rows[0] ?? null;
}