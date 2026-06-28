import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');

    await dbConnect();
    const user = await User.findById(decoded.id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.pending_link || !user.pending_link.verify_code || !user.pending_link.wolvesville_username) {
      return NextResponse.json({ error: 'No verification code found. Please generate one first.' }, { status: 400 });
    }

    // Call Wolvesville API using the provided API key
    const apiKey = process.env.WOLVESVILLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Wolvesville API key not configured on server' }, { status: 500 });
    }

    const targetUsername = user.pending_link.wolvesville_username;
    const wovRes = await fetch(`https://api.wolvesville.com/players/search?username=${targetUsername}`, {
      headers: {
        'Authorization': `Bot ${apiKey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!wovRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch player profile from Wolvesville' }, { status: 400 });
    }

    const wovData = await wovRes.json();
    
    // Check if the bio / personal message contains the verification code
    const bio = wovData.personalMessage || wovData.bio || wovData.description || '';
    
    if (bio.includes(user.pending_link.verify_code)) {
      // Verified! Add to accounts array
      const existingIdx = user.accounts.findIndex((acc: any) => acc.wolvesville_id === (wovData.id || ''));
      if (existingIdx === -1) {
        user.accounts.push({
          wolvesville_username: targetUsername,
          wolvesville_id: wovData.id || ''
        });
      }
      
      user.pending_link = { wolvesville_username: null, verify_code: null };
      await user.save();
      
      return NextResponse.json({ 
        message: 'Account verified successfully', 
        user: { 
          id: user._id, 
          email: user.email, 
          accounts: user.accounts,
          pending_link: user.pending_link
        } 
      }, { status: 200 });
    } else {
      return NextResponse.json({ error: `Verification code ${user.pending_link.verify_code} not found in player's bio.` }, { status: 400 });
    }

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
