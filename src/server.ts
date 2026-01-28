import app from './app.js';
import config from './config/config.js';
import sqlite3 from 'sqlite3';
import { getDb } from './db/database.js';

if (config.nodeEnv === 'development') {
  sqlite3.verbose();
}

// Open DB once to ensure the file exists and migrations are run at startup
await getDb();

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
