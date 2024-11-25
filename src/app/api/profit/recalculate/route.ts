// src/app/api/profit/recalculate/route.ts

import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Profit, { IOtherCost } from '@/models/Profit';
import { Order, IOrderDocument, IOrderItem } from '@/models/Order'; // Corrected import
import StoreOrder, { IStoreOrderDocument, IStoreOrderProduct } from '@/models/StoreOrder'; // Correct import

/**
 * POST /api/profit/recalculate
 * Recalculate profit based on approved Orders and StoreOrders
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Fetch all approved Orders
    const approvedOrders: IOrderDocument[] = await Order.find({ approved: true });
    
    // Fetch all approved StoreOrders
    const approvedStoreOrders: IStoreOrderDocument[] = await StoreOrder.find({ approved: true });

    // Function to calculate totals from orders
    const calculateTotals = (orders: Array<IOrderDocument | IStoreOrderDocument>) => {
      let totalProductsSold = 0;
      let totalRevenue = 0;
      let totalCostOfGoodsSold = 0;

      orders.forEach(order => {
        let products: IOrderItem[] | IStoreOrderProduct[] = [];
        let orderTotal = 0;
        let buyingPriceField: keyof IOrderItem | keyof IStoreOrderProduct = 'buyingPrice'; // Adjusted types

        if ('products' in order) { // StoreOrder
          products = order.products;
          orderTotal = order.totalAmount;
        } else { // Order
          products = order.items;
          orderTotal = order.totalAmount;
          buyingPriceField = 'buyingPrice';
        }

        totalProductsSold += products.reduce((sum, product) => sum + product.quantity, 0);
        totalRevenue += orderTotal;
        totalCostOfGoodsSold += products.reduce((sum, product) => sum + product[buyingPriceField] * product.quantity, 0);
      });

      return { totalProductsSold, totalRevenue, totalCostOfGoodsSold };
    };

    // Calculate totals for Orders
    const orderTotals = calculateTotals(approvedOrders);

    // Calculate totals for StoreOrders
    const storeOrderTotals = calculateTotals(approvedStoreOrders);

    // Aggregate totals from both models
    const totalProductsSold = orderTotals.totalProductsSold + storeOrderTotals.totalProductsSold;
    const totalRevenue = orderTotals.totalRevenue + storeOrderTotals.totalRevenue;
    const totalCostOfGoodsSold = orderTotals.totalCostOfGoodsSold + storeOrderTotals.totalCostOfGoodsSold;

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
