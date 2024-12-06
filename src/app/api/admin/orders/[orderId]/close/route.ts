// src/app/api/admin/orders/[orderId]/close.ts

import { NextResponse } from 'next/server';
import { Order } from '@/models/Order';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';

export async function PATCH(request: Request, { params }: { params: { orderId: string } }) {
  try {
    await dbConnect();

    const { orderId } = params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json({ message: 'Invalid order ID.' }, { status: 400 });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }

    if (order.status === 'close') {
      return NextResponse.json({ message: 'Order is already closed.' }, { status: 400 });
    }

    if (!order.approved) {
      return NextResponse.json({ message: 'Order must be approved before closing.' }, { status: 400 });
    }

    order.status = 'close';
    await order.save();

    return NextResponse.json({ message: 'Order closed successfully.' }, { status: 200 });

  } catch (error: unknown) {
    console.error('Error closing order:', error);

    let errorMessage = 'Internal Server Error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
}
