// src/app/api/storeOrders/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import StoreOrder from '@/models/StoreOrder';
import mongoose from 'mongoose';

// GET: Retrieve a specific store order by _id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // Validate the order ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid order ID.' }, { status: 400 });
  }

  try {
    await dbConnect();

    // Find the order by ID
    const order = await StoreOrder.findById(id).select('-__v');

    if (!order) {
      return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching store order:', error);
    return NextResponse.json(
      { message: 'Error fetching store order.' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a specific store order by _id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // Validate the order ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid order ID.' }, { status: 400 });
  }

  try {
    await dbConnect();

    // Find the order by ID
    const order = await StoreOrder.findById(id);

    if (!order) {
      return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }

    // Delete the order
    await StoreOrder.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Order deleted successfully.' }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error deleting store order:', error);
    return NextResponse.json(
      { message: 'Error deleting store order.' },
      { status: 500 }
    );
  }
}
