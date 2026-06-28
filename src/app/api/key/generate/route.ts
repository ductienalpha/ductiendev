import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LicenseKey from '@/models/LicenseKey';

function generateRandomKey() {
  const parts = [];
  for (let i = 0; i < 4; i++) {
    parts.push(Math.random().toString(36).substring(2, 6).toUpperCase());
  }
  return parts.join('-');
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const adminPass = searchParams.get('admin');
    const days = parseInt(searchParams.get('days') || '36500'); // Mặc định 100 năm (Vĩnh viễn)

    // Đặt mật khẩu admin là 'lupophobia-admin' để chặn người lạ tạo key
    if (adminPass !== 'lupophobia-admin') {
      return NextResponse.json({ error: 'Sai mật khẩu Admin' }, { status: 403 });
    }

    await dbConnect();

    const newKeyStr = generateRandomKey();
    const license = new LicenseKey({
      key: newKeyStr,
      duration_days: days
    });
    
    await license.save();

    return NextResponse.json({ 
      message: '🎉 Tạo Key Thành Công!',
      key: newKeyStr,
      duration: days > 10000 ? 'Vĩnh Viễn (Permanent)' : `${days} ngày`
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
