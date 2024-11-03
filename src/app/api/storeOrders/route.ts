// src/app/api/storeOrders/route.ts

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import StoreOrder from '@/models/StoreOrder';

// GET: Retrieve all store orders
export async function GET() {
  await dbConnect();

  try {
    const storeOrders = await StoreOrder.find().populate('products.product');
    return NextResponse.json(storeOrders, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching store orders:', error);
    return NextResponse.json(
      { message: 'Error fetching store orders.' },
      { status: 500 }
    );
  }
}

// POST: Create a new store order
export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const data = await request.json();

    // Basic Validation
    if (!data.customerName || !data.customerEmail || !data.customerPhone || !data.products || !data.totalAmount) {
      return NextResponse.json(
        { message: 'Missing required fields.' },
        { status: 400 }
      );
    }

    // Further validation can be added here (e.g., using a validation library)

    const newStoreOrder = new StoreOrder(data);
    const savedOrder = await newStoreOrder.save();
    return NextResponse.json(savedOrder, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating store order:', error);
    return NextResponse.json(
      { message: 'Error creating store order.' },
      { status: 500 }
    );
  }
}
