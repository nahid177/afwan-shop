// src/app/api/admin/messages/[userId]/route.ts

import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Message from '@/models/Message';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

// Define the structure of a single chat message
interface ChatMessage {
  id: string;
  sender: 'Admin' | 'User';
  userId: string;
  message?: string; // Made optional
  imageUrl?: string;
  status: 'sent' | 'seen';
  time: string;
}

// Define the structure of the API response
interface ApiGetMessagesResponse {
  messages: ChatMessage[];
  username: string;
}

// Define a separate interface for lean user objects
interface IUserLean {
  username: string;
  // Add other necessary fields if required
}

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  await dbConnect();

  // Correctly await the entire params object before accessing userId
  const { userId } = await params;

  try {
    // Extract and verify the token
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 403 });
    }

    // Fetch the user's information using the lean method with IUserLean interface
    const user = await User.findById(userId).lean<IUserLean>();
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Mark user-sent messages as 'seen'
    await Message.updateMany(
      { userId, sender: 'User', status: 'sent' },
      { $set: { status: 'seen' } }
    );

    // Fetch messages for the specified user
    const messages = await Message.find({ userId }).sort({ createdAt: 1 }).lean();

    // Format messages
    const formattedMessages: ChatMessage[] = messages.map((msg) => ({
      id: msg._id!.toString(),
      sender: msg.sender as 'Admin' | 'User', // Ensure correct typing
      userId: msg.userId.toString(), // Ensure userId is string
      message: msg.message || "", // Ensure message is string
      imageUrl: msg.imageUrl,
      status: msg.status as 'sent' | 'seen',
      time: msg.createdAt.toLocaleString(),
    }));

    const response: ApiGetMessagesResponse = {
      messages: formattedMessages,
      username: user.username,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching messages for user:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
