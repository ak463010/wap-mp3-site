import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getSongs, getSongsBySearch } from '@/lib/data';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get('q');
  const folder = searchParams.get('folder');

  let songs = getSongs();

  if (folder) {
    songs = songs.filter(s => s.folderId === folder);
  }

  if (query) {
    songs = getSongsBySearch(query);
  }

  return NextResponse.json({ songs });
}

export async function POST() {
  try {
    await requireAdmin();
    return NextResponse.json(
      { error: 'Use /api/admin/songs to upload MP3 files from the admin panel.' },
      { status: 410 }
    );
  } catch (e: any) {
    if (e.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Upload disabled on public API' }, { status: 500 });
  }
}
