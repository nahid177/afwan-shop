// src/pages/api/profit/[id].ts

import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Profit, { IProfit } from '@/models/Profit';

/**
 * GET /api/profit/[id]
 * Fetch a single Profit document by ID
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    await dbConnect();
    const profit = await Profit.findById(id);
    if (!profit) {
      return NextResponse.json({ success: false, error: 'Profit not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: profit }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}

/**
 * PUT /api/profit/[id]
 * Update a Profit document by ID
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    await dbConnect();
    const body = await request.json();

    // Ensure that updated fields have correct types
    const updateData: Partial<IProfit> = {};
    if (typeof body.totalProductsSold === 'number') updateData.totalProductsSold = body.totalProductsSold;
    if (typeof body.totalRevenue === 'number') updateData.totalRevenue = body.totalRevenue;
    if (typeof body.ourProfit === 'number') updateData.ourProfit = body.ourProfit;
    if (Array.isArray(body.otherCosts)) updateData.otherCosts = body.otherCosts;
    if (Array.isArray(body.titles)) updateData.titles = body.titles;
    if (body.status === 'open' || body.status === 'closed') updateData.status = body.status; // Allow status update

    const profit = await Profit.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!profit) {
      return NextResponse.json({ success: false, error: 'Profit not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: profit }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}

/**
 * DELETE /api/profit/[id]
 * Delete a Profit document by ID
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    await dbConnect();
    const deletedProfit = await Profit.findByIdAndDelete(id);
    if (!deletedProfit) {
      return NextResponse.json({ success: false, error: 'Profit not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}
