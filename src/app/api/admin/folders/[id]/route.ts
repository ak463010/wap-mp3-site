import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const db = getDb();
    const folder = db.prepare('SELECT * FROM folders WHERE id = ?').get(id);
    if (!folder) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ folder });
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
    const existing = db.prepare('SELECT * FROM folders WHERE id = ?').get(id) as any;
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    db.prepare('UPDATE folders SET name=?, description=? WHERE id=?').run(
      body.name || existing.name, body.description ?? existing.description, id
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
    const existing = db.prepare('SELECT * FROM folders WHERE id = ?').get(id) as any;
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Remove folder reference from songs
    db.prepare('UPDATE songs SET folderId = ? WHERE folderId = ?').run('', id);
    db.prepare('DELETE FROM folders WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
