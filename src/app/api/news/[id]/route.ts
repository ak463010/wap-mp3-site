import { NextResponse } from 'next/server';
import { getNewsItem, deleteNews } from '@/lib/data';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const item = getNewsItem(id);
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ news: item });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const item = getNewsItem(id);
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  deleteNews(id);
  return NextResponse.json({ success: true });
}
