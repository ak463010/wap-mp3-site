export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  genre?: string;
  year?: number;
  fileName: string;
  fileSize: number;
  duration?: string;
  description?: string;
  folderId?: string;
  downloads: number;
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  name: string;
  description?: string;
  parentId?: string | null;
  coverUrl?: string;
  createdAt: string;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  author?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface LatestUpdate {
  id: string;
  type: 'song_added' | 'news_posted' | 'folder_created' | 'site_update';
  refId: string;
  title: string;
  description: string;
  icon: string;
  createdAt: string;
}
