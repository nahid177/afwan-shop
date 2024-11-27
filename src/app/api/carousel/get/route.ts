import dbConnect from "@/lib/dbConnect";
import Carousel from "@/models/Carousel";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Connect to the database
    await dbConnect();

    // Fetch all carousel items as plain objects (to remove Mongoose-specific methods)
    const carouselItems = await Carousel.find().lean();

    // Map _id to string and return the data
    const items = carouselItems.map(item => ({
      ...item,
      _id: item._id!.toString(), // Convert ObjectId to string for frontend compatibility
    }));

    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error("Error fetching carousel items:", error);
    return NextResponse.json({ message: "Error fetching carousel items" }, { status: 500 });
  }
}
