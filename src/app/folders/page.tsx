'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface FolderItem {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export default function FoldersPage() {
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [songCounts, setSongCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadFolders = async () => {
      try {
        const res = await fetch('/api/folders');
        const data = await res.json();
        setFolders(data.folders || []);

        const res2 = await fetch('/api/songs');
        const data2 = await res2.json();
        const songs = data2.songs || [];
        const counts: Record<string, number> = {};
        songs.forEach((s: any) => {
          if (s.folderId) counts[s.folderId] = (counts[s.folderId] || 0) + 1;
        });
        setSongCounts(counts);
      } catch (e) {}
    };

    loadFolders();
  }, []);

  return (
    <>
      <div className="wap-breadcrumb">
        <Link href="/">Home</Link> &gt; Folders
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h2 style={{ color: '#f5a623', fontSize: 14, fontWeight: 'bold' }}>📁 Music Folders</h2>
      </div>

      {folders.length === 0 ? (
        <div className="wap-card">
          <p style={{ color: '#556677', textAlign: 'center', padding: 20 }}>
            No folders created yet.
          </p>
        </div>
      ) : (
        <div className="wap-card" style={{ padding: 0 }}>
          {folders.map(folder => (
            <div key={folder.id} className="folder-entry">
              <div className="folder-icon">📁</div>
              <div className="folder-info">
                <Link href={`/folders/${folder.id}`} className="name">
                  {folder.name}
                </Link>
                <div className="desc">
                  {songCounts[folder.id] || 0} songs
                  {folder.description && <> — {folder.description}</>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {folders.length > 0 && (
        <div className="wap-stats" style={{ marginTop: 8 }}>
          <span>Total Folders: <span className="num">{folders.length}</span></span>
          <span>Total Songs: <span className="num">{Object.values(songCounts).reduce((a, b) => a + b, 0)}</span></span>
        </div>
      )}
    </>
  );
}
