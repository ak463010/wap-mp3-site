import { NextRequest, NextResponse } from 'next/server';
import { getSong, incrementDownloads } from '@/lib/data';
import * as fs from 'fs';
import * as path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const song = getSong(id);
  if (!song) {
    return NextResponse.json({ error: 'Song not found' }, { status: 404 });
  }

  incrementDownloads(id);

  const filePath = path.join(process.cwd(), 'public', 'uploads', 'songs', song.fileName);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'File not found on server' }, { status: 404 });
  }

  const stat = fs.statSync(filePath);
  const fileBuffer = fs.readFileSync(filePath);

  const safeName = song.title.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_') + '.mp3';

  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Length': String(stat.size),
      'Content-Disposition': `attachment; filename="${safeName}"`,
      'Accept-Ranges': 'bytes',
    },
  });
}
