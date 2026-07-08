import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { requireAdmin } from '@/lib/auth';
import { addFolder, getFolders } from '@/lib/data';
import { addUpdate } from '@/lib/data';
import type { Folder } from '@/lib/types';

export async function GET(request: NextRequest) {
  const folders = getFolders();
  return NextResponse.json({ folders });
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { name, description, parentId } = body;

    if (!name) {
      return NextResponse.json({ error: 'Folder name is required' }, { status: 400 });
    }

    const folder: Folder = {
      id: uuidv4(),
      name,
      description: description || '',
      parentId: parentId || null,
      createdAt: new Date().toISOString(),
    };

    addFolder(folder);

    addUpdate({
      id: uuidv4(),
      type: 'folder_created',
      refId: folder.id,
      title: folder.name,
      description: `New folder "${folder.name}" created`,
      icon: '📁',
      createdAt: folder.createdAt,
    });

    return NextResponse.json({ success: true, folder });
  } catch (e: any) {
    if (e.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
