// src/app/api/admin/messages/sent-count/route.ts

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Message from '@/models/Message';
import { verifyToken } from '@/lib/auth';

export async function GET(req: Request) {
  await dbConnect();

  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 403 });
    }

    // Aggregation pipeline to count messages with status "sent" and sender "Admin"
    const result = await Message.aggregate([
      {
        $match: { status: 'sent', sender: 'Admin' },
      },
      {
        $count: 'sentCount',
      },
    ]);

    const sentCount = result[0]?.sentCount || 0;

    return NextResponse.json({ sentCount }, { status: 200 });
  } catch (error) {
    console.error('Error fetching total sent messages count:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
