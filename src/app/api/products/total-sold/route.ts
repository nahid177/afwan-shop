// src/app/api/products/total-sold/route.ts

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Order } from '@/models/Order';
import StoreOrder from '@/models/StoreOrder';

export async function GET() {
  try {
    await dbConnect();

    // Aggregate total sold from Orders with status 'open' and approved: true
    const orderResult = await Order.aggregate([
      { $match: { status: 'open', approved: true } },
      { $unwind: '$items' },
      {
        $group: {
          _id: null,
          totalSold: { $sum: '$items.quantity' },
        },
      },
    ]);

    const totalOrderSold = orderResult.length > 0 ? orderResult[0].totalSold : 0;

    // Aggregate total sold from StoreOrders with status 'open' and approved: true
    const storeOrderResult = await StoreOrder.aggregate([
      { $match: { status: 'open', approved: true } },
      { $unwind: '$products' },
      {
        $group: {
          _id: null,
          totalSold: { $sum: '$products.quantity' },
        },
      },
    ]);

    const totalStoreOrderSold = storeOrderResult.length > 0 ? storeOrderResult[0].totalSold : 0;

    // Calculate the combined total sold
    const totalSold = totalOrderSold + totalStoreOrderSold;

    return NextResponse.json({ totalSold }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching total products sold:', error);

    let message = 'Error fetching total products sold';
    if (error instanceof Error) {
      message = error.message;
    }

    return NextResponse.json(
      { message },
      { status: 500 }
    );
  }
}
