import { Pool } from 'pg';
import { env } from './env';

export const pool = new Pool({
  connectionString: env.databaseUrl,

  ssl: env.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {

  console.error('Unexpected PostgreSQL pool error', err);
});

export async function query<T = any>(
  text: string,
  params?: unknown[],
): Promise<{ rows: T[]; rowCount: number }> {
  const result = await pool.query(text, params);
  return { rows: result.rows as T[], rowCount: result.rowCount ?? 0 };
}
