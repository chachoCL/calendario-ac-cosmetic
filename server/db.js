/**
 * Database configuration with SQLite
 * Uses better-sqlite3 for synchronous operations
 */

import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file location - use /data in Docker, local in dev
const dbPath = process.env.DB_PATH || path.join(__dirname, 'salon.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Initialize database schema
function initializeDatabase() {
  db.exec(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      createdBy TEXT
    );

    -- Services table
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      duration INTEGER NOT NULL,
      price INTEGER NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      createdBy TEXT,
      FOREIGN KEY (createdBy) REFERENCES users(id)
    );

    -- Staff table
    CREATE TABLE IF NOT EXISTS staff (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT,
      specialties TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      createdBy TEXT,
      FOREIGN KEY (createdBy) REFERENCES users(id)
    );

    -- Clients table
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      notes TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      createdBy TEXT,
      FOREIGN KEY (createdBy) REFERENCES users(id)
    );

    -- Appointments table
    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      clientId TEXT NOT NULL,
      serviceId TEXT NOT NULL,
      staffId TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      notes TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      createdBy TEXT,
      FOREIGN KEY (clientId) REFERENCES clients(id),
      FOREIGN KEY (serviceId) REFERENCES services(id),
      FOREIGN KEY (staffId) REFERENCES staff(id),
      FOREIGN KEY (createdBy) REFERENCES users(id)
    );

    -- Settings table for app configuration
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  console.log('Database initialized successfully');
}

// Check if setup is complete (admin exists)
function isSetupComplete() {
  const admin = db.prepare('SELECT id FROM users WHERE role = ?').get('admin');
  return !!admin;
}

// Create initial admin user
function createAdminUser(username, password) {
  const hashedPassword = bcrypt.hashSync(password, 10);
  const id = crypto.randomUUID();

  const stmt = db.prepare(`
    INSERT INTO users (id, username, password, role)
    VALUES (?, ?, ?, 'admin')
  `);

  stmt.run(id, username, hashedPassword);
  return { id, username, role: 'admin' };
}

// Verify user credentials
function verifyUser(username, password) {
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

  if (!user) return null;

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) return null;

  return { id: user.id, username: user.username, role: user.role };
}

// Export database and helpers
export {
  db,
  initializeDatabase,
  isSetupComplete,
  createAdminUser,
  verifyUser,
};
