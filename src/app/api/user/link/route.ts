import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
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

    const { wolvesville_username } = await req.json();

    if (!wolvesville_username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findById(decoded.id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const existingLink = await User.findOne({ 'accounts.wolvesville_username': wolvesville_username });
    if (existingLink) {
      if (existingLink._id.toString() === user._id.toString()) {
        return NextResponse.json({ error: 'You have already linked this account.' }, { status: 400 });
      } else {
        return NextResponse.json({ error: 'This account is already linked to another user.' }, { status: 400 });
      }
    }

    const LicenseKey = (await import('@/models/LicenseKey')).default;
    
    // Check if there is an existing license key targeting this username
    const existingKey = await LicenseKey.findOne({ target_username: wolvesville_username });
    
    if (!existingKey) {
      return NextResponse.json({ error: 'No license key found for this Wolvesville account. Please register a license in OP Panel first.' }, { status: 403 });
    }

    // Generate random 6-digit hex code similar to the screenshot "4FA168"
    const code = Math.floor(Math.random() * 16777215).toString(16).toUpperCase().padStart(6, '0');

    user.pending_link = {
      wolvesville_username: wolvesville_username,
      verify_code: code
    };
    await user.save();

    return NextResponse.json({ 
      message: 'Code generated', 
      code: code, 
      user: { 
        id: user._id, 
        email: user.email, 
        accounts: user.accounts,
        pending_link: user.pending_link
      } 
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
