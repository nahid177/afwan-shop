import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Iconshow from "@/models/Iconshow";

// PUT method to update a Iconshow item
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { name, link, imageUrl } = await req.json();

  try {
    // Connect to database
    await dbConnect();

    // Find the Iconshow item by ID and update
    const updatedItem = await Iconshow.findByIdAndUpdate(
      id,
      { name, link, imageUrl },
      { new: true }
    );

    if (!updatedItem) {
      return NextResponse.json(
        { message: 'Iconshow item not found' },
        { status: 404 }
      );
    }

    // Return updated item as response
    return NextResponse.json(
      { message: 'Iconshow item updated successfully', data: updatedItem },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating Iconshow item:', error);
    return NextResponse.json(
      { message: 'Error updating Iconshow item' },
      { status: 500 }
    );
  }
}
