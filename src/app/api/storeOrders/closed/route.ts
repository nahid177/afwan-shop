// src/app/api/storeOrders/closed/route.ts

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import StoreOrder from '@/models/StoreOrder';

// GET: Retrieve all store orders with status 'closed'
export async function GET() {
  await dbConnect();

  try {
    // Fetch all store orders where status is 'closed'
    const storeOrders = await StoreOrder.find({ status: 'closed' }).select('-__v');

    return NextResponse.json(storeOrders, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching closed store orders:', error);
    return NextResponse.json(
      { message: 'Error fetching closed store orders.' },
      { status: 500 }
    );
  }
}
