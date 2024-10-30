// src/app/api/orders/[orderId]/route.ts

import { NextResponse } from 'next/server';
import { Order } from '@/models/Order';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';

export async function GET(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return NextResponse.json(
      { message: 'Invalid order ID.' },
      { status: 400 }
    );
  }

  try {
    await dbConnect(); // Ensure database connection

    const order = await Order.findById(orderId).populate('items.product').exec();

    if (!order) {
      return NextResponse.json(
        { message: 'Order not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
