// src/app/api/products/search/route.ts

import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { ProductTypes } from '@/models/ProductTypes'; // Assuming this is where the Product model is defined

dbConnect();

export const GET = async (req: NextRequest) => {
  const { searchParams } = req.nextUrl; // Get search parameters from URL

  const query = searchParams.get('query'); // Get query parameter

  if (!query || query.trim() === "") {
    return NextResponse.json({ message: 'Query parameter is required' }, { status: 400 });
  }

  try {
    // Escape special characters in the query for product name matching
    const escapedQuery = query.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, '\\$&'); // Escape special regex characters

    // Searching for products based on code or product name
    const products = await ProductTypes.aggregate([
      { $unwind: "$product_catagory" },
      { $unwind: "$product_catagory.product" },
      {
        $match: {
          $or: [
            { "product_catagory.product.product_name": { $regex: escapedQuery, $options: 'i' } }, // Case-insensitive search by name
            { "product_catagory.product.code": { $regex: `^${escapedQuery}$`, $options: 'i' } }, // Exact match for product code, handling special characters
          ]
        }
      },
      { $project: { "product_catagory.product": 1 } },
    ]);

    if (products.length === 0) {
      return NextResponse.json({ message: 'No products found' }, { status: 404 });
    }

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error('Error searching products:', error);
    return NextResponse.json({ message: 'Error fetching products' }, { status: 500 });
  }
};
