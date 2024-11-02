// src/app/api/admin/orders/[orderId]/edit/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { Order } from '@/models/Order';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';

interface Params {
  orderId: string;
}

// PATCH /api/admin/orders/[orderId]/edit
export async function PATCH(request: NextRequest, { params }: { params: Params }) {
  const { orderId } = params;

  // Validate orderId
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return NextResponse.json(
      { message: 'Invalid order ID.' },
      { status: 400 }
    );
  }

  try {
    await dbConnect();

    // Parse the request body
    const updatedData = await request.json();

    // Optional: Validate updatedData here (e.g., using a validation library)

    // Find and update the order
    const updatedOrder = await Order.findByIdAndUpdate(orderId, updatedData, { new: true }).populate('items.product');

    if (!updatedOrder) {
      return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }

    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error: unknown) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error instanceof Error ? error.message : 'Unknown Error' },
      { status: 500 }
    );
  }
}
