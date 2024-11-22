// src/app/api/storeOrders/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import StoreOrder from '@/models/StoreOrder';
import mongoose from 'mongoose';

interface Params {
  id: string;
}

// GET: Retrieve a specific store order by ID
export async function GET(request: NextRequest, { params }: { params: Params }) {
  const { id } = params;

  // Validate the order ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { message: 'Invalid order ID.' },
      { status: 400 }
    );
  }

  try {
    await dbConnect();

    const storeOrder = await StoreOrder.findById(id)
      .populate('products.product', 'name price')
      .select('-__v');

    if (!storeOrder) {
      return NextResponse.json(
        { message: 'Store order not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(storeOrder, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching store order:', error);
    return NextResponse.json(
      { message: 'Error fetching store order.' },
      { status: 500 }
    );
  }
}

// PATCH: Update the status of a specific store order
export async function PATCH(request: NextRequest, { params }: { params: Params }) {
  const { id } = params;

  // Validate the order ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { message: 'Invalid order ID.' },
      { status: 400 }
    );
  }

  try {
    await dbConnect();

    const { status } = await request.json();

    // Validate the new status
    const validStatuses = ['Pending', 'Approved'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { message: `Invalid status. Valid statuses are: ${validStatuses.join(', ')}.` },
        { status: 400 }
      );
    }

    const updatedOrder = await StoreOrder.findByIdAndUpdate(
      id,
      { approved: status === 'Approved', updatedAt: new Date() },
      { new: true }
    ).populate('products.product');

    if (!updatedOrder) {
      return NextResponse.json(
        { message: 'Store order not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error: unknown) {
    console.error('Error updating store order:', error);
    return NextResponse.json(
      { message: 'Error updating store order.' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a specific store order
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  const { id } = params;

  // Validate the order ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { message: 'Invalid order ID.' },
      { status: 400 }
    );
  }

  try {
    await dbConnect();

    const deletedOrder = await StoreOrder.findByIdAndDelete(id);

    if (!deletedOrder) {
      return NextResponse.json(
        { message: 'Store order not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Store order deleted successfully.' },
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
