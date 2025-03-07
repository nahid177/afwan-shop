import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { ProductTypes } from '@/models/ProductTypes';

export async function GET() {
  try {
    await dbConnect();

    const result = await ProductTypes.aggregate([
      // Unwind product categories and products
      { $unwind: '$product_catagory' },
      { $unwind: '$product_catagory.product' },
      {
        $project: {
          product: '$product_catagory.product',
        },
      },
      // Calculate total quantities for colors and sizes
      {
        $project: {
          totalColorQuantity: {
            $sum: {
              $map: {
                input: { $ifNull: ['$product.colors', []] },
                as: 'color',
                in: '$$color.quantity',
              },
            },
          },
          totalSizeQuantity: {
            $sum: {
              $map: {
                input: { $ifNull: ['$product.sizes', []] },
                as: 'size',
                in: '$$size.quantity',
              },
            },
          },
        },
      },
      // Determine total quantity per product based on availability
      {
        $project: {
          totalQuantity: {
            $cond: [
              { $gt: ['$totalColorQuantity', 0] },
              '$totalColorQuantity',
              {
                $cond: [
                  { $gt: ['$totalSizeQuantity', 0] },
                  '$totalSizeQuantity',
                  0,
                ],
              },
            ],
          },
        },
      },
      // Sum up total quantities across all products
      {
        $group: {
          _id: null,
          totalProductQuantity: { $sum: '$totalQuantity' },
        },
      },
    ]);

    const totalProductQuantity =
      result.length > 0 ? result[0].totalProductQuantity : 0;

    const response = NextResponse.json(totalProductQuantity, { status: 200 });

    // Disable caching for this response
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error: unknown) {
    console.error('Error fetching total product quantity:', error);

    let message = 'Error fetching total product quantity';
    if (error instanceof Error) {
      message = error.message;
    }

    const response = NextResponse.json(
      { message },
      { status: 500 }
    );

    // Disable caching for error responses as well
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  }
}
