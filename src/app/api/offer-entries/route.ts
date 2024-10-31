// src/app/api/offer-entries/route.ts
import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import OfferEntry from '@/models/OfferEntry';
import mongoose from 'mongoose';

// Connect to the database
dbConnect();

// Interface for the object returned from toObject()
interface OfferEntryObject {
  _id: mongoose.Types.ObjectId;
  title: string;
  detail: string;
  endTime: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}

// Interface for the transformed object
interface OfferEntryTransformed {
  _id: string;
  title: string;
  detail: string;
  endTime: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}
// POST: Create a new offer entry
export async function POST(req: NextRequest) {
  try {
    const { title, detail, endTime, isActive } = await req.json();

    // Validate required fields
    if (!title || !detail || !endTime) {
      return NextResponse.json(
        { message: 'Title, detail, and end time are required' },
        { status: 400 }
      );
    }

    // Create a new offer entry
    const newOfferEntry = await OfferEntry.create({
      title,
      detail,
      endTime: new Date(endTime),
      isActive: isActive !== undefined ? isActive : true,
    });

    return NextResponse.json(
      { message: 'Offer entry created successfully', offerEntry: newOfferEntry },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating offer entry:', error);
    return NextResponse.json({ message: 'Error creating offer entry' }, { status: 500 });
  }
}

// GET: Fetch all offer entries
export async function GET() {
  try {
    const offerEntries = await OfferEntry.find().sort({ createdAt: -1 });

    // Convert Mongoose documents to plain JavaScript objects and serialize dates
    const transformedOfferEntries: OfferEntryTransformed[] = offerEntries.map((entry) => {
      const obj = entry.toObject() as OfferEntryObject;

      const transformedObj: OfferEntryTransformed = {
        _id: obj._id.toString(),
        title: obj.title,
        detail: obj.detail,
        endTime: obj.endTime.toISOString(),
        isActive: obj.isActive,
        createdAt: obj.createdAt ? obj.createdAt.toISOString() : undefined,
        updatedAt: obj.updatedAt ? obj.updatedAt.toISOString() : undefined,
        __v: obj.__v,
      };

      return transformedObj;
    });

    console.log('Transformed Offer Entries:', transformedOfferEntries); // For debugging

    return NextResponse.json({ offerEntries: transformedOfferEntries }, { status: 200 });
  } catch (error) {
    console.error('Error fetching offer entries:', error);
    return NextResponse.json({ message: 'Error fetching offer entries' }, { status: 500 });
  }
}

// PUT: Update an offer entry by ID
export async function PUT(req: NextRequest) {
  try {
    const { id, title, detail, endTime, isActive } = await req.json();

    if (!id) {
      return NextResponse.json({ message: 'ID is required for updating' }, { status: 400 });
    }

    const updatedOfferEntry = await OfferEntry.findByIdAndUpdate(
      id,
      { title, detail, endTime: new Date(endTime), isActive },
      { new: true }
    );

    if (updatedOfferEntry) {
      return NextResponse.json(
        { message: 'Offer entry updated successfully', offerEntry: updatedOfferEntry },
        { status: 200 }
      );
    } else {
      return NextResponse.json({ message: 'Offer entry not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error updating offer entry:', error);
    return NextResponse.json({ message: 'Error updating offer entry' }, { status: 500 });
  }
}

// DELETE: Remove an offer entry by ID
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ message: 'ID is required for deletion' }, { status: 400 });
    }

    const deletedOfferEntry = await OfferEntry.findByIdAndDelete(id);

    if (deletedOfferEntry) {
      return NextResponse.json(
        { message: 'Offer entry deleted successfully' },
        { status: 200 }
      );
    } else {
      return NextResponse.json({ message: 'Offer entry not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error deleting offer entry:', error);
    return NextResponse.json({ message: 'Error deleting offer entry' }, { status: 500 });
  }
}
