import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();
    const db = getDb();

    const songCount = (db.prepare('SELECT COUNT(*) as count FROM songs').get() as any).count;
    const folderCount = (db.prepare('SELECT COUNT(*) as count FROM folders').get() as any).count;
    const newsCount = (db.prepare('SELECT COUNT(*) as count FROM news').get() as any).count;
    const totalDownloads = (db.prepare('SELECT COALESCE(SUM(downloads), 0) as total FROM songs').get() as any).total;
    const totalSize = (db.prepare('SELECT COALESCE(SUM(fileSize), 0) as total FROM songs').get() as any).total;

    const recentSongs = db.prepare('SELECT id, title, artist, downloads, createdAt FROM songs ORDER BY createdAt DESC LIMIT 5').all();
    const recentUpdates = db.prepare('SELECT * FROM updates ORDER BY createdAt DESC LIMIT 5').all();

    const settings: Record<string, string> = {};
    const rows = db.prepare('SELECT key, value FROM settings').all() as any[];
    for (const row of rows) settings[row.key] = row.value;

    return NextResponse.json({
      stats: {
        totalSongs: songCount,
        totalFolders: folderCount,
        totalNews: newsCount,
        totalDownloads,
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      },
      recentSongs,
      recentUpdates,
      settings,
    });
  } catch (e: any) {
    if (e.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
