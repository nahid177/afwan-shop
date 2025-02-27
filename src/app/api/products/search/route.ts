import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { ProductTypes } from '@/models/ProductTypes';

// Define the product interface
interface Product {
  _id: string;
  code: string[];
  product_name: string;
  buyingPrice: number;
  originalPrice: number;
  offerPrice: number;
  totalQuantity: number;
}

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

    // Handle product code and name search with regex for flexible matching
    const products = await ProductTypes.aggregate([
      { $unwind: "$product_catagory" },
      { $unwind: "$product_catagory.product" },
      {
        $match: {
          $or: [
            { "product_catagory.product.code": { $regex: escapedQuery, $options: 'i' } }, // Search by product code
            { "product_catagory.product.product_name": { $regex: escapedQuery, $options: 'i' } } // Search by product name
          ]
        }
      },
      {
        $project: {
          product: "$product_catagory.product"
        }
      }
    ]);

    if (products.length === 0) {
      return NextResponse.json({ message: 'No products found' }, { status: 404 });
    }

    // Return product data in the correct format
    return NextResponse.json(products.map((p: { product: Product }) => p.product), { status: 200 });
  } catch (error) {
    console.error('Error searching products:', error);
    return NextResponse.json({ message: 'Error fetching products' }, { status: 500 });
  }
};
