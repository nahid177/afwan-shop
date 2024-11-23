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
      const buyingPrice = productDoc.buyingPrice;
      const image = productDoc.images[0] || ''; // Default to empty string if no image
      const code = productDoc.code;             // Fetch the code array

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

  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error placing order:', error.message);
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

// GET handler to fetch all orders
export async function GET() {
  try {
    await dbConnect();

    // Fetch orders and manually populate items.product details
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .lean<IOrder>()
      .exec();

    // Manually populate items.product from ProductTypes
    const populatedOrders = await Promise.all(orders.map(async (order): Promise<IOrder> => {
      const populatedItems = await Promise.all(order.items.map(async (item): Promise<IOrderItem & { productDetails: IProduct | null }> => {
        const productType = await ProductTypes.findOne<IProductType>({
          'product_catagory.product._id': item.product
        }).lean<IProductType>().exec();

        if (!productType) {
          return { ...item, productDetails: null };
        }

        let productDoc: IProduct | null = null;

        for (const category of productType.product_catagory) {
          const foundProduct = category.product.find((prod: IProduct) => prod._id.equals(item.product));
          if (foundProduct) {
            productDoc = foundProduct;
            break;
          }
        }

        return {
          ...item,
          productDetails: productDoc
        };
      }));

      return {
        ...order,
        items: populatedItems
      };
    }));

    return NextResponse.json(populatedOrders, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error instanceof Error ? error.message : 'Unknown Error' },
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
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
