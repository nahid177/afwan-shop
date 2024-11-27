import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Carousel from "@/models/Carousel";

// DELETE method to remove a carousel item
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    // Connect to database
    await dbConnect();

    // Find and delete the carousel item by ID
    const deletedItem = await Carousel.findByIdAndDelete(id);

    if (!deletedItem) {
      return NextResponse.json(
        { message: 'Carousel item not found' },
        { status: 404 }
      );
    }

    // Return success response
    return NextResponse.json(
      { message: 'Carousel item deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting carousel item:', error);
    return NextResponse.json(
      { message: 'Error deleting carousel item' },
      { status: 500 }
    );
  }
}
