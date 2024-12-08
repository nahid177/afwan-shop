// src/app/api/login/route.ts
import { NextResponse } from 'next/server';
import User from '@/models/User';
import dbConnect from '@/lib/dbConnect';
import jwt from 'jsonwebtoken'; // Install jsonwebtoken if not already

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Use environment variables for secrets

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

    // Generate a JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '2h' } // Token validity
    );

    // Return the token along with user details
    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user._id, // Use _id from MongoDB as userId
        username: user.username,
      },
      token, // Include the token
    }, { status: 200 });
  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
