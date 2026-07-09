import { NextResponse } from 'next/server';

import { getCacheTime } from '@/lib/config';

export const runtime = 'nodejs';
// 强制动态渲染：该路由在构建期静态预渲染会因存储未初始化（无环境变量）而报错
// （Cannot read properties of null ... getAdminConfig / getAllUsers）。
// 设为 force-dynamic 后仅在请求时执行，运行时由 Upstash 等环境变量驱动。
export const dynamic = 'force-dynamic';

export async function GET() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch('https://api.bgm.tv/calendar', {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        Accept: 'application/json',
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const cacheTime = await getCacheTime();

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': `public, max-age=${cacheTime}, s-maxage=${cacheTime}`,
        'CDN-Cache-Control': `public, s-maxage=${cacheTime}`,
        'Vercel-CDN-Cache-Control': `public, s-maxage=${cacheTime}`,
      },
    });
  } catch (error) {
    clearTimeout(timeoutId);
    return NextResponse.json(
      { error: '获取番剧日历失败', details: (error as Error).message },
      { status: 500 }
    );
  }
}
