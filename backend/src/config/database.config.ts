import pkg from 'pg';
import { Adapter } from '@adminjs/sql';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export const query = async <T = any>(text: string, params?: any[]) => {
  const result = await pool.query(text, params);
  return { ...result, rows: result.rows as T[] };
};

export const getAdminAdapter = async () => {
  const databaseName = process.env.DATABASE_NAME;
  if (!databaseName) {
    throw new Error('DATABASE_NAME environment variable is not set');
  }

  return await new Adapter('postgresql', {
    connectionString: process.env.DATABASE_URL,
    database: databaseName,
  }).init();
};