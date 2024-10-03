import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import OfferEntry from '@/models/OfferEntry'; // Import the Offer Entry schema

// Connect to the database
dbConnect();

// Handle POST request for creating offer entries
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, name, endTime, isActive } = body;

    // Validate required fields
    if (!title || !name || !endTime) {
      return NextResponse.json({ message: 'Title, name, and end time are required' }, { status: 400 });
    }

    // Create a new offer entry
    const newOfferEntry = new OfferEntry({
      title,
      name,
      endTime: new Date(endTime), // Convert endTime to a Date object
      isActive: isActive !== undefined ? isActive : true, // Default to true if not provided
    });

    // Save the offer entry to the database
    await newOfferEntry.save();

    return NextResponse.json({ message: 'Offer entry created successfully', offerEntry: newOfferEntry }, { status: 201 });
  } catch (error) {
    console.error('Error creating offer entry:', error);
    return NextResponse.json({ message: 'Error creating offer entry' }, { status: 500 });
  }
}
