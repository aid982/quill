/*import { BetterSQLite3Database, drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
 
const sqlite = new Database('sqlite.db');
export const db: BetterSQLite3Database = drizzle(sqlite);*/
import { neon, neonConfig } from '@neondatabase/serverless';
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from 'drizzle-orm/neon-http';
 
neonConfig.fetchConnectionCache = true;
 
const sql = neon(process.env.DRIZZLE_DATABASE_URL!);
export const db =drizzle(sql); 


