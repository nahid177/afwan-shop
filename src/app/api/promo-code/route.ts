// /app/api/promo-code/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import PromoCode from '@/models/PromoCode';

// Connect to the database
dbConnect();

// Removed unused PromoCodeType interface

// Handle POST request for creating a promo code
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, discountValue, isActive, startDate, endDate } = body;

    // Validate required fields
    if (!code || discountValue === undefined) {
      return NextResponse.json(
        { message: 'Code and discount value are required' },
        { status: 400 }
      );
    }

    // Ensure discountValue is a valid number
    if (isNaN(discountValue) || discountValue <= 0) {
      return NextResponse.json(
        { message: 'Discount value must be a positive number' },
        { status: 400 }
      );
    }

    // Check for unique promo code
    const existingPromo = await PromoCode.findOne({ code });
    if (existingPromo) {
      return NextResponse.json(
        { message: 'Promo code already exists' },
        { status: 400 }
      );
    }

    // Create new promo code
    const newPromoCode = new PromoCode({
      code,
      discountValue,
      isActive: isActive !== undefined ? isActive : true, // Default to true if not provided
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    // Save the promo code to the database
    await newPromoCode.save();

    return NextResponse.json(
      { message: 'Promo code created successfully', promoCode: newPromoCode },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating promo code:', error);
    return NextResponse.json(
      { message: 'Error creating promo code' },
      { status: 500 }
    );
  }
}

// Handle GET request for fetching all promo codes
export async function GET() {
  try {
    // Fetch all promo codes, sorted by creation date descending
    const promoCodes = await PromoCode.find().sort({ createdAt: -1 });

    return NextResponse.json({ promoCodes }, { status: 200 });
  } catch (error) {
    console.error('Error fetching promo codes:', error);
    return NextResponse.json(
      { message: 'Error fetching promo codes' },
      { status: 500 }
    );
  }
}
