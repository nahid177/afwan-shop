import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import CustomerReview from '@/models/CustomerReview'; // Import the Customer Review schema

// Connect to the database
dbConnect();

// Handle POST request for creating customer reviews
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user, reviewText, imageUrl, isActive } = body;

    // Validate required fields
    if (!user || !reviewText || !imageUrl) {
      return NextResponse.json({ message: 'User, review text, and image URL are required' }, { status: 400 });
    }

    // Create a new customer review
    const newReview = new CustomerReview({
      user,
      reviewText,
      imageUrl,
      isActive: isActive !== undefined ? isActive : true, // Default to true if not provided
    });

    // Save the review to the database
    await newReview.save();

    return NextResponse.json({ message: 'Review created successfully', review: newReview }, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ message: 'Error creating review' }, { status: 500 });
  }
}
