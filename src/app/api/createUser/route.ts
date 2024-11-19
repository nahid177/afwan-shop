// src/app/api/createUser/route.ts
import { NextResponse } from 'next/server';
import User from '@/models/User';
import dbConnect from '@/lib/dbConnect';

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { username } = await req.json();

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    const newUser = await User.create({ username });
    return NextResponse.json(
      { message: 'User created successfully', user: { id: newUser.id, username: newUser.username } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create User Error:', error); // Log the error for debugging
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
