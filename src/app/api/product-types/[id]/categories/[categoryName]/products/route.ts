import { NextResponse } from 'next/server';
import { ProductTypes } from "@/models/ProductTypes"; // Import the ProductTypes model

// Handle GET requests
export async function GET(req: Request, { params }: { params: { id: string, categoryName: string } }) {
    const { id, categoryName } = params;
  
    if (!id || !categoryName) {
      return NextResponse.json({ message: 'Invalid parameters' }, { status: 400 });
    }
  
    try {
      // Find the product type by its ID
      const productType = await ProductTypes.findById(id);
  
      // If the product type is not found
      if (!productType) {
        return NextResponse.json({ message: 'Product type not found' }, { status: 404 });
      }
  
      // Decode the categoryName and find the category in the productType
      const category = productType.product_catagory.find(
        (cat) => cat.catagory_name === decodeURIComponent(categoryName)
      );
  
      // If the category is not found
      if (!category) {
        return NextResponse.json({ message: 'Category not found' }, { status: 404 });
      }
  
      // Return the products of the category
      return NextResponse.json(category.product);
    } catch (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json({ message: 'Server error', error }, { status: 500 });
    }
  }