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
  images: string[];
  _id: mongoose.Types.ObjectId;
  product_name: string;
  code: string[];
  sizes: ISizeQuantity[];
  colors: IColorQuantity[];
  buyingPrice: number;
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
  buyingPrice: number; 
  image: string;       
  code: string[];      
}

export async function POST(req: NextRequest) {
  await dbConnect();

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
      const { product, color, size, quantity, price } = item;

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

      // Validate color existence
      const colorObj = productDoc.colors.find((c) => c.color === color);
      if (!colorObj) {
        throw new Error(`Color ${color} not available for product ${productDoc.product_name}.`);
      }

      // Validate size existence
      const sizeObj = productDoc.sizes.find((s) => s.size === size);
      if (!sizeObj) {
        throw new Error(`Size ${size} not available for product ${productDoc.product_name}.`);
      }

      // Fetch buyingPrice, image, and code
      const { buyingPrice, images, code } = productDoc;
      const image = images[0] || ''; 

      const processedItem: IOrderItem = {
        product: productId,
        name: productDoc.product_name,
        color,
        size,
        quantity,
        price,
        buyingPrice,
        image,
        code,
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
      status: 'open'
    });

    await newOrder.save();

    console.log(`Order created successfully with ID: ${newOrder._id}`);
    console.log('New Order:', newOrder);

    return NextResponse.json({ orderId: newOrder._id }, { status: 201 });

  } catch (error: unknown) {
    let errorMessage = 'Unknown error occurred.';
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error('Error placing order:', errorMessage);
    }
    return NextResponse.json({ message: errorMessage }, { status: 400 });
  }
}
