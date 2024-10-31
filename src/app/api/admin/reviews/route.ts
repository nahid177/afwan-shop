// src/app/api/admin/reviews/route.ts

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import CustomerReview from '@/models/CustomerReview';

// Connect to the database
dbConnect();

// Handle GET request to fetch all reviews (admin)
export async function GET() {
  try {
    const reviews = await CustomerReview.find();
    return NextResponse.json({ reviews }, { status: 200 });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ message: 'Error fetching reviews' }, { status: 500 });
  }
}

// Handle PUT request to update a review (admin)
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, user, reviewText, imageUrl, isActive, approved } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json({ message: 'Review ID is required' }, { status: 400 });
    }

    // Update the review
    const updatedReview = await CustomerReview.findByIdAndUpdate(
      id,
      { user, reviewText, imageUrl, isActive, approved },
      { new: true }
    );

    if (!updatedReview) {
      return NextResponse.json({ message: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Review updated successfully', review: updatedReview },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json({ message: 'Error updating review' }, { status: 500 });
  }
}

// Handle DELETE request to delete a review (admin)
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ message: 'Review ID is required' }, { status: 400 });
    }

    const deletedReview = await CustomerReview.findByIdAndDelete(id);

    if (!deletedReview) {
      return NextResponse.json({ message: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Review deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ message: 'Error deleting review' }, { status: 500 });
  }
}
