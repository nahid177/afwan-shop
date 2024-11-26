// src/app/api/products/total-sold/route.ts

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Order } from '@/models/Order';
import StoreOrder from '@/models/StoreOrder';

export async function GET() {
  try {
    await dbConnect();

    // Sum up the quantities from Orders with status 'open'
    const orderResult = await Order.aggregate([
      { $match: { status: 'open' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: null,
          totalSold: { $sum: '$items.quantity' },
        },
      },
    ]);

    const totalOrderSold = orderResult.length > 0 ? orderResult[0].totalSold : 0;

    // Sum up the quantities from StoreOrders with status 'open'
    const storeOrderResult = await StoreOrder.aggregate([
      { $match: { status: 'open' } },
      { $unwind: '$products' },
      {
        $group: {
          _id: null,
          totalSold: { $sum: '$products.quantity' },
        },
      },
    ]);

    const totalStoreOrderSold = storeOrderResult.length > 0 ? storeOrderResult[0].totalSold : 0;

    const totalSold = totalOrderSold + totalStoreOrderSold;

    return NextResponse.json(totalSold, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching total products sold:', error);
    return NextResponse.json(
      { message: 'Error fetching total products sold' },
      { status: 500 }
    );
  }
}
