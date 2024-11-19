// src/app/api/admin/messages/send/route.ts

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Message from '@/models/Message';
import { verifyToken } from '@/lib/auth';

// Define the structure of the incoming message data
interface MessageData {
  userId: string;
  message?: string; // Made optional
  imageUrl?: string; // Optional
}

export async function POST(req: Request) {
  await dbConnect();

  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 403 });
    }

    const { userId, message, imageUrl }: MessageData = await req.json();

    // Validate input
    if (!userId || (!message && !imageUrl)) { // imageUrl is optional but at least one must be present
      return NextResponse.json({ message: 'Invalid data. Provide at least a message or an image.' }, { status: 400 });
    }

    // Create a new message from admin with status 'sent'
    const newMessage = await Message.create({
      sender: 'Admin', // Indicate that the sender is admin
      userId,
      message: message || undefined, // Set to undefined if empty
      imageUrl, // Include imageUrl if provided
      status: 'sent', // Set status to 'sent' by default
    });

    return NextResponse.json({
      id: newMessage._id.toString(),
      sender: newMessage.sender,
      userId: newMessage.userId,
      message: newMessage.message,
      imageUrl: newMessage.imageUrl, // Return imageUrl
      status: newMessage.status,
      createdAt: newMessage.createdAt,
    }, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
