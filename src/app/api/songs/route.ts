import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { writeFile, mkdir } from 'fs/promises';
import * as path from 'path';
import { addSong, getSongs, getSongsBySearch } from '@/lib/data';
import type { Song } from '@/lib/types';
import { addUpdate } from '@/lib/data';

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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const title = formData.get('title') as string;
    const artist = formData.get('artist') as string;
    const album = formData.get('album') as string || '';
    const genre = formData.get('genre') as string || '';
    const year = formData.get('year') as string || '';
    const description = formData.get('description') as string || '';
    const folderId = formData.get('folderId') as string || '';

    if (!file || !title || !artist) {
      return NextResponse.json({ error: 'Title, artist and file are required' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.mp3')) {
      return NextResponse.json({ error: 'Only MP3 files are allowed' }, { status: 400 });
    }

    const id = uuidv4();
    const ext = path.extname(file.name);
    const safeName = `${id}${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'songs');

    await mkdir(uploadDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(uploadDir, safeName);
    await writeFile(filePath, buffer);

    const song: Song = {
      id,
      title,
      artist,
      album: album || undefined,
      genre: genre || undefined,
      year: year ? parseInt(year) : undefined,
      fileName: safeName,
      fileSize: file.size,
      description: description || undefined,
      folderId: folderId || undefined,
      downloads: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addSong(song);

    addUpdate({
      id: uuidv4(),
      type: 'song_added',
      refId: id,
      title: song.title,
      description: `New song "${song.title}" by ${song.artist}`,
      icon: '🎵',
      createdAt: song.createdAt,
    });

    return NextResponse.json({ success: true, song });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
