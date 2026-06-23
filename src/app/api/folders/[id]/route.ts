import { NextRequest, NextResponse } from 'next/server';
import { getFolder, deleteFolder, getSongsByFolder } from '@/lib/data';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const folder = getFolder(id);
  if (!folder) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ folder });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const folder = getFolder(id);
  if (!folder) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  deleteFolder(id);
  return NextResponse.json({ success: true });
}
