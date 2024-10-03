import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import DeliveryAreas from '@/models/DeliveryArea'; // Import the Delivery Areas schema

// Connect to the database
dbConnect();

// Handle POST request for creating delivery areas
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { areas } = body;

    // Validate required fields
    if (!areas || !Array.isArray(areas) || areas.length === 0) {
      return NextResponse.json({ message: 'Delivery areas are required' }, { status: 400 });
    }

    // Validate that each area has both a name and a price
    for (const area of areas) {
      if (!area.area || typeof area.price !== 'number') {
        return NextResponse.json({ message: 'Each delivery area must have a name and a valid price' }, { status: 400 });
      }
    }

    // Create new delivery areas
    const newDeliveryAreas = new DeliveryAreas({
      areas, // Store the array of areas and prices
    });

    // Save the delivery areas to the database
    await newDeliveryAreas.save();

    return NextResponse.json({ message: 'Delivery areas created successfully', deliveryAreas: newDeliveryAreas }, { status: 201 });
  } catch (error) {
    console.error('Error creating delivery areas:', error);
    return NextResponse.json({ message: 'Error creating delivery areas' }, { status: 500 });
  }
}
