import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-lupophobia-key';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);

    await dbConnect();
    const user = await User.findById(decoded.id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const LicenseKey = (await import('@/models/LicenseKey')).default;
    const licenses = await LicenseKey.find({ user_id: user._id, status: { $in: ['active', 'paused'] } });
    
    const accounts = user.accounts.map((acc: any) => {
      const accLicense = licenses.find(l => l.target_username === acc.wolvesville_username);
      let license_active = false;
      let license_expires_at = null;
      let is_paused = false;
      
      if (accLicense && accLicense.expires_at && accLicense.expires_at > new Date()) {
        license_active = true;
        license_expires_at = accLicense.expires_at;
        is_paused = accLicense.is_paused || false;
      }
      
      return {
        wolvesville_username: acc.wolvesville_username,
        wolvesville_id: acc.wolvesville_id,
        license_active,
        license_expires_at,
        is_paused,
        paused_at: accLicense ? accLicense.paused_at : null
      };
    });

    return NextResponse.json({ 
      user: { 
        id: user._id, 
        email: user.email, 
        wolvesville_username: user.wolvesville_username, // primary
        pending_link: user.pending_link,
        accounts
      } 
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
