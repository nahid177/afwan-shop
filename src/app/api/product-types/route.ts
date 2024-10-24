// src/app/api/product-types/route.ts

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { ProductTypes } from '@/models/ProductTypes';

// Connect to the database before handling any requests
dbConnect();

// Handle the GET request
export async function GET() {
  try {
    const productTypes = await ProductTypes.find();
    return NextResponse.json(productTypes, { status: 200 });
  } catch (error) {
    console.error('Error fetching product types:', error);
    return NextResponse.json(
      { message: 'Error fetching product types' },
      { status: 500 }
    );
  }
}

// Handle the POST request
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { types_name, product_catagory } = body;

    // Ensure 'types_name' and 'product_catagory' are provided
    if (!types_name || !product_catagory) {
      return NextResponse.json(
        { message: 'types_name and product_catagory are required' },
        { status: 400 }
      );
    }

    // Create new product type
    const newProductType = new ProductTypes({ types_name, product_catagory });
    await newProductType.save();

    return NextResponse.json(newProductType, { status: 201 });
  } catch (error) {
    console.error('Error creating product type:', error);
    return NextResponse.json(
      { message: 'Error creating product type' },
      { status: 500 }
    );
  }
}
// Handle the PATCH request to edit a product type
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { _id, types_name } = body;

    if (!_id) {
      return NextResponse.json(
        { message: '_id is required to update a product type' },
        { status: 400 }
      );
    }

    if (!types_name || types_name.trim() === '') {
      return NextResponse.json(
        { message: 'types_name is required and cannot be empty' },
        { status: 400 }
      );
    }

    const productType = await ProductTypes.findById(_id);
    if (!productType) {
      return NextResponse.json(
        { message: 'Product type not found' },
        { status: 404 }
      );
    }

    // Check if another product type with the same name exists
    const nameExists = await ProductTypes.findOne({
      types_name: types_name.trim(),
      _id: { $ne: _id },
    });

    if (nameExists) {
      return NextResponse.json(
        { message: 'A product type with this name already exists' },
        { status: 400 }
      );
    }

    // Update the types_name
    productType.types_name = types_name.trim();
    await productType.save();

    return NextResponse.json(productType, { status: 200 });
  } catch (error) {
    console.error('Error updating product type:', error);
    return NextResponse.json(
      { message: 'Error updating product type' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { _id } = body;

    if (!_id) {
      return NextResponse.json(
        { message: '_id is required to delete a product type' },
        { status: 400 }
      );
    }

    const productType = await ProductTypes.findById(_id);
    if (!productType) {
      return NextResponse.json(
        { message: 'Product type not found' },
        { status: 404 }
      );
    }

    // Use deleteOne() instead of remove()
    await productType.deleteOne();

    return NextResponse.json(
      { message: 'Product type deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting product type:', error);
    return NextResponse.json(
      { message: 'Error deleting product type' },
      { status: 500 }
    );
  }
}