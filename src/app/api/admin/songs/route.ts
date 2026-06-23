import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const db = getDb();
    const { searchParams } = request.nextUrl;
    const folderId = searchParams.get('folder');
    const search = searchParams.get('q');

    let sql = 'SELECT * FROM songs';
    const params: any[] = [];
    const conditions: string[] = [];

    if (folderId) {
      conditions.push('folderId = ?');
      params.push(folderId);
    }
    if (search) {
      conditions.push('(title LIKE ? OR artist LIKE ? OR album LIKE ?)');
      const q = `%${search}%`;
      params.push(q, q, q);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY createdAt DESC';

    const songs = db.prepare(sql).all(...params);
    return NextResponse.json({ songs });
  } catch (e: any) {
    if (e.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const formData = await request.formData();
    const db = getDb();

    const id = uuidv4();
    const now = new Date().toISOString();

    const song = {
      id,
      title: formData.get('title') as string || '',
      artist: formData.get('artist') as string || '',
      album: formData.get('album') as string || '',
      genre: formData.get('genre') as string || '',
      year: formData.get('year') ? parseInt(formData.get('year') as string) : null,
      fileName: formData.get('fileName') as string || '',
      fileSize: parseInt(formData.get('fileSize') as string) || 0,
      description: formData.get('description') as string || '',
      folderId: formData.get('folderId') as string || '',
      downloads: parseInt(formData.get('downloads') as string) || 0,
      createdAt: now,
      updatedAt: now,
    };

    db.prepare(`INSERT INTO songs (id, title, artist, album, genre, year, fileName, fileSize, description, folderId, downloads, createdAt, updatedAt) VALUES (@id, @title, @artist, @album, @genre, @year, @fileName, @fileSize, @description, @folderId, @downloads, @createdAt, @updatedAt)`).run(song);

    // Add update entry
    db.prepare('INSERT INTO updates (id, type, refId, title, description, icon, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      uuidv4(), 'song_added', id, song.title, `New song added by admin`, '🎵', now
    );

    return NextResponse.json({ success: true, song });
  } catch (e: any) {
    if (e.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Failed to create song' }, { status: 500 });
  }
}
