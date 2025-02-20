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
  // Add any other necessary fields from the product
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

    // Searching for products based on product code or name (using $regex for partial matches)
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
          product: "$product_catagory.product" // Flatten the product data
        } 
      }
    ]);

    if (products.length === 0) {
      return NextResponse.json({ message: 'No products found' }, { status: 404 });
    }

    // Map the products array to only return the 'product' data with the correct type
    return NextResponse.json(products.map((p: { product: Product }) => p.product), { status: 200 });
  } catch (error) {
    console.error('Error searching products:', error);
    return NextResponse.json({ message: 'Error fetching products' }, { status: 500 });
  }
};
