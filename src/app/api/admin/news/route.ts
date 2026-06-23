import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();
    const db = getDb();
    const news = db.prepare('SELECT * FROM news ORDER BY createdAt DESC').all();
    return NextResponse.json({ news });
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
    const excerpt = body.content.substring(0, 150) + (body.content.length > 150 ? '...' : '');

    db.prepare('INSERT INTO news (id, title, content, excerpt, author, createdAt) VALUES (?, ?, ?, ?, ?, ?)').run(
      id, body.title, body.content, excerpt, body.author || 'Admin', now
    );

    db.prepare('INSERT INTO updates (id, type, refId, title, description, icon, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      uuidv4(), 'news_posted', id, body.title, `News published: ${body.title}`, '📰', now
    );

    return NextResponse.json({ success: true, news: { id, title: body.title } });
  } catch (e: any) {
    if (e.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
