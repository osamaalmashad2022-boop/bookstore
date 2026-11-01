import { createClient, Client } from '@libsql/client';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const defaultTursoUrl = 'libsql://maqbara-books-osospiracy.aws-eu-central-1.turso.io';
const defaultTursoToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTM1NjIxMjksImlkIjoiMDFhMTk4YTEtZjkwMS03YWQwLWFlNGEtOWE0MWM5NjBmNWM0Iiwia2lkIjoiMUprejlIN0EyVk1IZmhhcFpzaHljT3pFY2paRnZ6cE14QzJCb1hGSmJOayIsInJpZCI6ImU2MTFkNTAyLTEwNGEtNDA4ZS05NGJiLWVmY2I2ZTMzODZiOSJ9.8b3G_ypD7kDpwpeSOFuJJNyHo03ZfO8ygW7-2z4BmbQ-L_GY4xrqy7cCrVF5bD68HpqRjcVKYGwizpQYpInkCQ';

const dbUrl = process.env.DATABASE_URL || defaultTursoUrl;
const authToken = process.env.DATABASE_AUTH_TOKEN || defaultTursoToken;

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
