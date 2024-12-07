import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import AdminUser from '@/models/AdminUser';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { deviceId } = await req.json();

    if (!deviceId) {
      return NextResponse.json({ message: 'Device ID is required' }, { status: 400 });
    }

    // Remove deviceId from user
    const result = await AdminUser.updateOne(
      { devices: deviceId },
      { $pull: { devices: deviceId } }
    );

    const response = NextResponse.json({ message: 'Logout successful, device removed' }, { status: 200 });

    // Clear the token cookie
    response.cookies.set('token', '', { path: '/', maxAge: 0 });

    if (result.modifiedCount === 0) {
      return NextResponse.json({ message: 'Device not found or already removed' }, { status: 404 });
    }

    return response;
  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json({ message: 'Error during logout' }, { status: 500 });
  }
}
