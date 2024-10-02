import { NextResponse } from 'next/server'; 
import dbConnect from '@/lib/dbConnect';
import { ProductTypes } from '@/models/Product';

// Connect to the database before handling any requests
dbConnect();

// Handle the GET request
export async function GET() {
  try {
    const productTypes = await ProductTypes.find();
    return NextResponse.json(productTypes, { status: 200 });
  } catch (error) {
    console.error('Error fetching product types:', error);
    return NextResponse.json({ message: 'Error fetching product types' }, { status: 500 });
  }
}

// Handle the POST request
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { types_name, product_catagory } = body;

    // Ensure 'types_name' and 'product_catagory' are provided
    if (!types_name || !product_catagory) {
      return NextResponse.json({ message: 'types_name and product_catagory are required' }, { status: 400 });
    }

    // Create new product type
    const newProductType = new ProductTypes({ types_name, product_catagory });
    await newProductType.save();

    return NextResponse.json(newProductType, { status: 201 });
  } catch (error) {
    console.error('Error creating product type:', error);
    return NextResponse.json({ message: 'Error creating product type' }, { status: 500 });
  }
}
