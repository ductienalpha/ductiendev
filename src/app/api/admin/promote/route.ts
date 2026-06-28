import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    await dbConnect();
    // Find the user and set them as admin
    const result = await User.findOneAndUpdate(
      { email: 'playzzen2510@gmail.com' },
      { role: 'admin' },
      { new: true }
    );
    
    if (result) {
      return NextResponse.json({ message: 'User playzzen2510@gmail.com promoted to admin successfully' }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
