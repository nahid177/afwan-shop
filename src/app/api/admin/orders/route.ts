// /src/app/api/admin/orders/route.ts

import { NextResponse } from 'next/server';
import { Order, IOrder } from '@/models/Order';
import dbConnect from '@/lib/dbConnect';

export async function POST(request: Request) {
  try {
    await dbConnect();

    const data: IOrder = await request.json();

    const { customerName, customerNumber, address1, items, totalAmount } = data;
    if (!customerName || !customerNumber || !address1 || !items || !totalAmount) {
      return NextResponse.json(
        { message: 'Missing required fields.' },
        { status: 400 }
      );
    }

    const newOrder = new Order({
      customerName,
      customerNumber,
      otherNumber: data.otherNumber,
      address1,
      address2: data.address2,
      items,
      totalAmount,
    });

    await newOrder.save();

    return NextResponse.json(
      { message: 'Order placed successfully!', orderId: newOrder._id },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error placing order:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// GET handler to fetch all orders
export async function GET() {
  try {
    await dbConnect();

    const orders = await Order.find()
      .populate('items.product') // Populate product details if needed
      .sort({ createdAt: -1 })
      .exec();

    return NextResponse.json(orders, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error instanceof Error ? error.message : 'Unknown Error' },
      { status: 500 }
    );
  }
}
