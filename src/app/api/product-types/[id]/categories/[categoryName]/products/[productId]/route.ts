// src/app/api/product-types/[id]/categories/[categoryName]/products/[productId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { IProductType, ProductTypes } from '@/models/ProductTypes';
import mongoose from 'mongoose';

// Connect to the database
dbConnect();

// Interface Definitions Remain Unchanged

// Handle GET request: Retrieve a specific product
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; categoryName: string; productId: string } }
) {
  const { id, categoryName, productId } = params;

  console.log('Fetching product with ID:', productId);

  // Validate the productId and ProductType ID
  if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(id)) {
    console.log('Invalid ID(s):', id, productId);
    return NextResponse.json({ message: 'Invalid ID(s)' }, { status: 400 });
  }

  try {
    // Find the ProductType by ID
    const productType = await ProductTypes.findById(id).lean<IProductType>();

    if (!productType) {
      console.log('ProductType not found for ID:', id);
      return NextResponse.json({ message: 'ProductType not found' }, { status: 404 });
    }

    // Decode categoryName to match the database entries
    const decodedCategoryName = decodeURIComponent(categoryName);

    // Find the specific category
    const category = productType.product_catagory.find(
      (cat) => cat.catagory_name.toLowerCase() === decodedCategoryName.toLowerCase()
    );

    if (!category) {
      console.log('Category not found:', decodedCategoryName);
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    // Find the product by productId within the category
    const product = category.product.find(
      (prod) => prod._id.toString() === productId
    );

    if (!product) {
      console.log('Product not found in category:', decodedCategoryName, 'for product ID:', productId);
      return NextResponse.json({ message: 'Product not found in this category' }, { status: 404 });
    }

    // Return the product, including buyingPrice
    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ message: 'Error fetching product' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; categoryName: string; productId: string } }
) {
  const { id, categoryName, productId } = params;
  const body = await req.json();

  // Validate ObjectIds
  if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(productId)) {
    console.log('Invalid ID(s):', id, productId);
    return NextResponse.json({ message: 'Invalid ID(s)' }, { status: 400 });
  }

  try {
    // Find the ProductType by ID
    const productType = await ProductTypes.findById(id);

    if (!productType) {
      console.log('ProductType not found for ID:', id);
      return NextResponse.json({ message: 'ProductType not found' }, { status: 404 });
    }

    // Decode categoryName
    const decodedCategoryName = decodeURIComponent(categoryName);

    // Find the specific category
    const category = productType.product_catagory.find(
      (cat: { catagory_name: string; }) => cat.catagory_name.toLowerCase() === decodedCategoryName.toLowerCase()
    );

    if (!category) {
      console.log('Category not found:', decodedCategoryName);
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    // Find the product index
    const productIndex = category.product.findIndex(
      (prod: { _id: { toString: () => string; }; }) => prod._id.toString() === productId
    );

    if (productIndex === -1) {
      console.log('Product not found in category:', decodedCategoryName, 'for product ID:', productId);
      return NextResponse.json({ message: 'Product not found in this category' }, { status: 404 });
    }

    // **Validation: Ensure `buyingPrice` is present**
    if (
      body.buyingPrice === undefined ||
      body.buyingPrice === null ||
      typeof body.buyingPrice !== 'number'
    ) {
      return NextResponse.json(
        { message: '`buyingPrice` is required and must be a number.' },
        { status: 400 }
      );
    }

    // Update the product fields, including buyingPrice
    category.product[productIndex] = {
      ...category.product[productIndex],
      ...body,
      _id: category.product[productIndex]._id, // Ensure _id is not modified
    };

    // Save the updated ProductType
    await productType.save();

    // Return the updated product
    return NextResponse.json(category.product[productIndex], { status: 200 });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ message: 'Error updating product' }, { status: 500 });
  }
}

// Handle DELETE request: Delete a specific product
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; categoryName: string; productId: string } }
) {
  const { id, categoryName, productId } = params;

  // Validate ObjectIds
  if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(productId)) {
    console.log('Invalid ID(s):', id, productId);
    return NextResponse.json({ message: 'Invalid ID(s)' }, { status: 400 });
  }

  try {
    // Find the ProductType by ID
    const productType = await ProductTypes.findById(id);

    if (!productType) {
      console.log('ProductType not found for ID:', id);
      return NextResponse.json({ message: 'ProductType not found' }, { status: 404 });
    }

    // Decode categoryName
    const decodedCategoryName = decodeURIComponent(categoryName);

    // Find the specific category
    const category = productType.product_catagory.find(
      (cat: { catagory_name: string; }) => cat.catagory_name.toLowerCase() === decodedCategoryName.toLowerCase()
    );

    if (!category) {
      console.log('Category not found:', decodedCategoryName);
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    // Find the product index
    const productIndex = category.product.findIndex(
      (prod: { _id: { toString: () => string; }; }) => prod._id.toString() === productId
    );

    if (productIndex === -1) {
      console.log('Product not found in category:', decodedCategoryName, 'for product ID:', productId);
      return NextResponse.json({ message: 'Product not found in this category' }, { status: 404 });
    }

    // Remove the product from the array
    category.product.splice(productIndex, 1);

    // Save the updated ProductType
    await productType.save();

    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ message: 'Error deleting product' }, { status: 500 });
  }
}
