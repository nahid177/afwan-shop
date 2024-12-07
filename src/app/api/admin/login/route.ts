import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import AdminUser from '@/models/AdminUser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Connect to the database
dbConnect();

// Secret key for JWT (should be stored in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Handle POST request for admin login
export async function POST(req: Request) {
  try {
    const { username, password, deviceId } = await req.json();

    // Validate input
    if (!username || !password || !deviceId) {
      return NextResponse.json({ message: 'Username, password, and device ID are required' }, { status: 400 });
    }

    // Find the user by username
    const adminUser = await AdminUser.findOne({ username });
    if (!adminUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Check if the password is correct
    const isPasswordCorrect = await bcrypt.compare(password, adminUser.password);
    if (!isPasswordCorrect) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Check if the device is already registered
    if (adminUser.devices.includes(deviceId)) {
      // Device is already registered, generate JWT
      const token = jwt.sign({ userId: adminUser._id, deviceId }, JWT_SECRET, { expiresIn: '1h' });
      return NextResponse.json({ message: 'Login successful', token }, { status: 200 });
    }

    // If there are already 2 devices registered, deny access
    if (adminUser.devices.length >= 2) {
      return NextResponse.json({ message: 'Maximum devices reached. Cannot log in from this device.' }, { status: 403 });
    }

    // Register the new device
    adminUser.devices.push(deviceId);
    await adminUser.save();

    // Generate JWT
    const token = jwt.sign({ userId: adminUser._id, deviceId }, JWT_SECRET, { expiresIn: '1h' });
    return NextResponse.json({ message: 'Login successful (new device registered)', token }, { status: 200 });
  } catch (error) {
    console.error('Error logging in admin:', error);
    return NextResponse.json({ message: 'Error logging in admin' }, { status: 500 });
  }
}
