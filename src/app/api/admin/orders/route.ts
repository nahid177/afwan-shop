// src/app/api/admin/orders/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { Order, IOrder, IOrderItem } from '@/models/Order';
import dbConnect from '@/lib/dbConnect';
import { ProductTypes, IProductType, IProduct } from '@/models/ProductTypes';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  await dbConnect();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const data: IOrder = await req.json();
    console.log("Received order data:", JSON.stringify(data, null, 2)); // Debugging

    const { customerName, customerNumber, otherNumber, address1, address2, items, totalAmount } = data;

    // Validate required fields
    if (!customerName || !customerNumber || !address1 || !items || items.length === 0 || totalAmount === undefined) {
      throw new Error('Missing required fields.');
    }

    // Process each item to validate and set buyingPrice, image, and code
    const processedItems: IOrderItem[] = [];

    for (const item of items) {
      const { product, color, size, quantity, price } = item; // Exclude buyingPrice, image, and code from frontend

      // Validate product ID
      if (!mongoose.Types.ObjectId.isValid(product.toString())) {
        throw new Error(`Invalid product ID: ${product}`);
      }

      const productId = new mongoose.Types.ObjectId(product);

      // Find the ProductType containing this product
      const productType: IProductType | null = await ProductTypes.findOne({
        'product_catagory.product._id': productId
      }).session(session).exec();

      if (!productType) {
        throw new Error(`Product with ID ${product} not found in any ProductType.`);
      }

      // Find the specific product within the ProductType
      let productDoc: IProduct | null = null;

      for (const category of productType.product_catagory) {
        const foundProduct = category.product.find((prod: IProduct) => prod._id.equals(productId));
        if (foundProduct) {
          productDoc = foundProduct;
          break;
        }
      }

      if (!productDoc) {
        throw new Error(`Product with ID ${product} not found in the category.`);
      }

      // Check color availability
      const colorObj = productDoc.colors.find((c) => c.color === color);
      if (!colorObj) {
        throw new Error(`Color ${color} not available for product ${productDoc.product_name}.`);
      }
      if (colorObj.quantity < quantity) {
        throw new Error(`Insufficient stock for color ${color} of product ${productDoc.product_name}.`);
      }

      // Check size availability
      const sizeObj = productDoc.sizes.find((s) => s.size === size);
      if (!sizeObj) {
        throw new Error(`Size ${size} not available for product ${productDoc.product_name}.`);
      }
      if (sizeObj.quantity < quantity) {
        throw new Error(`Insufficient stock for size ${size} of product ${productDoc.product_name}.`);
      }

      // Deduct quantities
      colorObj.quantity -= quantity;
      sizeObj.quantity -= quantity;

      // Save the updated ProductTypes document
      await productType.save({ session });

      // Fetch buyingPrice, image, and code from productDoc
      const { buyingPrice, images, code } = productDoc;
      const image = images[0] || ''; // Default to empty string if no image

      // Create the processed order item
      const processedItem: IOrderItem = {
        product: productId,
        name: productDoc.product_name,
        color,
        size,
        quantity,
        price,
        buyingPrice,
        image,
        code, // Set the code array
      };

      console.log("Processed Order Item:", processedItem); // Debugging
      processedItems.push(processedItem);
    }

    // Create the order
    const newOrder = new Order({
      customerName,
      customerNumber,
      otherNumber,
      address1,
      address2,
      items: processedItems,
      totalAmount,
      approved: false
    });

    await newOrder.save({ session });

    await session.commitTransaction();
    session.endSession();

    console.log(`Order created successfully with ID: ${newOrder._id}`);

    return NextResponse.json({ orderId: newOrder._id }, { status: 201 });

  } catch (error: unknown) {
    await session.abortTransaction();
    session.endSession();
    let errorMessage = 'Unknown error occurred while placing the order.';
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error('Error placing order:', errorMessage);
    }
    return NextResponse.json({ message: errorMessage }, { status: 400 });
  }
}

// GET: Retrieve all open orders
export async function GET() {
  try {
    await dbConnect();

    // Fetch all orders where status is 'open' and use .lean()
    const orders = await Order.find({ status: 'open' })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(orders, { status: 200 });
  } catch (error: unknown) {
    let errorMessage = 'Error fetching open orders.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error('Error fetching open orders:', errorMessage);
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/orders/[orderId]
export async function DELETE(req: NextRequest, { params }: { params: { orderId: string } }) {
  const { orderId } = params;

  await dbConnect();

  try {
    const deletedOrder = await Order.findByIdAndDelete(orderId);
    if (!deletedOrder) {
      return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Order deleted successfully.' }, { status: 200 });
  } catch (error: unknown) {
    let errorMessage = 'Internal server error.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error('Error deleting order:', errorMessage);
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
