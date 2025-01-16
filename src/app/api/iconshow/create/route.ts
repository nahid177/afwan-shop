import dbConnect from "@/lib/dbConnect";
import Iconshow from "@/models/Iconshow";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();

    // Parse the request body
    const { name, imageUrl, link } = await req.json();

    // Log the request body for debugging
    console.log('Received request data:', { name, imageUrl, link });

    // Validation
    if (!name || !imageUrl) {
      return NextResponse.json(
        { message: 'Name and Image URL are required' },
        { status: 400 }
      );
    }

    // Create a new Iconshow entry using the Iconshow model
    const newIconshow = new Iconshow({
      name,
      imageUrl,
      link: link || '', // Optional link
    });

    // Save the new Iconshow item to the database
    await newIconshow.save();

    // Return a success response
    return NextResponse.json(
      { message: 'Iconshow item created successfully', data: newIconshow },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating Iconshow item:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}
