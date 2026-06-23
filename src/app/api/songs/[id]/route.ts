import { NextResponse } from 'next/server';
import { getSong, deleteSong } from '@/lib/data';
import * as fs from 'fs';
import * as path from 'path';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const song = getSong(id);
  if (!song) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ song });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const song = getSong(id);
  if (!song) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Delete the file
  const filePath = path.join(process.cwd(), 'public', 'uploads', 'songs', song.fileName);
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (e) {
    console.error('Failed to delete file:', e);
  }

  deleteSong(id);
  return NextResponse.json({ success: true });
}
