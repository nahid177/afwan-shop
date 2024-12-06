// src/app/api/products/total-quantity/route.ts
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

    return NextResponse.json(totalProductQuantity, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching total product quantity:', error);

    let message = 'Error fetching total product quantity';
    if (error instanceof Error) {
      message = error.message;
    }

    return NextResponse.json(
      { message },
      { status: 500 }
    );
  }
}
