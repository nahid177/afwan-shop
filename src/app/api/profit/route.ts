// src/pages/api/profit/index.ts

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Profit, { IProfit } from '@/models/Profit';

/**
 * GET /api/profit
 * Fetch all Profit documents
 */
export async function GET() {
  try {
    await dbConnect();
    const profits = await Profit.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: profits }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}



/**
 * POST /api/profit
 * Create a new Profit document
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Validate required fields
    if (
      typeof body.totalProductsSold !== 'number' ||
      typeof body.totalRevenue !== 'number' ||
      typeof body.ourProfit !== 'number'
    ) {
      return NextResponse.json(
        { success: false, error: 'Invalid data format' },
        { status: 400 }
      );
    }
    
    // Set default values for optional fields
    const newProfitData: Partial<IProfit> = {
      totalProductsSold: body.totalProductsSold,
      totalRevenue: body.totalRevenue,
      ourProfit: body.ourProfit,
      otherCosts: body.otherCosts || [],
      titles: body.titles || [],
      status: body.status || 'open', // Ensure status is set
    };
    
    const profit = await Profit.create(newProfitData);
    return NextResponse.json({ success: true, data: profit }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}
