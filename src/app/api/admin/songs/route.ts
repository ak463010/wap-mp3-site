import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { extractMp3Tags, titleFromFileName } from '@/lib/mp3-tags';
import { v4 as uuidv4 } from 'uuid';
import { mkdir, writeFile } from 'fs/promises';
import * as path from 'path';

export const dynamic = 'force-dynamic';

function formValue(formData: FormData, key: string): string {
  return (formData.get(key) as string | null)?.trim() || '';
}

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
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'MP3 file is required' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.mp3')) {
      return NextResponse.json({ error: 'Only MP3 files are allowed' }, { status: 400 });
    }

    const id = uuidv4();
    const safeName = `${id}.mp3`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'songs');
    const uploadPath = path.join(uploadDir, safeName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tags = extractMp3Tags(new Uint8Array(buffer));

    const title = formValue(formData, 'title') || tags.title || titleFromFileName(file.name);
    const artist = formValue(formData, 'artist') || tags.artist || 'Unknown Artist';
    const album = formValue(formData, 'album') || tags.album || '';
    const genre = formValue(formData, 'genre') || tags.genre || '';
    const yearValue = formValue(formData, 'year');
    const year = yearValue ? parseInt(yearValue) : tags.year || null;
    const description = formValue(formData, 'description');
    const folderId = formValue(formData, 'folderId');

    await mkdir(uploadDir, { recursive: true });
    await writeFile(uploadPath, buffer);

    const db = getDb();
    const now = new Date().toISOString();
    const song = {
      id,
      title,
      artist,
      album,
      genre,
      year,
      fileName: safeName,
      fileSize: file.size,
      duration: '',
      description,
      folderId,
      downloads: 0,
      createdAt: now,
      updatedAt: now,
    };

    db.prepare(`INSERT INTO songs (id, title, artist, album, genre, year, fileName, fileSize, duration, description, folderId, downloads, createdAt, updatedAt) VALUES (@id, @title, @artist, @album, @genre, @year, @fileName, @fileSize, @duration, @description, @folderId, @downloads, @createdAt, @updatedAt)`).run(song);

    db.prepare('INSERT INTO updates (id, type, refId, title, description, icon, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      uuidv4(), 'song_added', id, song.title, `New song "${song.title}" by ${song.artist}`, '🎵', now
    );

    return NextResponse.json({ success: true, song, tags });
  } catch (e: any) {
    console.error('Admin upload error:', e);
    if (e.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Failed to upload MP3' }, { status: 500 });
  }
}
