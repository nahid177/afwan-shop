import dbConnect from "@/lib/dbConnect";
import Iconshow from "@/models/Iconshow";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Connect to the database
    await dbConnect();

    // Fetch all carousel items as plain objects (to remove Mongoose-specific methods)
    const iconshowItems = await Iconshow.find().lean();

    // Map _id to string and return the data
    const items = iconshowItems.map(item => ({
      ...item,
      _id: item._id!.toString(), // Convert ObjectId to string for frontend compatibility
    }));

    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error("Error fetching carousel items:", error);
    return NextResponse.json({ message: "Error fetching carousel items" }, { status: 500 });
  }
}
