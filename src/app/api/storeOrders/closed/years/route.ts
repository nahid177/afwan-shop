// src/app/api/storeOrders/closed/years/route.ts

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import StoreOrder from '@/models/StoreOrder';

export async function GET() {
  try {
    await dbConnect();

    // Fetch distinct years from closed store orders
    const years = await StoreOrder.aggregate([
      { $match: { status: 'closed' } },
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
  } catch (error: unknown) { // Use 'unknown' instead of 'any'
    console.error('Error fetching years for closed store orders:', error);

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
