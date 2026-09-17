import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the SQLite database file
const dbPath = path.resolve(__dirname, 'ecommerce.sqlite');

// Initialize the database connection
const db = new Database(dbPath, { verbose: console.log });

// Enable foreign keys for data integrity
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

console.log('SQLite connected successfully to ecommerce.sqlite');

export default db;
