// src/app/api/profit/recalculate/route.ts

import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Profit, { IOtherCost } from '@/models/Profit';
import { Order, IOrder } from '@/models/Order'; // Correct named import

/**
 * POST /api/profit/recalculate
 * Recalculate profit based on approved orders
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Fetch all approved Orders
    const approvedOrders: IOrder[] = await Order.find({ approved: true });

    // Calculate totalProductsSold
    const totalProductsSold = approvedOrders.reduce((acc, order) => {
      const orderQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
      return acc + orderQuantity;
    }, 0);

    // Calculate totalRevenue
    const totalRevenue = approvedOrders.reduce((acc, order) => acc + order.totalAmount, 0);

    // Calculate totalCost of goods sold
    const totalCostOfGoodsSold = approvedOrders.reduce((acc, order) => {
      const orderCost = order.items.reduce((sum, item) => sum + item.buyingPrice * item.quantity, 0);
      return acc + orderCost;
    }, 0);

    // Fetch otherCosts from existing Profit documents
    const existingProfit = await Profit.findOne({}).sort({ createdAt: -1 });
    let otherCosts: IOtherCost[] = [];

    if (existingProfit) {
      otherCosts = existingProfit.otherCosts;
    }

    const totalOtherCosts = otherCosts.reduce((acc, cost) => acc + cost.amount, 0);

    // Calculate ourProfit
    const ourProfit = totalRevenue - totalCostOfGoodsSold - totalOtherCosts;

    // Update or create a Profit document
    let profitDoc = existingProfit;

    if (!profitDoc) {
      profitDoc = await Profit.create({
        totalProductsSold,
        totalRevenue,
        ourProfit,
        otherCosts,
      });
    } else {
      profitDoc.totalProductsSold = totalProductsSold;
      profitDoc.totalRevenue = totalRevenue;
      profitDoc.ourProfit = ourProfit;
      // Optionally, handle otherCosts updates
      // For now, keep existing otherCosts
      await profitDoc.save();
    }

    return NextResponse.json({ success: true, data: profitDoc }, { status: 200 });
  } catch (error) {
    console.error("Error recalculating profit:", error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
