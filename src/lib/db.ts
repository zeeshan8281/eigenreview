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
        status TEXT DEFAULT 'pending',
        tee_hash TEXT,
        tee_signature TEXT
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
  tee_hash: string | null;
  tee_signature: string | null;
}

function coarsenTimestamp(ms: number): number {
  const HOUR_MS = 60 * 60 * 1000;
  return Math.floor(ms / HOUR_MS) * HOUR_MS;
}

export function createReview(
  id: string,
  content: string,
  teeHash: string | null = null,
  teeSignature: string | null = null
): Review {
  const db = getDb();
  const created_at = coarsenTimestamp(Date.now());
  db.prepare(
    'INSERT INTO reviews (id, content, created_at, status, tee_hash, tee_signature) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, content, created_at, 'approved', teeHash, teeSignature);
  return { id, content, created_at, status: 'approved', tee_hash: teeHash, tee_signature: teeSignature };
}

export function getApprovedReviews(): Review[] {
  const db = getDb();
  return db.prepare('SELECT * FROM reviews WHERE status = ? ORDER BY created_at DESC').all('approved') as Review[];
}

export function getAllReviews(): Review[] {
  const db = getDb();
  return db.prepare('SELECT * FROM reviews ORDER BY created_at DESC').all() as Review[];
}
