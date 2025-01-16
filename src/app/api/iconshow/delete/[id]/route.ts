import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Iconshow from "@/models/Iconshow";

// DELETE method to remove a Iconshow item
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    // Connect to database
    await dbConnect();

    // Find and delete the Iconshow item by ID
    const deletedItem = await Iconshow.findByIdAndDelete(id);

    if (!deletedItem) {
      return NextResponse.json(
        { message: 'Iconshow item not found' },
        { status: 404 }
      );
    }

    // Return success response
    return NextResponse.json(
      { message: 'Iconshow item deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting Iconshow item:', error);
    return NextResponse.json(
      { message: 'Error deleting Iconshow item' },
      { status: 500 }
    );
  }
}
