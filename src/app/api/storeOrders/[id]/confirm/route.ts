// src/app/api/storeOrders/[id]/confirm/route.ts

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import StoreOrder from '@/models/StoreOrder'; // Changed to default import
import { ProductTypes } from '@/models/ProductTypes';
import mongoose from 'mongoose';

// Define necessary interfaces
interface ISizeQuantity {
  size: string;
  quantity: number;
}

interface IColorQuantity {
  color: string;
  quantity: number;
}

interface IProduct {
  _id: mongoose.Types.ObjectId;
  product_name: string;
  sizes: ISizeQuantity[];
  colors: IColorQuantity[];
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } } // Changed 'orderId' to 'id'
) {
  const { id } = params; // Changed from 'orderId' to 'id'

  // Validate the order ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid order ID.' }, { status: 400 });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await dbConnect();

    // Find the order by ID within the session
    const order = await StoreOrder.findById(id).session(session); // Changed 'orderId' to 'id'

    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }

    // Check if the order is already approved
    if (order.approved) { // Ensure 'approved' field exists in your schema
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json({ message: 'Order is already approved.' }, { status: 400 });
    }

    // Deduct quantities from product inventories
    for (const item of order.products) { // Changed 'items' to 'products'
      console.log(`Processing order item: product ID = ${item.product}, size = ${item.size}, color = ${item.color}, quantity = ${item.quantity}`);

      // Find the ProductType that contains this product
      const productType = await ProductTypes.findOne({
        'product_catagory.product._id': item.product
      }).session(session);

      if (!productType) {
        console.log(`Product type not found for product ID: ${item.product}`);
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json(
          { message: `Product type containing product ID ${item.product} not found.` },
          { status: 404 }
        );
      }

      console.log(`Found ProductType: ${productType.types_name}`);

      // Find the product within the product categories
      let productFound = false;
      for (const category of productType.product_catagory) {
        console.log(`Checking category: ${category.catagory_name}`);

        const product = category.product.find(
          (prod: IProduct) => prod._id.toString() === item.product.toString()
        );

        if (product) {
          console.log(`Found product: ${product.product_name}`);
          productFound = true;

          // Find the size index
          const sizeIndex = product.sizes.findIndex(
            (size: ISizeQuantity) => size.size === item.size
          );

          if (sizeIndex === -1) {
            console.log(`Size ${item.size} not found for product ${product.product_name}.`);
            await session.abortTransaction();
            session.endSession();
            return NextResponse.json(
              { message: `Size ${item.size} not found for product ${product.product_name}.` },
              { status: 400 }
            );
          }

          // Find the color index
          const colorIndex = product.colors.findIndex(
            (color: IColorQuantity) => color.color === item.color
          );

          if (colorIndex === -1) {
            console.log(`Color ${item.color} not found for product ${product.product_name}.`);
            await session.abortTransaction();
            session.endSession();
            return NextResponse.json(
              { message: `Color ${item.color} not found for product ${product.product_name}.` },
              { status: 400 }
            );
          }

          // Check if sufficient quantity exists for size and color
          if (product.sizes[sizeIndex].quantity < item.quantity) {
            console.log(`Insufficient stock for product ${product.product_name}, size ${item.size}.`);
            await session.abortTransaction();
            session.endSession();
            return NextResponse.json(
              { message: `Insufficient stock for product ${product.product_name}, size ${item.size}.` },
              { status: 400 }
            );
          }

          if (product.colors[colorIndex].quantity < item.quantity) {
            console.log(`Insufficient stock for product ${product.product_name}, color ${item.color}.`);
            await session.abortTransaction();
            session.endSession();
            return NextResponse.json(
              { message: `Insufficient stock for product ${product.product_name}, color ${item.color}.` },
              { status: 400 }
            );
          }

          // Deduct the quantity
          product.sizes[sizeIndex].quantity -= item.quantity;
          product.colors[colorIndex].quantity -= item.quantity;

          await productType.save({ session });
          console.log(`Deducted ${item.quantity} from product ${product.product_name}, size ${item.size}, color ${item.color}.`);
          break;
        }
      }

      if (!productFound) {
        console.log(`Product with ID ${item.product} not found in any category.`);
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json(
          { message: `Product with ID ${item.product} not found in any category.` },
          { status: 404 }
        );
      }
    }

    // Set the order as approved
    order.approved = true;
    await order.save({ session });
    console.log(`Order ${id} has been approved.`);

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json(order, { status: 200 });
  } catch (error: unknown) { // Changed from 'any' to 'unknown'
    await session.abortTransaction();
    session.endSession();
    console.error('Error confirming order:', error);
    let errorMessage = 'Internal Server Error';

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}
