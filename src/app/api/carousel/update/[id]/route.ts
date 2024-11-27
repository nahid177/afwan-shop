import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Carousel from "@/models/Carousel";

// PUT method to update a carousel item
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { name, link, imageUrl } = await req.json();

  try {
    // Connect to database
    await dbConnect();

    // Find the carousel item by ID and update
    const updatedItem = await Carousel.findByIdAndUpdate(
      id,
      { name, link, imageUrl },
      { new: true }
    );

    if (!updatedItem) {
      return NextResponse.json(
        { message: 'Carousel item not found' },
        { status: 404 }
      );
    }

    // Return updated item as response
    return NextResponse.json(
      { message: 'Carousel item updated successfully', data: updatedItem },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating carousel item:', error);
    return NextResponse.json(
      { message: 'Error updating carousel item' },
      { status: 500 }
    );
  }
}
