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

// PATCH: Update a specific store order by _id
export async function PATCH(
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

    const data = await request.json();

    // Update the order
    const updatedOrder = await StoreOrder.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!updatedOrder) {
      return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }

    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error: unknown) {
    console.error('Error updating store order:', error);

    // If error is a Mongoose ValidationError, extract the message
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Error updating store order.' },
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

    // Find and delete the order
    const deletedOrder = await StoreOrder.findByIdAndDelete(id);

    if (!deletedOrder) {
      return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Order deleted successfully.' },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error deleting store order:', error);
    return NextResponse.json(
      { message: 'Error deleting store order.' },
      { status: 500 }
    );
  }
}
