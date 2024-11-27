import dbConnect from "@/lib/dbConnect";
import Carousel from "@/models/Carousel";
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

    // Create a new carousel entry using the Carousel model
    const newCarousel = new Carousel({
      name,
      imageUrl,
      link: link || '', // Optional link
    });

    // Save the new carousel item to the database
    await newCarousel.save();

    // Return a success response
    return NextResponse.json(
      { message: 'Carousel item created successfully', data: newCarousel },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating carousel item:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}
