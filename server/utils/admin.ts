import { sql } from "./db";

const BOOTSTRAP_ADMIN_EMAIL = "thomas.lifuti@gmail.com";

export async function isAdminUser(user: { id: string; email: string }) {
  if (user.email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL) {
    return true;
  }

  const rows = await sql<{ uid: string }[]>`
    SELECT uid
    FROM admins
    WHERE uid = ${user.id}
    LIMIT 1
  `;

  return rows.length > 0;
}

export { BOOTSTRAP_ADMIN_EMAIL };