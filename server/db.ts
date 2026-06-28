import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

const dbUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'file:./dev.db';

const libsql = createClient({
  url: dbUrl,
  authToken: process.env.TURSO_AUTH_TOKEN
});

const adapter = new PrismaLibSQL(libsql);
export const prisma = new PrismaClient({ adapter });
