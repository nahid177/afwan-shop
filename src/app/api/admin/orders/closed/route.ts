// src/app/api/admin/orders/closed/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { Order } from '@/models/Order';
import dbConnect from '@/lib/dbConnect';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Extract the 'year' query parameter from the request URL
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year');

    // Default to the current year if no 'year' parameter is provided
    let year = new Date().getFullYear();

    // Validate and parse the 'year' parameter
    if (yearParam) {
      const parsedYear = parseInt(yearParam, 10);
      if (!isNaN(parsedYear)) {
        year = parsedYear;
      }
    }

    // Define the start and end dates for the specified year
    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

    // Fetch closed orders within the specified year
    const orders = await Order.find({
      status: 'close',
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(orders, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching closed orders:', error);
    return NextResponse.json(
      { message: 'Error fetching closed orders.' },
      { status: 500 }
    );
  }
}
