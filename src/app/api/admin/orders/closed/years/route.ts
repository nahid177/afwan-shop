// src/app/api/admin/orders/closed/years/route.ts

import { NextResponse } from 'next/server';
import { Order } from '@/models/Order';
import dbConnect from '@/lib/dbConnect';

export async function GET() {
  try {
    await dbConnect();

    // Fetch distinct years from closed orders
    const years = await Order.aggregate([
      { $match: { status: 'close' } },
      {
        $group: {
          _id: { $year: '$createdAt' },
        },
      },
      { $sort: { '_id': -1 } },
      {
        $project: {
          _id: 0,
          year: '$_id',
        },
      },
    ]);

    const yearList = years.map((item) => item.year);

    return NextResponse.json(yearList, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching years for closed orders:', error);
    return NextResponse.json(
      { message: 'Error fetching years.' },
      { status: 500 }
    );
  }
}
