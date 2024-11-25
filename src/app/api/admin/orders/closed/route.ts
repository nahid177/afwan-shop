// src/app/api/admin/orders/closed/route.ts

import { NextResponse } from 'next/server';
import { Order } from '@/models/Order';
import dbConnect from '@/lib/dbConnect';

export async function GET() {
  try {
    await dbConnect();

    const orders = await Order.find({ status: 'close' })
      .sort({ createdAt: -1 })
      .lean(); // Use .lean() to get plain JavaScript objects

    return NextResponse.json(orders, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching closed orders:', error);
    return NextResponse.json(
      { message: 'Error fetching closed orders.' },
      { status: 500 }
    );
  }
}
