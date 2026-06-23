import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();
    const db = getDb();
    const folders = db.prepare('SELECT * FROM folders ORDER BY createdAt DESC').all();
    return NextResponse.json({ folders });
  } catch (e: any) {
    if (e.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const db = getDb();
    const id = uuidv4();
    const now = new Date().toISOString();

    db.prepare('INSERT INTO folders (id, name, description, parentId, createdAt) VALUES (?, ?, ?, ?, ?)').run(
      id, body.name, body.description || '', body.parentId || null, now
    );

    db.prepare('INSERT INTO updates (id, type, refId, title, description, icon, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      uuidv4(), 'folder_created', id, body.name, 'New folder created', '📁', now
    );

    return NextResponse.json({ success: true, folder: { id, name: body.name } });
  } catch (e: any) {
    if (e.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
