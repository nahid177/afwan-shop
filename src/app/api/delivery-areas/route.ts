import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import DeliveryArea from '@/models/DeliveryArea';

dbConnect();

// POST: Add a new area
export async function POST(req: NextRequest) {
  try {
    const { area, price } = await req.json();

    if (!area || typeof price !== 'number') {
      return NextResponse.json(
        { message: 'Area name and a valid price are required' },
        { status: 400 }
      );
    }

    const newDeliveryArea = await DeliveryArea.create({ area, price });

    return NextResponse.json(
      { message: 'Area added successfully', deliveryArea: newDeliveryArea },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding area:', error);
    return NextResponse.json({ message: 'Error adding area' }, { status: 500 });
  }
}

// GET: Fetch all delivery areas
export async function GET() {
  try {
    const deliveryAreas = await DeliveryArea.find();
    return NextResponse.json({ deliveryAreas }, { status: 200 });
  } catch (error) {
    console.error('Error fetching delivery areas:', error);
    return NextResponse.json(
      { message: 'Error fetching delivery areas' },
      { status: 500 }
    );
  }
}

// PUT: Update an area by ID
export async function PUT(req: NextRequest) {
  try {
    const { id, area, price } = await req.json();

    if (!id || !area || typeof price !== 'number') {
      return NextResponse.json(
        { message: 'ID, area name, and price are required' },
        { status: 400 }
      );
    }

    const updatedDeliveryArea = await DeliveryArea.findByIdAndUpdate(
      id,
      { area, price },
      { new: true }
    );

    if (updatedDeliveryArea) {
      return NextResponse.json(
        { message: 'Area updated successfully', deliveryArea: updatedDeliveryArea },
        { status: 200 }
      );
    } else {
      return NextResponse.json({ message: 'Area not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error updating area:', error);
    return NextResponse.json({ message: 'Error updating area' }, { status: 500 });
  }
}

// DELETE: Remove an area by ID
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { message: 'ID is required to delete an area' },
        { status: 400 }
      );
    }

    const deletedDeliveryArea = await DeliveryArea.findByIdAndDelete(id);

    if (deletedDeliveryArea) {
      return NextResponse.json(
        { message: 'Area deleted successfully' },
        { status: 200 }
      );
    } else {
      return NextResponse.json({ message: 'Area not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error deleting area:', error);
    return NextResponse.json({ message: 'Error deleting area' }, { status: 500 });
  }
}
