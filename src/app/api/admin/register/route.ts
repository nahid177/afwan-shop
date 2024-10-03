import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import AdminUser from '@/models/AdminUser'; // Import the Admin User schema
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Connect to the database
dbConnect();

// Secret key for JWT (should be stored in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Handle POST request for admin registration
export async function POST(req: Request) {
  try {
    const { username, password, deviceId } = await req.json();

    // Validate input
    if (!username || !password || !deviceId) {
      return NextResponse.json({ message: 'Username, password, and device ID are required' }, { status: 400 });
    }

    // Check how many admin users are already registered
    const registeredAdmins = await AdminUser.countDocuments();
    if (registeredAdmins >= 2) {
      return NextResponse.json({ message: 'Registration limit reached. Only 2 admin users allowed.' }, { status: 403 });
    }

    // Check if the username is already taken
    const existingUser = await AdminUser.findOne({ username });
    if (existingUser) {
      return NextResponse.json({ message: 'Username is already taken' }, { status: 409 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new admin user and register the first device
    const newAdminUser = new AdminUser({
      username,
      password: hashedPassword, // Store the hashed password
      devices: [deviceId], // Register the first device
    });

    // Save the new admin user to the database
    await newAdminUser.save();

    // Generate JWT token
    const token = jwt.sign({ userId: newAdminUser._id, deviceId }, JWT_SECRET, { expiresIn: '1h' });

    return NextResponse.json({ message: 'Registration successful', token }, { status: 201 });
  } catch (error) {
    console.error('Error during registration:', error);
    return NextResponse.json({ message: 'Error during registration' }, { status: 500 });
  }
}
