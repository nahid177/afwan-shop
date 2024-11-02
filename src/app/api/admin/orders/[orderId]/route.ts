import { NextRequest, NextResponse } from 'next/server';
import { Order } from '@/models/Order';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';
import {
  ProductTypes,
  IProductCategory,
  IProduct,
  ISizeQuantity,
  IColorQuantity
} from "@/models/ProductTypes";

export async function PATCH(request: Request, { params }: { params: { orderId: string } }) {
  try {
    // Ensure database connection
    await dbConnect();
    console.log("Database connected successfully.");

    const { orderId } = params;
    console.log("Received orderId in PATCH:", orderId);

    // Convert orderId to ObjectId for MongoDB queries
    const orderObjectId = new mongoose.Types.ObjectId(orderId);
    console.log("Converted orderObjectId:", orderObjectId);

    // Attempt to find the order with the provided ObjectId
    const order = await Order.findById(orderObjectId).populate("items.product");

    if (!order) {
      console.log(`Order with ID ${orderObjectId} not found in database.`);
      return NextResponse.json({ message: "Order not found." }, { status: 404 });
    }

    if (order.status === "Confirmed") {
      return NextResponse.json({ message: "Order already confirmed." }, { status: 400 });
    }

    // Loop through each item in the order to update stock
    for (const item of order.items) {
      const productType = await ProductTypes.findOne({
        "product_catagory.product._id": item.product as mongoose.Types.ObjectId,
      });

      if (!productType) {
        return NextResponse.json(
          { message: `Product with ID ${item.product} not found in any category.` },
          { status: 404 }
        );
      }

      const category = productType.product_catagory.find((cat: IProductCategory) =>
        cat.product.some((prod: IProduct) => (prod._id as mongoose.Types.ObjectId).equals(item.product))
      );

      const product = category?.product.find((prod: IProduct) => (prod._id as mongoose.Types.ObjectId).equals(item.product));

      if (!product) {
        return NextResponse.json(
          { message: `Product with ID ${item.product} not found in the category.` },
          { status: 404 }
        );
      }

      const size = product.sizes.find((size: ISizeQuantity) => size.size === item.size);
      const color = product.colors.find((color: IColorQuantity) => color.color === item.color);

      if (size && size.quantity < item.quantity) {
        return NextResponse.json(
          { message: `Not enough stock for product ${product.product_name} in size ${item.size}.` },
          { status: 400 }
        );
      }

      if (color && color.quantity < item.quantity) {
        return NextResponse.json(
          { message: `Not enough stock for product ${product.product_name} in color ${item.color}.` },
          { status: 400 }
        );
      }

      if (size) size.quantity -= item.quantity;
      if (color) color.quantity -= item.quantity;

      await productType.save();
    }

    order.status = "Confirmed";
    await order.save();

    return NextResponse.json({ message: "Order confirmed and stock updated successfully!" }, { status: 200 });
  } catch (error) {
    console.error("Error confirming order:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error instanceof Error ? error.message : "Unknown Error" },
      { status: 500 }
    );
  }
}


export async function GET(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return NextResponse.json(
      { message: 'Invalid order ID.' },
      { status: 400 }
    );
  }

  try {
    await dbConnect();

    const order = await Order.findById(orderId).populate('items.product').exec();

    if (!order) {
      return NextResponse.json(
        { message: 'Order not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
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