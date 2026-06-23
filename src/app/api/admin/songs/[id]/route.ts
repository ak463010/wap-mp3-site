import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getDb } from '@/lib/db';
import * as fs from 'fs';
import * as path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const db = getDb();
    const song = db.prepare('SELECT * FROM songs WHERE id = ?').get(id);
    if (!song) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ song });
  } catch (e: any) {
    if (e.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const db = getDb();
    const existing = db.prepare('SELECT * FROM songs WHERE id = ?').get(id) as any;
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const now = new Date().toISOString();
    db.prepare(`UPDATE songs SET title=?, artist=?, album=?, genre=?, year=?, description=?, folderId=?, updatedAt=? WHERE id=?`).run(
      body.title || existing.title,
      body.artist || existing.artist,
      body.album ?? existing.album,
      body.genre ?? existing.genre,
      body.year ?? existing.year,
      body.description ?? existing.description,
      body.folderId ?? existing.folderId,
      now,
      id
    );

    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const db = getDb();
    const song = db.prepare('SELECT * FROM songs WHERE id = ?').get(id) as any;
    if (!song) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Delete file
    const filePath = path.join(process.cwd(), 'public', 'uploads', 'songs', song.fileName);
    try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (e) {}

    db.prepare('DELETE FROM songs WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
