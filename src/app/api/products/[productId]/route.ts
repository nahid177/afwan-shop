// src/app/api/products/[productId]/route.ts

import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { ProductTypes } from '@/models/ProductTypes';
import { IProduct, IProductType } from '@/types'; // Import interfaces
import mongoose from 'mongoose';
import { NextApiRequest, NextApiResponse } from 'next';

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id, categoryName, productId } = req.query;

  console.log('Received parameters:', { id, categoryName, productId });

  // Ensure all required parameters are present
  if (!id || !categoryName || !productId) {
    console.log('Missing required parameters.');
    return res.status(400).json({ message: 'Missing required parameters.' });
  }

  // Validate the productId
  if (!mongoose.Types.ObjectId.isValid(productId as string)) {
    console.log('Invalid product ID:', productId);
    return res.status(400).json({ message: 'Invalid product ID.' });
  }

  try {
    // Find the ProductType by id
    const productType = await ProductTypes.findById(id as string).lean<IProductType>();

    if (!productType) {
      console.log('Product type not found for ID:', id);
      return res.status(404).json({ message: 'Product type not found.' });
    }

    // Find the category by categoryName (case-insensitive)
    const category = productType.product_catagory.find(
      (cat) => cat.catagory_name.toLowerCase() === (categoryName as string).toLowerCase()
    );

    if (!category) {
      console.log('Category not found:', categoryName);
      return res.status(404).json({ message: 'Category not found.' });
    }

    // Find the product by productId within the category
    const product = category.product.find(
      (prod) => prod._id?.toString() === (productId as string)
    );

    if (!product) {
      console.log('Product not found in category:', categoryName, 'for product ID:', productId);
      return res.status(404).json({ message: 'Product not found in this category.' });
    }

    // Return the product
    return res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
}