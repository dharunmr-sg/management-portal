import { initializeSchema } from './schema.js';

console.log("Starting database initialization...");

try {
  initializeSchema();
  console.log("Database schema initialized successfully.");
} catch (error) {
  console.error("Failed to initialize database schema:", error);
  process.exit(1);
}
