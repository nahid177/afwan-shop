import { NextResponse } from 'next/server';
import PromoCode from '@/models/PromoCode'; // Adjust if necessary

// Handle POST request for promo code validation
export async function POST(req: Request) {
  const { code } = await req.json();

  if (!code) {
    return NextResponse.json({ message: 'Promo code is required' }, { status: 400 });
  }

  try {
    const promoCode = await PromoCode.findOne({ code });

    if (!promoCode || !promoCode.isActive) {
      return NextResponse.json({ isValid: false, discountValue: 0 }, { status: 400 });
    }

    const today = new Date();

    if (
      (promoCode.startDate && promoCode.startDate > today) ||
      (promoCode.endDate && promoCode.endDate < today)
    ) {
      return NextResponse.json({ isValid: false, discountValue: 0 }, { status: 400 });
    }

    return NextResponse.json({
      isValid: true,
      discountValue: promoCode.discountValue, // Return discount percentage
    });
  } catch (error) {
    console.error('Error validating promo code:', error);
    return NextResponse.json({ message: 'Error validating promo code' }, { status: 500 });
  }
}
