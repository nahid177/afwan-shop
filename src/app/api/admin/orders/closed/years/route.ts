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
  } catch (error: unknown) {
    console.error('Error fetching years for closed orders:', error);

    let errorMessage = 'Error fetching years.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}
