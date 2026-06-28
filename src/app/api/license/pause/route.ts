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

    if (license.is_paused) {
      return NextResponse.json({ error: 'License is already paused' }, { status: 400 });
    }

    if (!license.expires_at || license.expires_at < new Date()) {
      return NextResponse.json({ error: 'License has already expired' }, { status: 400 });
    }

    // Deduct 1 day as fee
    const oneDayInMs = 24 * 60 * 60 * 1000;
    const newExpiresAt = new Date(license.expires_at.getTime() - oneDayInMs);
    
    if (newExpiresAt < new Date()) {
      return NextResponse.json({ error: 'Not enough duration left to pause (requires 1 day fee)' }, { status: 400 });
    }

    license.expires_at = newExpiresAt;
    license.is_paused = true;
    license.paused_at = new Date();
    license.status = 'paused';
    
    await license.save();

    return NextResponse.json({ 
      message: 'License paused successfully (1 day fee applied)', 
      expires_at: license.expires_at,
      is_paused: true
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
