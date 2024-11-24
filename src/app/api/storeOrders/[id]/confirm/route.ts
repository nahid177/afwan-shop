// src/app/api/storeOrders/[id]/confirm/route.ts

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import StoreOrder from '@/models/StoreOrder';
import { ProductTypes } from '@/models/ProductTypes';
import mongoose from 'mongoose';

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
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // Validate the order ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid order ID.' }, { status: 400 });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await dbConnect();

    // Find the order by ID within the session
    const order = await StoreOrder.findById(id).session(session);

    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }

    // Check if the order is already approved
    if (order.approved) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json({ message: 'Order is already approved.' }, { status: 400 });
    }

    // Deduct quantities from product inventories
    for (const item of order.products) {
      console.log(`Processing order item: productType ID = ${item.productType}, product ID = ${item.productId}, size = ${item.size}, color = ${item.color}, quantity = ${item.quantity}`);

      // Find the ProductType by ID
      const productType = await ProductTypes.findById(item.productType).session(session);

      if (!productType) {
        console.log(`Product type not found for productType ID: ${item.productType}`);
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json(
          { message: `Product type with ID ${item.productType} not found.` },
          { status: 404 }
        );
      }

      console.log(`Found ProductType: ${productType.types_name}`);

      // Find the product within the product categories
      let productFound = false;
      let targetProduct: IProduct | null = null;
      for (const category of productType.product_catagory) {
        console.log(`Checking category: ${category.catagory_name}`);

        const product = category.product.find(
          (prod: IProduct) => prod._id.toString() === item.productId.toString()
        );

        if (product) {
          console.log(`Found product: ${product.product_name}`);
          productFound = true;
          targetProduct = product;
          break;
        }
      }

      if (!productFound || !targetProduct) {
        console.log(`Product with ID ${item.productId} not found in any category.`);
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json(
          { message: `Product with ID ${item.productId} not found in any category.` },
          { status: 404 }
        );
      }

      // Find the size index
      const sizeIndex = targetProduct.sizes.findIndex(
        (size: ISizeQuantity) => size.size === item.size
      );

      if (sizeIndex === -1) {
        console.log(`Size ${item.size} not found for product ${targetProduct.product_name}.`);
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json(
          { message: `Size ${item.size} not found for product ${targetProduct.product_name}.` },
          { status: 400 }
        );
      }

      // Find the color index
      const colorIndex = targetProduct.colors.findIndex(
        (color: IColorQuantity) => color.color === item.color
      );

      if (colorIndex === -1) {
        console.log(`Color ${item.color} not found for product ${targetProduct.product_name}.`);
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json(
          { message: `Color ${item.color} not found for product ${targetProduct.product_name}.` },
          { status: 400 }
        );
      }

      // Check if sufficient quantity exists for size and color
      if (targetProduct.sizes[sizeIndex].quantity < item.quantity) {
        console.log(`Insufficient stock for product ${targetProduct.product_name}, size ${item.size}.`);
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json(
          { message: `Insufficient stock for product ${targetProduct.product_name}, size ${item.size}.` },
          { status: 400 }
        );
      }

      if (targetProduct.colors[colorIndex].quantity < item.quantity) {
        console.log(`Insufficient stock for product ${targetProduct.product_name}, color ${item.color}.`);
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json(
          { message: `Insufficient stock for product ${targetProduct.product_name}, color ${item.color}.` },
          { status: 400 }
        );
      }

      // Deduct the quantity
      targetProduct.sizes[sizeIndex].quantity -= item.quantity;
      targetProduct.colors[colorIndex].quantity -= item.quantity;

      // Save the updated ProductTypes document within the session
      await productType.save({ session });
      console.log(`Deducted ${item.quantity} from product ${targetProduct.product_name}, size ${item.size}, color ${item.color}.`);
    }

    // Set the order as approved
    order.approved = true;
    await order.save({ session });
    console.log(`Order ${id} has been approved.`);

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json(order, { status: 200 });
  } catch (error: unknown) {
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
