import { createClient, Client, InStatement, ResultSet } from '@libsql/client/web';
import dotenv from 'dotenv';

try {
  dotenv.config();
} catch {
  // Edge runtime safe (e.g. Cloudflare Workers without local filesystem)
}

// Determine Turso / SQLite connection URL
const defaultUrl = 'libsql://maqbara-books-osospiracy.aws-eu-central-1.turso.io';
const defaultToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTM1NjIxMjksImlkIjoiMDFhMTk4YTEtZjkwMS03YWQwLWFlNGEtOWE0MWM5NjBmNWM0Iiwia2lkIjoiMUprejlIN0EyVk1IZmhhcFpzaHljT3pFY2paRnZ6cE14QzJCb1hGSmJOayIsInJpZCI6ImU2MTFkNTAyLTEwNGEtNDA4ZS05NGJiLWVmY2I2ZTMzODZiOSJ9.8b3G_ypD7kDpwpeSOFuJJNyHo03ZfO8ygW7-2z4BmbQ-L_GY4xrqy7cCrVF5bD68HpqRjcVKYGwizpQYpInkCQ';

export function getClient(env?: any): Client {
  const url = (env && env.DATABASE_URL) || process.env.DATABASE_URL || defaultUrl;
  const authToken = (env && env.DATABASE_AUTH_TOKEN) || process.env.DATABASE_AUTH_TOKEN || defaultToken;

  return createClient({
    url,
    authToken,
  });
}

export const db: Client = getClient();

export async function queryAll<T = any>(sql: string, args: any[] = [], env?: any): Promise<T[]> {
  const client = env ? getClient(env) : db;
  const result = await client.execute({ sql, args });
  return result.rows as unknown as T[];
}

export async function queryOne<T = any>(sql: string, args: any[] = [], env?: any): Promise<T | null> {
  const client = env ? getClient(env) : db;
  const result = await client.execute({ sql, args });
  if (!result.rows || result.rows.length === 0) return null;
  return result.rows[0] as unknown as T;
}

export async function execute(sql: string, args: any[] = [], env?: any): Promise<any> {
  const client = env ? getClient(env) : db;
  return await client.execute({ sql, args });
}

export async function batch(statements: InStatement[], mode: 'write' | 'read' | 'deferred' = 'write', env?: any): Promise<ResultSet[]> {
  const client = env ? getClient(env) : db;
  return await client.batch(statements, mode);
}

export async function initDb(): Promise<void> {
  // Database tables are pre-provisioned on Turso
}

export default db;
