import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const playerId = params.id;
    if (!playerId) {
      return NextResponse.json({ error: 'Missing player ID' }, { status: 400 });
    }

    const apiKey = process.env.WOLVESVILLE_API_KEY;
    if (!apiKey) {
      // For demonstration, if no API key is provided, we can return some placeholder data
      return NextResponse.json({
        id: playerId,
        username: 'Unknown (No API Key)',
        level: 0,
        gameStats: {
          totalWinCount: 0,
          totalLoseCount: 0,
          totalPlayTimeInMinutes: 0
        }
      }, { status: 200 });
    }

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(playerId);
    const apiUrl = isUUID
      ? `https://api.wolvesville.com/players/${playerId}`
      : `https://api.wolvesville.com/players/search?username=${encodeURIComponent(playerId)}`;

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bot ${apiKey}`,
        'Content-Type': 'application/json'
      },
      next: { revalidate: 3600 } // cache for 1 hour to prevent rate limiting
    });

    if (response.status === 403 || response.status === 401) {
      // Profile is likely private or hidden
      return NextResponse.json({
        id: playerId,
        username: 'Private Player',
        level: 0,
        isPrivate: true,
        gameStats: null
      }, { status: 200 });
    }

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `Wolvesville API Error: ${response.status} ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ ...data, isPrivate: false }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
