import { NextResponse } from 'next/server';
import { getSongs, getFolders, getNews } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET() {
  const songs = getSongs();
  const folders = getFolders();
  const news = getNews();
  const totalDownloads = songs.reduce((sum, s) => sum + (s.downloads || 0), 0);
  const totalSize = songs.reduce((sum, s) => sum + (s.fileSize || 0), 0);

  return NextResponse.json({
    stats: {
      totalSongs: songs.length,
      totalFolders: folders.length,
      totalNews: news.length,
      totalDownloads,
      totalSizeBytes: totalSize,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
    },
  });
}
