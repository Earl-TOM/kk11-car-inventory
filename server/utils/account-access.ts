import { sql } from "./db";

export type AllowedAccountRow = {
  id: number;
  email: string;
  created_at: string | Date;
};

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function isEmailAllowedForSignup(email: string) {
  const normalized = normalizeEmail(email);

  const rows = await sql<{ allowed: boolean }[]>`
    SELECT EXISTS (
      SELECT 1
      FROM allowed_accounts
      WHERE LOWER(email) = ${normalized}
    ) AS allowed
  `;

  return rows[0]?.allowed === true;
}

export async function addAllowedAccount(email: string, createdBy: string) {
  const normalized = normalizeEmail(email);

  const rows = await sql<AllowedAccountRow[]>`
    INSERT INTO allowed_accounts (email, created_by)
    VALUES (${normalized}, ${createdBy})
    ON CONFLICT ((LOWER(email))) DO UPDATE
      SET email = EXCLUDED.email
    RETURNING id, email, created_at
  `;

  return rows[0];
}

export async function listAllowedAccounts() {
  return sql<AllowedAccountRow[]>`
    SELECT id, email, created_at
    FROM allowed_accounts
    ORDER BY created_at DESC
  `;
}