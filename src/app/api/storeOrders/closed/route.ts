// src/app/api/storeOrders/closed/route.ts

import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import StoreOrder from '@/models/StoreOrder';

export const dynamic = 'force-dynamic'; // Mark the route as dynamic

export async function GET(request: NextRequest) {
  await dbConnect();

  try {
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

    // Fetch closed store orders within the specified year
    const storeOrders = await StoreOrder.find({
      status: 'closed',
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .select('-__v')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(storeOrders, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching closed store orders:', error);
    return NextResponse.json(
      { message: 'Error fetching closed store orders.' },
      { status: 500 }
    );
  }
}
