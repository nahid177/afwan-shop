// src/app/api/reviews/route.ts

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import CustomerReview from '@/models/CustomerReview';

// Connect to the database
dbConnect();

// Handle GET request to fetch approved reviews
export async function GET() {
  try {
    const reviews = await CustomerReview.find({ approved: true, isActive: true });
    return NextResponse.json({ reviews }, { status: 200 });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ message: 'Error fetching reviews' }, { status: 500 });
  }
}

// Handle POST request for creating customer reviews
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user, reviewText, imageUrl } = body;

    // Validate required fields
    if (!user || !reviewText || !imageUrl) {
      return NextResponse.json(
        { message: 'User, review text, and image URL are required' },
        { status: 400 }
      );
    }

    // Create a new customer review
    const newReview = new CustomerReview({
      user,
      reviewText,
      imageUrl,
      isActive: true,
      approved: false, // New reviews are not approved by default
    });

    // Save the review to the database
    await newReview.save();

    return NextResponse.json(
      { message: 'Review submitted successfully', review: newReview },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ message: 'Error creating review' }, { status: 500 });
  }
}
