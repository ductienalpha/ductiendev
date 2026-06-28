import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.WOLVESVILLE_API_KEY || 'e1VZzBamZLRrnOSzFZ2uW5tdyjmUbkbIQJZpMSdoTw7X12PgwkfIxr9RDS86UVlL';
    
    const response = await fetch('https://api.wolvesville.com/leaderboards/ranked', {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bot ${apiKey}`,
        'Content-Type': 'application/json'
      },
      next: { revalidate: 300 } // cache for 5 minutes
    });
    
    if (!response.ok) {
      console.error('Wolvesville API Error:', response.status);
      return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
