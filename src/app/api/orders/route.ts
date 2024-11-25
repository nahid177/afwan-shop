// src/app/api/orders/route.ts

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Order } from '@/models/Order';
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
  images: string[];               // Changed from any to string[]
  _id: mongoose.Types.ObjectId;
  product_name: string;
  code: string[];                 // Added code field
  sizes: ISizeQuantity[];
  colors: IColorQuantity[];
  buyingPrice: number;            // Ensure buyingPrice is part of the product
}

interface IProductCategory {
  catagory_name: string;
  product: IProduct[];
}

interface IProductType {
  save(arg0: { session: mongoose.mongo.ClientSession }): unknown;
  types_name: string;
  product_catagory: IProductCategory[];
}

interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  color: string;
  size: string;
  quantity: number;
  price: number;
  buyingPrice: number; // This will be set on the backend
  image: string;       // This will be set on the backend
  code: string[];      // New field to store product codes
}

interface IOrder {
  _id: string;
  customerName: string;
  customerNumber: string;
  otherNumber?: string;
  address1: string;
  address2?: string;
  items: IOrderItem[];
  totalAmount: number;
  approved: boolean;
  status: 'open' | 'close'; // New status field
  createdAt: Date;
  updatedAt: Date;
}

export async function POST(req: NextRequest) {
  await dbConnect();

  // Removed session and transaction as we're not modifying inventory here

  try {
    const data = await req.json();
    console.log("Received order data:", JSON.stringify(data, null, 2)); // Debugging

    const { customerName, customerNumber, otherNumber, address1, address2, items, totalAmount } = data;

    // Validate required fields
    if (!customerName || !customerNumber || !address1 || !items || items.length === 0) {
      throw new Error('Missing required fields.');
    }

    // Process each item to validate and set buyingPrice, image, and code
    const processedItems: IOrderItem[] = [];

    for (const item of items) {
      const { product, color, size, quantity, price } = item; // Exclude buyingPrice, image, and code from frontend

      // Validate product ID
      if (!mongoose.Types.ObjectId.isValid(product)) {
        throw new Error(`Invalid product ID: ${product}`);
      }

      const productId = new mongoose.Types.ObjectId(product);

      // Find the ProductType containing this product
      const productType: IProductType | null = await ProductTypes.findOne({
        'product_catagory.product._id': productId
      });

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

      // Optional: You can still validate color and size existence without modifying stock
      const colorObj = productDoc.colors.find((c: IColorQuantity) => c.color === color);
      if (!colorObj) {
        throw new Error(`Color ${color} not available for product ${productDoc.product_name}.`);
      }

      const sizeObj = productDoc.sizes.find((s: ISizeQuantity) => s.size === size);
      if (!sizeObj) {
        throw new Error(`Size ${size} not available for product ${productDoc.product_name}.`);
      }

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

      processedItems.push(processedItem);
    }

    // Create the order with default status 'open'
    const newOrder = new Order({
      customerName,
      customerNumber,
      otherNumber,
      address1,
      address2,
      items: processedItems,
      totalAmount,
      approved: false,
      status: 'open' // Set default status to 'open'
    });

    await newOrder.save();

    console.log(`Order created successfully with ID: ${newOrder._id}`);
    console.log('New Order:', newOrder); // Debugging: Log the entire order

    return NextResponse.json({ orderId: newOrder._id }, { status: 201 });

  } catch (error: any) {
    console.error('Error placing order:', error.message);
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
