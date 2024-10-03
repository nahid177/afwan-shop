import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import PromoCode from '@/models/PromoCode'; // Import the Promo Code schema

// Connect to the database
dbConnect();

// Handle POST request for creating a promo code
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, discountValue, isActive, startDate, endDate } = body;

    // Validate required fields
    if (!code || !discountValue) {
      return NextResponse.json({ message: 'Code and discount value are required' }, { status: 400 });
    }

    // Ensure discountValue is a valid number
    if (isNaN(discountValue) || discountValue <= 0) {
      return NextResponse.json({ message: 'Discount value must be a positive number' }, { status: 400 });
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

    return NextResponse.json({ message: 'Promo code created successfully', promoCode: newPromoCode }, { status: 201 });
  } catch (error) {
    console.error('Error creating promo code:', error);
    return NextResponse.json({ message: 'Error creating promo code' }, { status: 500 });
  }
}
