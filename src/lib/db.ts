import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'data', 'reviews.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const fs = require('fs');
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');

    db.exec(`
      CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        status TEXT DEFAULT 'pending'
      )
    `);
  }
  return db;
}

export interface Review {
  id: string;
  content: string;
  created_at: number;
  status: 'pending' | 'approved' | 'rejected';
}

export function createReview(id: string, content: string): Review {
  const db = getDb();
  const created_at = Date.now();
  db.prepare('INSERT INTO reviews (id, content, created_at, status) VALUES (?, ?, ?, ?)').run(id, content, created_at, 'approved');
  return { id, content, created_at, status: 'approved' };
}

export function getApprovedReviews(): Review[] {
  const db = getDb();
  return db.prepare('SELECT * FROM reviews WHERE status = ? ORDER BY created_at DESC').all('approved') as Review[];
}

export function getAllReviews(): Review[] {
  const db = getDb();
  return db.prepare('SELECT * FROM reviews ORDER BY created_at DESC').all() as Review[];
}
