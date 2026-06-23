import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const db = getDb();
    const existing = db.prepare('SELECT * FROM news WHERE id = ?').get(id) as any;
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    db.prepare('DELETE FROM news WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
