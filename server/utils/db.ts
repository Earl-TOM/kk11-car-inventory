import { neon } from '@neondatabase/serverless';

const neonSql = neon(process.env.DATABASE_URL!);

export function sql<T = Record<string, unknown>[]>(
  strings: TemplateStringsArray,
  ...params: unknown[]
): Promise<T> {
  return neonSql(strings, ...params) as unknown as Promise<T>;
}