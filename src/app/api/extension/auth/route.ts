import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import LicenseKey from '@/models/LicenseKey';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // If token is provided, verify it
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        return NextResponse.json({ state: 'authorized', success: true, user: decoded }, { status: 200 });
      } catch (e) {
        return NextResponse.json({ state: 'unauthorized', PASS_REQUIRED: true, error: 'Invalid token' }, { status: 401 });
      }
    }

    // body: { id, nickname, v }
    const body = await req.json();
    const { id, nickname } = body;

    await dbConnect();

    const searchName = nickname || id; // Fallback to id just in case

    // Tìm tài khoản theo wolvesville_username (nickname)
    const user = await User.findOne({
      wolvesville_username: new RegExp(`^${searchName}$`, 'i')
    });

    if (!user) {
      // User chưa đăng ký tài khoản hoặc nhập sai username -> Not Authorized
      return NextResponse.json({ 
        state: "unauthorized", 
        PASS_REQUIRED: false,
        error: "Your license is inactive. The bot is disabled until a valid license is present."
      }, { status: 401 });
    }

    if (!user.is_linked) {
      // Đã nhập user trên dashboard nhưng chưa verify 6 số -> Not Authorized
      return NextResponse.json({ 
        state: "unauthorized", 
        PASS_REQUIRED: false,
        error: "Your license is inactive. The bot is disabled until a valid license is present."
      }, { status: 401 });
    }

    // Đã liên kết, bây giờ kiểm tra LicenseKey xem có cái nào active không
    const activeLicense = await LicenseKey.findOne({
      user_id: user._id,
      status: 'active',
      expires_at: { $gt: new Date() } // Còn hạn
    });

    if (!activeLicense) {
      // Hết hạn hoặc chưa kích hoạt key
      return NextResponse.json({ 
        state: "unauthorized", 
        PASS_REQUIRED: false,
        error: "Your license is inactive. The bot is disabled until a valid license is present."
      }, { status: 401 });
    }

    // Đã liên kết -> Yêu cầu Password
    return NextResponse.json({ 
      state: "PASS_REQUIRED", 
      PASS_REQUIRED: true,
      expires: activeLicense.expires_at.toISOString(),
      message: "Please enter your password"
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
