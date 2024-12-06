// src/app/api/profit/close/route.ts

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Profit, { IOtherCost } from '@/models/Profit';
import { Order, IOrder } from '@/models/Order';
import StoreOrder, { IStoreOrderDocument, IStoreOrderProduct } from '@/models/StoreOrder';
import { IOrderItem } from '@/models/Order';

/**
 * POST /api/profit/close
 * Close the current Profit account and create a new one
 */
export async function POST() {
  try {
    await dbConnect();

    // Fetch the latest open Profit document
    const currentProfit = await Profit.findOne({ status: 'open' }).sort({ createdAt: -1 });

    if (!currentProfit) {
      return NextResponse.json(
        { success: false, error: 'No open Profit account found to close.' },
        { status: 404 }
      );
    }

    // Fetch approved Orders and StoreOrders
    const approvedOrders: IOrder[] = await Order.find({ approved: true });
    const approvedStoreOrders: IStoreOrderDocument[] = await StoreOrder.find({ approved: true });

    // Function to calculate totals from orders
    const calculateTotals = (orders: Array<IOrder | IStoreOrderDocument>) => {
      let totalProductsSold = 0;
      let totalRevenue = 0;
      let totalCostOfGoodsSold = 0;

      for (const order of orders) {
        let orderTotal = 0;

        if ('products' in order) {
          // It's a StoreOrder
          const products: IStoreOrderProduct[] = order.products;
          orderTotal = order.totalAmount;

          totalProductsSold += products.reduce((sum, product) => sum + product.quantity, 0);
          totalRevenue += orderTotal;
          totalCostOfGoodsSold += products.reduce(
            (sum, product) => sum + (product.buyingPrice || 0) * product.quantity,
            0
          );

        } else {
          // It's a normal Order
          const products: IOrderItem[] = order.items;
          orderTotal = order.totalAmount;

          totalProductsSold += products.reduce((sum, product) => sum + product.quantity, 0);
          totalRevenue += orderTotal;
          totalCostOfGoodsSold += products.reduce(
            (sum, product) => sum + (product.buyingPrice || 0) * product.quantity,
            0
          );
        }
      }

      return { totalProductsSold, totalRevenue, totalCostOfGoodsSold };
    };

    // Calculate totals for Orders
    const orderTotals = calculateTotals(approvedOrders);

    // Calculate totals for StoreOrders
    const storeOrderTotals = calculateTotals(approvedStoreOrders);

    // Aggregate totals from both
    const totalProductsSold = orderTotals.totalProductsSold + storeOrderTotals.totalProductsSold;
    const totalRevenue = orderTotals.totalRevenue + storeOrderTotals.totalRevenue;
    const totalCostOfGoodsSold = orderTotals.totalCostOfGoodsSold + storeOrderTotals.totalCostOfGoodsSold;

    // Fetch otherCosts from the current Profit document
    const otherCosts: IOtherCost[] = currentProfit.otherCosts || [];
    const totalOtherCosts = otherCosts.reduce((acc, cost) => acc + cost.amount, 0);

    // Calculate ourProfit
    const ourProfit = totalRevenue - totalCostOfGoodsSold - totalOtherCosts;

    // Finalize the current Profit document
    currentProfit.totalProductsSold = totalProductsSold;
    currentProfit.totalRevenue = totalRevenue;
    currentProfit.ourProfit = ourProfit;
    currentProfit.status = 'closed'; 
    await currentProfit.save();

    // Create a new Profit document for ongoing calculations
    const newProfit = await Profit.create({
      totalProductsSold: 0,
      totalRevenue: 0,
      ourProfit: 0,
      otherCosts: otherCosts,
      titles: currentProfit.titles || [],
      status: 'open',
    });

    return NextResponse.json(
      { success: true, message: 'Profit account closed and new account created.', data: newProfit },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error closing Profit account:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
