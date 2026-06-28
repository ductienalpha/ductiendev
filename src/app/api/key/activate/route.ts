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

    const { key } = await req.json();

    if (!key) {
      return NextResponse.json({ error: 'License key is required' }, { status: 400 });
    }

    await dbConnect();
    
    // Find the key
    const license = await LicenseKey.findOne({ key });
    
    if (!license) {
      return NextResponse.json({ error: 'Invalid license key' }, { status: 404 });
    }

    if (license.status !== 'unclaimed') {
      return NextResponse.json({ error: 'This key has already been used or is invalid' }, { status: 400 });
    }

    const User = (await import('@/models/User')).default;
    const user = await User.findById(decoded.id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (license.target_username && user.wolvesville_username !== license.target_username) {
      return NextResponse.json({ error: `This key is locked to the Wolvesville account: ${license.target_username}` }, { status: 403 });
    }

    // Activate the key
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + license.duration_days);

    license.user_id = decoded.id;
    license.status = 'active';
    license.expires_at = expiryDate;
    
    await license.save();

    // Fetch all licenses to build accounts mapping
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
        is_paused
      };
    });

    return NextResponse.json({ 
      message: 'Key activated successfully', 
      expires_at: license.expires_at,
      user: {
        id: user._id, 
        email: user.email, 
        wolvesville_username: user.wolvesville_username,
        pending_link: user.pending_link,
        accounts
      }
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
