import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { IProductCategory, ProductTypes } from '@/models/Product';
import { AnyKeys, AnyObject } from 'mongoose';

// Connect to the database
dbConnect();

// Handle PATCH requests for updating an existing ProductType
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { product_catagory } = body;

    // Find ProductType by ID and update the category/product
    const productType = await ProductTypes.findById(params.id);
    if (!productType) {
      return NextResponse.json({ message: 'ProductType not found' }, { status: 404 });
    }

    product_catagory.forEach((newCategory: AnyKeys<IProductCategory> & AnyObject) => {
      const existingCategoryIndex = productType.product_catagory.findIndex(
        (category) => category.catagory_name === newCategory.catagory_name
      );
      if (existingCategoryIndex >= 0) {
        // Append new products to the existing category
        productType.product_catagory[existingCategoryIndex].product.push(...newCategory.product);
      } else {
        // Add new category if it doesn't exist
        productType.product_catagory.push(newCategory);
      }
    });

    await productType.save();
    return NextResponse.json(productType, { status: 200 });
  } catch (error) {
    console.error('Error updating product type:', error);
    return NextResponse.json({ message: 'Error updating product type' }, { status: 500 });
  }
}
