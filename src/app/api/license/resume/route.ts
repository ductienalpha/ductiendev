import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LicenseKey from '@/models/LicenseKey';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-lupophobia-key';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);

    const { target_username } = await req.json();

    if (!target_username) {
      return NextResponse.json({ error: 'Target username is required' }, { status: 400 });
    }

    await dbConnect();
    
    // Find the specific license
    const license = await LicenseKey.findOne({ user_id: decoded.id, target_username, status: { $in: ['active', 'paused'] } });
    
    if (!license) {
      return NextResponse.json({ error: 'License not found for this account' }, { status: 404 });
    }

    if (!license.is_paused || !license.paused_at) {
      return NextResponse.json({ error: 'License is not paused' }, { status: 400 });
    }

    // Calculate how long it was paused
    const pausedDurationMs = Date.now() - license.paused_at.getTime();
    
    // Add that duration back to the expires_at
    const newExpiresAt = new Date(license.expires_at.getTime() + pausedDurationMs);

    license.expires_at = newExpiresAt;
    license.is_paused = false;
    license.paused_at = null;
    license.status = 'active';
    
    await license.save();

    return NextResponse.json({ 
      message: 'License resumed successfully', 
      expires_at: license.expires_at,
      is_paused: false
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
