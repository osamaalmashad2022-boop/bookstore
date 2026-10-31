import { createClient, Client } from '@libsql/client';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbUrl = process.env.DATABASE_URL || `file:${path.join(dataDir, 'bookstore.db').replace(/\\/g, '/')}`;
const authToken = process.env.DATABASE_AUTH_TOKEN;

export const db: Client = createClient({
  url: dbUrl,
  authToken: authToken,
});

export async function queryAll<T = any>(sql: string, args: any[] = []): Promise<T[]> {
  const result = await db.execute({ sql, args });
  return result.rows as unknown as T[];
}

export async function queryOne<T = any>(sql: string, args: any[] = []): Promise<T | null> {
  const result = await db.execute({ sql, args });
  if (!result.rows || result.rows.length === 0) return null;
  return result.rows[0] as unknown as T;
}

export async function execute(sql: string, args: any[] = []): Promise<any> {
  return await db.execute({ sql, args });
}

export async function initDb(): Promise<void> {
  const schemaPath = path.resolve(__dirname, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      await db.execute(statement);
    }
  }
}

export default db;
