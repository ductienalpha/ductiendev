import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import LicenseKey from '@/models/LicenseKey';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, nickname, password } = body;

    await dbConnect();

    const searchName = nickname || id; // Fallback to id just in case

    // We do a case-insensitive search just in case
    const user = await User.findOne({
      wolvesville_username: new RegExp(`^${searchName}$`, 'i')
    });

    if (!user) {
      return NextResponse.json({ error: 'Tài khoản Wolvesville này chưa được liên kết trên Web Dashboard! Vui lòng truy cập Web để liên kết.' }, { status: 404 });
    }

    if (!user.is_linked) {
      return NextResponse.json({ error: 'Tài khoản chưa được xác minh mã 6 số! Vui lòng truy cập Web.' }, { status: 403 });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Sai mật khẩu' }, { status: 401 });
    }

    // Generate token for the extension
    const token = jwt.sign(
      { id: user._id, email: user.email, wolvesville_username: user.wolvesville_username },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '30d' }
    );

    const activeLicense = await LicenseKey.findOne({
      user_id: user._id,
      status: 'active',
      expires_at: { $gt: new Date() }
    });

    // Return token to extension
    return NextResponse.json({ state: 'authorized', token, success: true, expires: activeLicense ? activeLicense.expires_at.toISOString() : '' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ state: 'unauthorized', error: error.message }, { status: 500 });
  }
}
