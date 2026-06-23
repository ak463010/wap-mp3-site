import { getDb } from './db';
import type { Song, Folder, NewsItem, LatestUpdate } from './types';

// ===================== SONGS =====================

export function getSongs(): Song[] {
  const db = getDb();
  return db.prepare('SELECT * FROM songs ORDER BY createdAt DESC').all() as Song[];
}

export function getSong(id: string): Song | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM songs WHERE id = ?').get(id) as Song | undefined;
}

export function addSong(song: Song): void {
  const db = getDb();
  db.prepare(`INSERT INTO songs (id, title, artist, album, genre, year, fileName, fileSize, duration, description, folderId, downloads, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    song.id, song.title, song.artist, song.album || '', song.genre || '',
    song.year || null, song.fileName, song.fileSize, song.duration || '',
    song.description || '', song.folderId || '', song.downloads || 0,
    song.createdAt, song.updatedAt
  );
}

export function updateSong(id: string, updates: Partial<Song>): Song | undefined {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM songs WHERE id = ?').get(id) as any;
  if (!existing) return undefined;

  const merged = { ...existing, ...updates, updatedAt: new Date().toISOString() };
  db.prepare(`UPDATE songs SET title=?, artist=?, album=?, genre=?, year=?, fileName=?, fileSize=?, description=?, folderId=?, downloads=?, updatedAt=? WHERE id=?`).run(
    merged.title, merged.artist, merged.album, merged.genre,
    merged.year, merged.fileName, merged.fileSize, merged.description,
    merged.folderId, merged.downloads, merged.updatedAt, id
  );
  return merged as Song;
}

export function deleteSong(id: string): boolean {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM songs WHERE id = ?').get(id);
  if (!existing) return false;
  db.prepare('DELETE FROM songs WHERE id = ?').run(id);
  return true;
}

export function incrementDownloads(id: string): number {
  const db = getDb();
  const song = db.prepare('SELECT * FROM songs WHERE id = ?').get(id) as any;
  if (!song) return 0;
  const count = (song.downloads || 0) + 1;
  db.prepare('UPDATE songs SET downloads = ? WHERE id = ?').run(count, id);
  return count;
}

export function getSongsByFolder(folderId: string): Song[] {
  const db = getDb();
  return db.prepare('SELECT * FROM songs WHERE folderId = ? ORDER BY createdAt DESC').all(folderId) as Song[];
}

export function getSongsBySearch(query: string): Song[] {
  const db = getDb();
  const q = `%${query}%`;
  return db.prepare('SELECT * FROM songs WHERE title LIKE ? OR artist LIKE ? OR album LIKE ? OR genre LIKE ? ORDER BY createdAt DESC').all(q, q, q, q) as Song[];
}

// ===================== FOLDERS =====================

export function getFolders(): Folder[] {
  const db = getDb();
  return db.prepare('SELECT * FROM folders ORDER BY createdAt DESC').all() as Folder[];
}

export function getFolder(id: string): Folder | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM folders WHERE id = ?').get(id) as Folder | undefined;
}

export function addFolder(folder: Folder): void {
  const db = getDb();
  db.prepare('INSERT INTO folders (id, name, description, parentId, coverUrl, createdAt) VALUES (?, ?, ?, ?, ?, ?)').run(
    folder.id, folder.name, folder.description || '', folder.parentId || null,
    folder.coverUrl || '', folder.createdAt
  );
}

export function updateFolder(id: string, updates: Partial<Folder>): Folder | undefined {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM folders WHERE id = ?').get(id) as any;
  if (!existing) return undefined;
  const merged = { ...existing, ...updates };
  db.prepare('UPDATE folders SET name=?, description=?, parentId=? WHERE id=?').run(
    merged.name, merged.description || '', merged.parentId || null, id
  );
  return merged as Folder;
}

export function deleteFolder(id: string): boolean {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM folders WHERE id = ?').get(id);
  if (!existing) return false;
  db.prepare('UPDATE songs SET folderId = ? WHERE folderId = ?').run('', id);
  db.prepare('DELETE FROM folders WHERE id = ?').run(id);
  return true;
}

// ===================== NEWS =====================

export function getNews(): NewsItem[] {
  const db = getDb();
  return db.prepare('SELECT * FROM news ORDER BY createdAt DESC').all() as NewsItem[];
}

export function getNewsItem(id: string): NewsItem | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM news WHERE id = ?').get(id) as NewsItem | undefined;
}

export function addNews(news: NewsItem): void {
  const db = getDb();
  const excerpt = news.content.substring(0, 150) + (news.content.length > 150 ? '...' : '');
  db.prepare('INSERT INTO news (id, title, content, excerpt, author, imageUrl, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    news.id, news.title, news.content, excerpt, news.author || 'Admin',
    news.imageUrl || '', news.createdAt
  );
}

export function deleteNews(id: string): boolean {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM news WHERE id = ?').get(id);
  if (!existing) return false;
  db.prepare('DELETE FROM news WHERE id = ?').run(id);
  return true;
}

// ===================== LATEST UPDATES =====================

export function getLatestUpdates(limit: number = 20): LatestUpdate[] {
  const db = getDb();
  return db.prepare('SELECT * FROM updates ORDER BY createdAt DESC LIMIT ?').all(limit) as LatestUpdate[];
}

export function addUpdate(update: LatestUpdate): void {
  const db = getDb();
  db.prepare('INSERT INTO updates (id, type, refId, title, description, icon, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    update.id, update.type, update.refId, update.title, update.description,
    update.icon, update.createdAt
  );
}

export function clearUpdates(): void {
  const db = getDb();
  db.prepare('DELETE FROM updates').run();
}
