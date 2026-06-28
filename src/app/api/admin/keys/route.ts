import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LicenseKey from '@/models/LicenseKey';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-lupophobia-key';

// Helper to check admin role
async function checkAdmin(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }

  const token = authHeader.split(' ')[1];
  const decoded: any = jwt.verify(token, JWT_SECRET);

  await dbConnect();
  const user = await User.findById(decoded.id);

  if (!user || (user.role !== 'admin' && user.email !== 'playzzen2510@gmail.com')) {
    throw new Error('Forbidden');
  }
  return user;
}

export async function GET(req: Request) {
  try {
    await checkAdmin(req);
    
    // Fetch all keys, populate user info
    const keys = await LicenseKey.find().populate('user_id', 'email wolvesville_username').sort({ createdAt: -1 });
    
    return NextResponse.json({ keys }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === 'Forbidden' ? 403 : 401 });
  }
}

export async function POST(req: Request) {
  try {
    await checkAdmin(req);
    
    const { amount, duration_days, target_username } = await req.json();
    
    if (!amount || amount < 1 || !duration_days || duration_days < 1) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const newKeys = [];
    for (let i = 0; i < amount; i++) {
      // Generate a format like LPFB-XXXX-XXXX-XXXX
      const randomPart1 = Math.random().toString(36).substring(2, 6).toUpperCase();
      const randomPart2 = Math.random().toString(36).substring(2, 6).toUpperCase();
      const randomPart3 = Math.random().toString(36).substring(2, 6).toUpperCase();
      const keyString = `LPFB-${randomPart1}-${randomPart2}-${randomPart3}`;

      newKeys.push({
        key: keyString,
        duration_days,
        target_username: target_username || null,
        status: 'unclaimed'
      });
    }

    const createdKeys = await LicenseKey.insertMany(newKeys);

    return NextResponse.json({ message: `${amount} keys generated successfully`, keys: createdKeys }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === 'Forbidden' ? 403 : 401 });
  }
}
