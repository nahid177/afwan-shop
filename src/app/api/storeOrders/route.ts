// src/app/api/storeOrders/route.ts

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import StoreOrder from '@/models/StoreOrder';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid'; // Install uuid: npm install uuid

// GET: Retrieve all store orders with status 'open'
export async function GET() {
  await dbConnect();

  try {
    // Fetch all store orders where status is 'open'
    const storeOrders = await StoreOrder.find({ status: 'open' })
      .select('-__v'); // Exclude __v field if not needed

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
    if (!data.customerName || !data.customerPhone || !data.products || !data.totalAmount) {
      return NextResponse.json(
        { message: 'Missing required fields.' },
        { status: 400 }
      );
    }

    // Validate each product has required fields
    const isValid = data.products.every(
      (product: any) =>
        typeof product.buyingPrice === 'number' &&
        typeof product.offerPrice === 'number' &&
        typeof product.productImage === 'string' &&
        typeof product.productName === 'string'
    );

    if (!isValid) {
      return NextResponse.json(
        { message: 'Each product must have buyingPrice (number), offerPrice (number), productImage (string), and productName (string).' },
        { status: 400 }
      );
    }

    // Generate a unique code
    const uniqueCode = uuidv4(); // Generates a unique UUID

    const newStoreOrder = new StoreOrder({
      ...data,
      code: uniqueCode, // Assign the unique code
      status: 'open', // Ensure the default status is 'open'
    });
    const savedOrder = await newStoreOrder.save();
    return NextResponse.json(savedOrder, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating store order:', error);
    // If error is a Mongoose ValidationError, extract the message
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: 'Error creating store order.' },
      { status: 500 }
    );
  }
}
