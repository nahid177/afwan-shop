// src/app/api/login/route.ts
import { NextResponse } from 'next/server';
import User from '@/models/User';
import dbConnect from '@/lib/dbConnect';

export async function POST(req: Request) {
  await dbConnect();

  try {
    // Parse the request body
    const { username } = await req.json();

    // Validate input
    if (!username || typeof username !== 'string') {
      return NextResponse.json({ message: 'Invalid username' }, { status: 400 });
    }

    // Check if the user exists
    const user = await User.findOne({ username });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // User found, return success response with userId and username
    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user._id, // Use _id from MongoDB as userId
        username: user.username,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
