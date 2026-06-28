import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LicenseKey from '@/models/LicenseKey';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-lupophobia-key';

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

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await checkAdmin(req);
    
    const { id } = params;
    await LicenseKey.findByIdAndDelete(id);
    
    return NextResponse.json({ message: 'Key deleted successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === 'Forbidden' ? 403 : 401 });
  }
}
