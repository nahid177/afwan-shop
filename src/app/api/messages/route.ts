// src/app/api/messages/route.ts

import { NextResponse } from "next/server";
import Message from "@/models/Message";
import dbConnect from "@/lib/dbConnect";

// Handler for fetching messages for a specific user
export async function GET(req: Request) {
  await dbConnect();

  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      console.error("GET /api/messages - Missing userId");
      return NextResponse.json({ message: "Missing userId" }, { status: 400 });
    }

    // Update status only for admin-sent messages
    await Message.updateMany(
      { userId, sender: 'Admin', status: "sent" },
      { $set: { status: "seen" } }
    );

    // Fetch updated messages for the specific user, sorted by creation time
    const updatedMessages = await Message.find({ userId }).sort({ createdAt: 1 });

    const formattedMessages = updatedMessages.map((msg) => ({
      id: msg._id.toString(),
      sender: msg.sender, // 'User' or 'Admin'
      senderName: msg.senderName, // Optional: Actual name
      userId: msg.userId,
      message: msg.message,
      imageUrl: msg.imageUrl, // Include imageUrl
      status: msg.status,
      time: msg.createdAt.toLocaleString(),
    }));

    console.log(`GET /api/messages - Fetched ${formattedMessages.length} messages for userId: ${userId}`);

    return NextResponse.json(formattedMessages, { status: 200 });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// Handler for saving a new message

// Handler for saving a new message
export async function POST(req: Request) {
  await dbConnect();

  try {
    const { sender, senderName, userId, message, imageUrl, status } = await req.json();

    console.log("Received POST /api/messages data:", { sender, senderName, userId, message, imageUrl, status });

    // Validate the input data
    if (
      !sender ||
      !userId ||
      (!imageUrl && (!message || message.trim() === ""))
    ) {
      console.error("POST /api/messages - Validation Failed: Missing required fields.");
      return NextResponse.json(
        { message: "Invalid data. 'sender', 'userId', and either 'message' or 'imageUrl' are required." },
        { status: 400 }
      );
    }

    // Validate 'sender' value
    if (!["User", "Admin"].includes(sender)) {
      console.error("POST /api/messages - Validation Failed: 'sender' must be 'User' or 'Admin'.");
      return NextResponse.json(
        { message: "'sender' must be either 'User' or 'Admin'." },
        { status: 400 }
      );
    }

    // Create a new message with status 'sent' by default if not provided
    const newMessage = await Message.create({
      sender,
      senderName, // Optional
      userId,
      message: message || undefined, // Set to undefined if empty
      imageUrl, // Include imageUrl if provided
      status: status || "sent",
    });

    console.log("POST /api/messages - Message created successfully:", newMessage);

    return NextResponse.json(
      {
        id: newMessage._id.toString(),
        sender: newMessage.sender,
        senderName: newMessage.senderName, // Optional
        userId: newMessage.userId,
        message: newMessage.message,
        imageUrl: newMessage.imageUrl, // Return imageUrl
        status: newMessage.status,
        createdAt: newMessage.createdAt, // For frontend formatting
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/messages - Error saving message:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}