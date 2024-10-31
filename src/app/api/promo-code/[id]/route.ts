// /app/api/promo-code/[id]/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import PromoCode from '@/models/PromoCode';

// Connect to the database
dbConnect();

// Removed unused PromoCodeType interface

// Handle GET request for fetching a single promo code
export async function GET(req: Request) {
  try {
    const { pathname } = new URL(req.url);
    const parts = pathname.split('/');
    const id = parts[parts.length - 1]; // Assuming URL ends with /api/promo-code/[id]

    if (!id) {
      return NextResponse.json(
        { message: 'Promo code ID is required in the URL' },
        { status: 400 }
      );
    }

    const promoCode = await PromoCode.findById(id);
    if (!promoCode) {
      return NextResponse.json(
        { message: 'Promo code not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ promoCode }, { status: 200 });
  } catch (error) {
    console.error('Error fetching promo code:', error);
    return NextResponse.json(
      { message: 'Error fetching promo code' },
      { status: 500 }
    );
  }
}

// Handle PUT request for updating a promo code
export async function PUT(req: Request) {
  try {
    const { pathname } = new URL(req.url);
    const parts = pathname.split('/');
    const id = parts[parts.length - 1]; // Extract 'id' from URL

    if (!id) {
      return NextResponse.json(
        { message: 'Promo code ID is required in the URL' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { code, discountValue, isActive, startDate, endDate } = body;

    // Find the promo code by ID
    const promoCode = await PromoCode.findById(id);
    if (!promoCode) {
      return NextResponse.json(
        { message: 'Promo code not found' },
        { status: 404 }
      );
    }

    // If code is being updated, ensure it's unique
    if (code && code !== promoCode.code) {
      const existingPromo = await PromoCode.findOne({ code });
      if (existingPromo) {
        return NextResponse.json(
          { message: 'Another promo code with this code already exists' },
          { status: 400 }
        );
      }
      promoCode.code = code;
    }

    // Update fields if provided
    if (discountValue !== undefined) {
      if (isNaN(discountValue) || discountValue <= 0) {
        return NextResponse.json(
          { message: 'Discount value must be a positive number' },
          { status: 400 }
        );
      }
      promoCode.discountValue = discountValue;
    }
    if (isActive !== undefined) promoCode.isActive = isActive;
    if (startDate !== undefined)
      promoCode.startDate = startDate ? new Date(startDate) : undefined;
    if (endDate !== undefined)
      promoCode.endDate = endDate ? new Date(endDate) : undefined;

    // Save the updated promo code
    await promoCode.save();

    return NextResponse.json(
      { message: 'Promo code updated successfully', promoCode },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating promo code:', error);
    return NextResponse.json(
      { message: 'Error updating promo code' },
      { status: 500 }
    );
  }
}

// Handle DELETE request for deleting a promo code
export async function DELETE(req: Request) {
  try {
    const { pathname } = new URL(req.url);
    const parts = pathname.split('/');
    const id = parts[parts.length - 1]; // Extract 'id' from URL

    if (!id) {
      return NextResponse.json(
        { message: 'Promo code ID is required in the URL' },
        { status: 400 }
      );
    }

    // Find and delete the promo code by ID
    const deletedPromo = await PromoCode.findByIdAndDelete(id);
    if (!deletedPromo) {
      return NextResponse.json(
        { message: 'Promo code not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Promo code deleted successfully', promoCode: deletedPromo },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting promo code:', error);
    return NextResponse.json(
      { message: 'Error deleting promo code' },
      { status: 500 }
    );
  }
}
