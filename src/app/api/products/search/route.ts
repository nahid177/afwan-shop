// src/app/api/products/search/route.ts

import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { ProductTypes } from '@/models/ProductTypes';

dbConnect();

export const GET = async (req: NextRequest) => {
  const { searchParams } = req.nextUrl;
  const query = searchParams.get('query');

  if (!query || query.trim() === "") {
    return NextResponse.json({ message: 'Query parameter is required' }, { status: 400 });
  }

  try {
    // Escape special characters for regex matching
    const escapedQuery = query.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, '\\$&');

    // Searching for products based on product code (which is an array of strings)
    const products = await ProductTypes.aggregate([
      { $unwind: "$product_catagory" },
      { $unwind: "$product_catagory.product" },
      {
        $match: {
          // Match any product whose code array contains the query string (case-insensitive)
          "product_catagory.product.code": { $in: [escapedQuery] }
        }
      },
      { 
        $project: { 
          product: "$product_catagory.product" // Flatten the product data
        } 
      }
    ]);

    if (products.length === 0) {
      return NextResponse.json({ message: 'No products found' }, { status: 404 });
    }

    return NextResponse.json(products.map((p: any) => p.product), { status: 200 });
  } catch (error) {
    console.error('Error searching products:', error);
    return NextResponse.json({ message: 'Error fetching products' }, { status: 500 });
  }
};
