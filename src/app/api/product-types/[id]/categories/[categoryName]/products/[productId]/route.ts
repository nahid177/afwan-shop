import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';

// Connect to the database
dbConnect();

// Interface Definitions
interface ISubtitle {
  title: string;
  titledetail: string;
}

interface ISizeQuantity {
  size: string;
  quantity: number;
}

interface IProduct {
  _id: mongoose.Types.ObjectId;
  product_name: string;
  code: string[];
  color: string[];
  sizes: ISizeQuantity[];
  originalPrice: number;
  offerPrice: number;
  title: string[];
  subtitle: ISubtitle[];
  description: string;
  images: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface IProductCategory {
  catagory_name: string;
  product: IProduct[];
}

interface IProductType {
  _id: mongoose.Types.ObjectId;
  types_name: string;
  product_catagory: IProductCategory[];
}

// Import the model
import { ProductTypes } from '@/models/ProductTypes';

export async function GET(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  const { productId } = params;

  console.log('Fetching product with ID:', productId);

  // Validate the productId
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    console.log('Invalid product ID:', productId);
    return NextResponse.json({ message: 'Invalid product ID' }, { status: 400 });
  }

  try {
    // Find the product across all product types and categories
    const productType = await ProductTypes.findOne({
      'product_catagory.product._id': productId,
    }).lean<IProductType>();

    if (!productType) {
      console.log('Product type not found for product ID:', productId);
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    let product: IProduct | null = null;

    // Loop through categories to find the product
    for (const category of productType.product_catagory) {
      product = category.product.find(
        (prod: IProduct) =>
          prod._id !== undefined && prod._id.toString() === productId
      ) ?? null;
      if (product) {
        console.log('Product found in category:', category.catagory_name);
        break;
      }
    }

    if (!product) {
      console.log('Product not found in any category for product ID:', productId);
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    // Return the product
    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { message: 'Error fetching product' },
      { status: 500 }
    );
  }
}
// Handle PUT request: Update a specific product in a category
export async function PUT(
  req: Request,
  { params }: { params: { id: string; categoryName: string; productId: string } }
) {
  try {
    const { id, categoryName, productId } = params;
    const body = await req.json();

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    // Find the ProductType by ID
    const productType = await ProductTypes.findById(id);

    if (!productType) {
      return NextResponse.json({ message: 'ProductType not found' }, { status: 404 });
    }

    // Find the specific category
    const category = productType.product_catagory.find(
      (cat: IProductCategory) => cat.catagory_name.toLowerCase() === categoryName.toLowerCase()
    );

    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    // Find the index of the product
    const productIndex = category.product.findIndex(
      (prod: IProduct) => prod._id.toString() === productId
    );

    if (productIndex === -1) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    // Update the product
    category.product[productIndex] = {
      ...category.product[productIndex],
      ...body,
      _id: category.product[productIndex]._id, // Ensure _id is not modified
    };

    // Save the updated ProductType
    await productType.save();

    return NextResponse.json(category.product[productIndex], { status: 200 });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ message: 'Error updating product' }, { status: 500 });
  }
}

// Handle DELETE request: Delete a specific product in a category
export async function DELETE(
  req: Request,
  { params }: { params: { id: string; categoryName: string; productId: string } }
) {
  try {
    const { id, categoryName, productId } = params;

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    // Find the ProductType by ID
    const productType = await ProductTypes.findById(id);

    if (!productType) {
      return NextResponse.json({ message: 'ProductType not found' }, { status: 404 });
    }

    // Find the specific category
    const category = productType.product_catagory.find(
      (cat: IProductCategory) => cat.catagory_name.toLowerCase() === categoryName.toLowerCase()
    );

    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    // Find the index of the product
    const productIndex = category.product.findIndex(
      (prod: IProduct) => prod._id.toString() === productId
    );

    if (productIndex === -1) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    // Remove the product
    category.product.splice(productIndex, 1);

    // Save the updated ProductType
    await productType.save();

    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ message: 'Error deleting product' }, { status: 500 });
  }
}
