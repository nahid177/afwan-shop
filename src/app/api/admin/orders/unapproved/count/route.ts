// src/app/api/admin/orders/unapproved/count/route.ts

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Order } from '@/models/Order';
import { jwtVerify } from "jose";

export const dynamic = 'force-dynamic'; // Mark the route as dynamic

export async function GET(req: NextRequest) {
  console.log('Received GET request at /api/admin/orders/unapproved/count');

  try {
    // Authenticate the request by reading the token from cookies
    const token = req.cookies.get('token')?.value;

    if (!token) {
      console.warn('Token is missing.');
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify the JWT token
    const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "yourSuperSecretKeyHere");
    let payload;
    try {
      const { payload: verifiedPayload } = await jwtVerify(token, JWT_SECRET);
      payload = verifiedPayload;
    } catch (error) {
      console.error("Token verification failed:", error);
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // **Utilize the payload** (e.g., log the user ID or enforce authorization)
    console.log(`Authenticated user ID: ${payload.userId}`);

    // Connect to the database
    await dbConnect();
    console.log('Database connected.');

    // Optional: Verify if the user has the necessary permissions
    // For example, check if payload.role === 'admin'

    // Count unapproved orders
    const unapprovedCount = await Order.countDocuments({ approved: false });

    return NextResponse.json(
      { unapprovedOrders: unapprovedCount },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error counting unapproved orders:', error.message);
      return NextResponse.json(
        { message: error.message },
        { status: 500 }
      );
    }

    console.error('Unknown error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
