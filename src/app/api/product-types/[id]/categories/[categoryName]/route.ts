import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { ProductTypes } from '@/models/ProductTypes';
import mongoose from 'mongoose';

// Connect to the database
dbConnect();

// Handle PATCH request for adding products to a specific category within a ProductType
export async function PATCH(req: Request, { params }: { params: { id: string; categoryName: string } }) {
  try {
    const body = await req.json();
    const { product } = body;

    // Ensure the product array is provided
    if (!product || !Array.isArray(product)) {
      return NextResponse.json({ message: 'Product array is required' }, { status: 400 });
    }

    const productTypeId = params.id; // Now using id from params
    const categoryName = params.categoryName;

    // Check if the provided id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(productTypeId)) {
      return NextResponse.json({ message: 'Invalid ProductType ID' }, { status: 400 });
    }

    // Find ProductType by ID and update the category/product
    const productType = await ProductTypes.findById(productTypeId); // Find by id now
    if (!productType) {
      return NextResponse.json({ message: 'ProductType not found' }, { status: 404 });
    }

    // Find the specific category in the product type
    const categoryIndex = productType.product_catagory.findIndex(
      (category: { catagory_name: string; }) => category.catagory_name === categoryName
    );

    if (categoryIndex >= 0) {
      // If the category exists, add the new product to the existing category
      productType.product_catagory[categoryIndex].product.push(...product);
    } else {
      // If the category does not exist, return a 404 error
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    // Save the updated ProductType
    await productType.save();

    // Return the updated product type
    return NextResponse.json(productType, { status: 200 });
  } catch (error) {
    console.error('Error updating product type:', error);
    return NextResponse.json({ message: 'Error updating product type' }, { status: 500 });
  }
}
