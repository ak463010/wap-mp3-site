const sqlite3 = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const DB_PATH = path.join(__dirname, '..', 'data', 'mp3wap.db');
const DATA_DIR = path.join(__dirname, '..', 'data');

function loadJSON(filename) {
  const p = path.join(DATA_DIR, filename);
  if (fs.existsSync(p)) {
    return JSON.parse(fs.readFileSync(p, 'utf-8'));
  }
  return [];
}

function uid() { return crypto.randomUUID(); }

console.log('Loading JSON data...');
const songs = loadJSON('songs.json');
const folders = loadJSON('folders.json');
const newsItems = loadJSON('news.json');
const updates = loadJSON('latest.json');
console.log(`Loaded: ${songs.length} songs, ${folders.length} folders, ${newsItems.length} news, ${updates.length} updates`);

// Remove old DB
if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
  console.log('Removed old database');
}

const db = new sqlite3(DB_PATH);
db.pragma('journal_mode = WAL');

console.log('Creating schema...');
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
`);

console.log('Inserting songs...');
const insertSong = db.prepare(
  'INSERT INTO songs (id, title, artist, album, genre, year, fileName, fileSize, duration, description, folderId, downloads, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
);
for (const song of songs) {
  const now = song.createdAt || new Date().toISOString();
  insertSong.run(
    song.id || uid(), song.title || '', song.artist || '', song.album || '',
    song.genre || '', song.year || null, song.fileName || '', song.fileSize || 0,
    song.duration || '', song.description || '', song.folderId || '', song.downloads || 0, now, now
  );
}

console.log('Inserting folders...');
const insertFolder = db.prepare(
  'INSERT INTO folders (id, name, description, parentId, coverUrl, createdAt) VALUES (?, ?, ?, ?, ?, ?)'
);
for (const folder of folders) {
  insertFolder.run(
    folder.id || uid(), folder.name || '', folder.description || '',
    folder.parentId || null, folder.coverUrl || '', folder.createdAt || new Date().toISOString()
  );
}

console.log('Inserting news...');
const insertNews = db.prepare(
  'INSERT INTO news (id, title, content, excerpt, author, imageUrl, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)'
);
for (const item of newsItems) {
  const content = item.content || item.title || '';
  const excerpt = content.length > 150 ? content.substring(0, 150) + '...' : content;
  insertNews.run(
    item.id || uid(), item.title || '', content, excerpt,
    item.author || 'Admin', '', item.createdAt || new Date().toISOString()
  );
}

console.log('Inserting updates...');
const insertUpdate = db.prepare(
  'INSERT INTO updates (id, type, refId, title, description, icon, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)'
);
for (const upd of updates) {
  insertUpdate.run(
    upd.id || uid(), upd.type || 'site_update', upd.refId || '', upd.title || '',
    upd.description || '', upd.icon || '', upd.createdAt || new Date().toISOString()
  );
}

console.log('Creating admin user...');
const hash = bcrypt.hashSync('admin123', 10);
db.prepare(
  'INSERT INTO users (username, password, role, displayName, createdAt) VALUES (?, ?, ?, ?, ?)'
).run('admin', hash, 'admin', 'Administrator', new Date().toISOString());

console.log('Creating default settings...');
const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
const defaults = [
  ['site_name', 'MP3WAP'],
  ['site_tagline', 'Free MP3 Downloads'],
  ['site_description', 'Your ultimate WAP-style MP3 download site.'],
  ['items_per_page', '20'],
  ['allow_uploads', 'true'],
];
for (const [k, v] of defaults) {
  insertSetting.run(k, v);
}

db.close();
console.log('Migration complete! Database ready at data/mp3wap.db');
