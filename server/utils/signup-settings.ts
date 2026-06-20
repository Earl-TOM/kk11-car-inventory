import { sql } from "./db";

export async function getSignupsEnabled() {
  const rows = await sql<{ signups_enabled: boolean }[]>`
    SELECT signups_enabled
    FROM app_settings
    WHERE id = 1
    LIMIT 1
  `;

  if (rows.length > 0) {
    return rows[0].signups_enabled;
  }

  const inserted = await sql<{ signups_enabled: boolean }[]>`
    INSERT INTO app_settings (id, signups_enabled)
    VALUES (1, TRUE)
    ON CONFLICT (id) DO UPDATE
      SET signups_enabled = app_settings.signups_enabled
    RETURNING signups_enabled
  `;

  return inserted[0]?.signups_enabled ?? true;
}

export async function setSignupsEnabled(enabled: boolean) {
  const rows = await sql<{ signups_enabled: boolean }[]>`
    INSERT INTO app_settings (id, signups_enabled, updated_at)
    VALUES (1, ${enabled}, NOW())
    ON CONFLICT (id) DO UPDATE
      SET signups_enabled = EXCLUDED.signups_enabled,
          updated_at = NOW()
    RETURNING signups_enabled
  `;

  return rows[0]?.signups_enabled ?? enabled;
}