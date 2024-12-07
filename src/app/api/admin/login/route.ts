import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import AdminUser from '@/models/AdminUser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { username, password, deviceId } = await req.json();

    // Validate input
    if (!username || !password || !deviceId) {
      return NextResponse.json({ message: 'Username, password, and device ID are required' }, { status: 400 });
    }

    // Find the user
    const adminUser = await AdminUser.findOne({ username });
    if (!adminUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Check password
    const isPasswordCorrect = await bcrypt.compare(password, adminUser.password);
    if (!isPasswordCorrect) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Check device
    if (adminUser.devices.includes(deviceId)) {
      // Device already registered
      const token = jwt.sign({ userId: adminUser._id, deviceId }, JWT_SECRET, { expiresIn: '1h' });
      const response = NextResponse.json({ message: 'Login successful', token }, { status: 200 });
      response.cookies.set('token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 3600,
      });
      return response;
    }

    // Register new device if allowed
    if (adminUser.devices.length >= 2) {
      return NextResponse.json({ message: 'Maximum devices reached. Cannot log in from this device.' }, { status: 403 });
    }

    adminUser.devices.push(deviceId);
    await adminUser.save();

    const token = jwt.sign({ userId: adminUser._id, deviceId }, JWT_SECRET, { expiresIn: '1h' });
    const response = NextResponse.json({ message: 'Login successful (new device registered)', token }, { status: 200 });
    response.cookies.set('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 3600,
    });
    return response;
  } catch (error) {
    console.error('Error logging in admin:', error);
    return NextResponse.json({ message: 'Error logging in admin' }, { status: 500 });
  }
}
