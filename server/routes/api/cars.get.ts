import { defineHandler } from 'nitro';
import { sql } from '../../utils/db';
import { mapCarRow, type CarRow } from '../../utils/cars';

export default defineHandler(async () => {
  const rows = await sql<CarRow[]>`
    SELECT
      id, make, model, year, engine, mileage, original_colour, photos, price, status, description, created_by, created_at, updated_at
    FROM cars
    ORDER BY created_at DESC
  `;

  return rows.map(mapCarRow);
});