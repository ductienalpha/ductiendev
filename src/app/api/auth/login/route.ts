import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-lupophobia-key';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const LicenseKey = (await import('@/models/LicenseKey')).default;
    const userLicense = await LicenseKey.findOne({ user_id: user._id, status: 'active' });
    let license_active = false;
    let license_expires_at = null;
    if (userLicense && userLicense.expires_at && userLicense.expires_at > new Date()) {
      license_active = true;
      license_expires_at = userLicense.expires_at;
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, wolvesville_username: user.wolvesville_username },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return NextResponse.json({ 
      message: 'Login successful', 
      token, 
      user: { 
        id: user._id, 
        email: user.email, 
        wolvesville_username: user.wolvesville_username,
        accounts: user.accounts,
        pending_link: user.pending_link,
        license_active,
        license_expires_at
      } 
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
