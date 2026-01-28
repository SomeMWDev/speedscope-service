import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import path from 'path';

let db: Database | null = null;

export async function getDb() {
  if (!db) {
    db = await open({
      filename: path.join(process.cwd(), 'db', 'database.db'),
      driver: sqlite3.Database,
    });

    await db.migrate({
      migrationsPath: path.join(process.cwd(), 'db', 'migrations'),
    });
  }

  return db;
}
