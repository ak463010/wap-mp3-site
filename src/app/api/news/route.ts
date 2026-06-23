import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { addNews, getNews, getNewsItem, deleteNews } from '@/lib/data';
import { addUpdate } from '@/lib/data';
import type { NewsItem } from '@/lib/types';

export async function GET(request: NextRequest) {
  const items = getNews();
  return NextResponse.json({ news: items });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, author } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const news: NewsItem = {
      id: uuidv4(),
      title,
      content,
      excerpt: content.substring(0, 150) + (content.length > 150 ? '...' : ''),
      author: author || 'Admin',
      createdAt: new Date().toISOString(),
    };

    addNews(news);

    addUpdate({
      id: uuidv4(),
      type: 'news_posted',
      refId: news.id,
      title: news.title,
      description: `News: "${news.title}"`,
      icon: '📰',
      createdAt: news.createdAt,
    });

    return NextResponse.json({ success: true, news });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
