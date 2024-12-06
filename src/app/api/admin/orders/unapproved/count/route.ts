import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Order } from '@/models/Order';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  console.log('Received GET request at /api/admin/orders/unapproved/count');

  try {
    // Authenticate the request
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];

    // Check if the token is available
    if (!token) {
      console.warn('Token is missing.');
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      console.warn('Unauthorized access attempt.');
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to the database
    await dbConnect();
    console.log('Database connected.');

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
