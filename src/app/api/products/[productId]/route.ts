// src/app/api/products/[productId]/route.ts

import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { ProductTypes } from '@/models/ProductTypes';
import { IProduct, IProductType } from '@/types'; // Import interfaces
import mongoose from 'mongoose';

dbConnect();

export async function GET(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  const { productId } = params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return NextResponse.json({ message: 'Invalid product ID' }, { status: 400 });
  }

  try {
    // Find the product across all product types and categories
    const productType = await ProductTypes.findOne({
      'product_catagory.product._id': productId,
    }).lean<IProductType>();

    if (!productType) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    let product: IProduct | null = null;

    // Loop through categories to find the product
    for (const category of productType.product_catagory) {
      product =
        category.product.find(
          (prod: IProduct) =>
            prod._id !== undefined && prod._id.toString() === productId
        ) ?? null;
      if (product) break;
    }

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { message: 'Error fetching product' },
      { status: 500 }
    );
  }
}
