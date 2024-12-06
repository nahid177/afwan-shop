// src/app/api/profit/recalculate/route.ts

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Profit, { IOtherCost } from '@/models/Profit';
import { Order, IOrder } from '@/models/Order';
import StoreOrder, { IStoreOrderDocument } from '@/models/StoreOrder';

/**
 * POST /api/profit/recalculate
 * Recalculate profit based on approved and open Orders and StoreOrders
 */
export async function POST() {
  try {
    await dbConnect();

    // Fetch all approved and open Orders
    const approvedOpenOrders: IOrder[] = await Order.find({
      approved: true,
      status: 'open', // Include only orders with status 'open'
    });

    // Fetch all approved and open StoreOrders
    const approvedOpenStoreOrders: IStoreOrderDocument[] = await StoreOrder.find({
      approved: true,
      status: 'open', // Include only store orders with status 'open'
    });

    // Function to calculate totals from orders
    const calculateTotals = (
      orders: Array<IOrder | IStoreOrderDocument>
    ) => {
      let totalProductsSold = 0;
      let totalRevenue = 0;
      let totalCostOfGoodsSold = 0;

      orders.forEach((order) => {
        let orderTotal = 0;

        if ('products' in order) {
          // StoreOrder
          const products = order.products;
          orderTotal = order.totalAmount;

          totalProductsSold += products.reduce(
            (sum, product) => sum + product.quantity,
            0
          );

          totalCostOfGoodsSold += products.reduce(
            (sum, product) => sum + (product.buyingPrice || 0) * product.quantity,
            0
          );

        } else {
          // Order
          const products = order.items;
          orderTotal = order.totalAmount;

          totalProductsSold += products.reduce(
            (sum, product) => sum + product.quantity,
            0
          );

          totalCostOfGoodsSold += products.reduce(
            (sum, product) => sum + (product.buyingPrice || 0) * product.quantity,
            0
          );
        }

        totalRevenue += orderTotal;

      });

      return { totalProductsSold, totalRevenue, totalCostOfGoodsSold };
    };

    // Calculate totals for Orders
    const orderTotals = calculateTotals(approvedOpenOrders);

    // Calculate totals for StoreOrders
    const storeOrderTotals = calculateTotals(approvedOpenStoreOrders);

    // Aggregate totals from both models
    const totalProductsSold =
      orderTotals.totalProductsSold + storeOrderTotals.totalProductsSold;
    const totalRevenue =
      orderTotals.totalRevenue + storeOrderTotals.totalRevenue;
    const totalCostOfGoodsSold =
      orderTotals.totalCostOfGoodsSold + storeOrderTotals.totalCostOfGoodsSold;

    // Fetch the latest open Profit document
    const existingProfit = await Profit.findOne({ status: 'open' }).sort({
      createdAt: -1,
    });
    let otherCosts: IOtherCost[] = [];

    if (existingProfit) {
      otherCosts = existingProfit.otherCosts;
    }

    const totalOtherCosts = otherCosts.reduce(
      (acc, cost) => acc + cost.amount,
      0
    );

    // Calculate ourProfit
    const ourProfit = totalRevenue - totalCostOfGoodsSold - totalOtherCosts;

    // Update or create a Profit document
    let profitDoc = existingProfit;

    if (!profitDoc) {
      // Create a new Profit document with status 'open' and empty titles
      profitDoc = await Profit.create({
        totalProductsSold,
        totalRevenue,
        ourProfit,
        otherCosts,
        titles: [], // Initialize titles as empty array
        status: 'open',
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
    console.error('Error recalculating profit:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
