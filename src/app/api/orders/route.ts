// src/app/api/orders/route.ts
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
  } catch (error) {
    console.error('Error placing order:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
