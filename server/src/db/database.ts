import { createClient, Client, InStatement, ResultSet } from '@libsql/client/web';
import * as dotenv from 'dotenv';

try {
  dotenv.config();
} catch {
  // Edge runtime safe (e.g. Cloudflare Workers without local filesystem)
}

const clientCache = new Map<string, Client>();

export function getClient(env?: any): Client {
  const url = (env && env.DATABASE_URL) || process.env.DATABASE_URL;
  const authToken = (env && env.DATABASE_AUTH_TOKEN) || process.env.DATABASE_AUTH_TOKEN;

  if (!url) {
    throw new Error(
      'Database connection failed: DATABASE_URL environment variable is missing. ' +
      'Please configure DATABASE_URL and DATABASE_AUTH_TOKEN in your environment or .env file.'
    );
  }

  const cacheKey = `${url}::${authToken || ''}`;
  let client = clientCache.get(cacheKey);
  if (!client) {
    client = createClient({
      url,
      authToken,
    });
    clientCache.set(cacheKey, client);
  }

  return client;
}

// Lazy proxy for db to avoid crashing at module-import time if env variables are loaded dynamically
export const db: Client = new Proxy({} as Client, {
  get(_target, prop) {
    const client = getClient();
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

export async function queryAll<T = any>(sql: string, args: any[] = [], env?: any): Promise<T[]> {
  const client = getClient(env);
  const result = await client.execute({ sql, args });
  return result.rows as unknown as T[];
}

export async function queryOne<T = any>(sql: string, args: any[] = [], env?: any): Promise<T | null> {
  const client = getClient(env);
  const result = await client.execute({ sql, args });
  if (!result.rows || result.rows.length === 0) return null;
  return result.rows[0] as unknown as T;
}

export async function execute(sql: string, args: any[] = [], env?: any): Promise<any> {
  const client = getClient(env);
  return await client.execute({ sql, args });
}

export async function batch(statements: InStatement[], mode: 'write' | 'read' | 'deferred' = 'write', env?: any): Promise<ResultSet[]> {
  const client = getClient(env);
  return await client.batch(statements, mode);
}

export async function initDb(): Promise<void> {
  // Database tables are pre-provisioned on Turso
}

export default db;
