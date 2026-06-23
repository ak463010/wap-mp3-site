import * as path from 'path';
import * as fs from 'fs';

// better-sqlite3 — loaded dynamically
let BetterSqlite3: any;
try {
  BetterSqlite3 = require('better-sqlite3');
} catch {
  throw new Error('better-sqlite3 is required');
}

const DB_PATH = path.join(process.cwd(), 'data', 'mp3wap.db');

let _db: any = null;

export function getDb(): any {
  if (_db) return _db;

  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  _db = new BetterSqlite3(DB_PATH);
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');

  initializeSchema(_db);
  return _db;
}

function initializeSchema(db: any) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS songs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      album TEXT DEFAULT '',
      genre TEXT DEFAULT '',
      year INTEGER DEFAULT NULL,
      fileName TEXT NOT NULL,
      fileSize INTEGER DEFAULT 0,
      duration TEXT DEFAULT '',
      description TEXT DEFAULT '',
      folderId TEXT DEFAULT '',
      downloads INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS folders (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      parentId TEXT DEFAULT NULL,
      coverUrl TEXT DEFAULT '',
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS news (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      excerpt TEXT DEFAULT '',
      author TEXT DEFAULT 'Admin',
      imageUrl TEXT DEFAULT '',
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS updates (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      refId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      icon TEXT DEFAULT '',
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      displayName TEXT DEFAULT '',
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_songs_folder ON songs(folderId);
    CREATE INDEX IF NOT EXISTS idx_songs_created ON songs(createdAt DESC);
    CREATE INDEX IF NOT EXISTS idx_updates_created ON updates(createdAt DESC);
    CREATE INDEX IF NOT EXISTS idx_news_created ON news(createdAt DESC);
  `);

  // Insert default admin if not exists
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  if (!existing) {
    const bcrypt = require('bcryptjs');
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare(
      'INSERT INTO users (username, password, role, displayName, createdAt) VALUES (?, ?, ?, ?, ?)'
    ).run('admin', hash, 'admin', 'Administrator', new Date().toISOString());
  }

  // Insert default settings
  const settingsExist = db.prepare('SELECT key FROM settings LIMIT 1').get();
  if (!settingsExist) {
    const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
    const defaults: [string, string][] = [
      ['site_name', 'MP3WAP'],
      ['site_tagline', 'Free MP3 Downloads'],
      ['site_description', 'Your ultimate WAP-style MP3 download site.'],
      ['items_per_page', '20'],
      ['allow_uploads', 'true'],
    ];
    for (const [k, v] of defaults) {
      insertSetting.run(k, v);
    }
  }
}

export function closeDb() {
  if (_db) {
    _db.close();
    _db = null;
  }
}
