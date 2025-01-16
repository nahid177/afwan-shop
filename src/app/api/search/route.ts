// src/app/api/search/route.ts

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { ProductTypes } from "@/models/ProductTypes";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim();

  // If q is empty or missing
  if (!q) {
    return NextResponse.json(
      { error: 'Query parameter "q" is required.' },
      { status: 400 }
    );
  }

  try {
    await dbConnect();

    // We want to match `q` in any of these fields:
    //  - types_name
    //  - product_catagory.catagory_name
    //  - product_catagory.product.product_name
    const pipeline = [
      {
        $match: {
          $or: [
            { types_name: { $regex: q, $options: "i" } },
            { "product_catagory.catagory_name": { $regex: q, $options: "i" } },
            {
              "product_catagory.product.product_name": {
                $regex: q,
                $options: "i",
              },
            },
          ],
        },
      },
      // 1) Unwind the product_catagory array
      {
        $unwind: {
          path: "$product_catagory",
          preserveNullAndEmptyArrays: true,
        },
      },
      // 2) Unwind the product array
      {
        $unwind: {
          path: "$product_catagory.product",
          preserveNullAndEmptyArrays: true,
        },
      },
      // 3) Project the fields we want to return
      {
        $project: {
          // Return it as "typesName" for front-end convenience
          typesName: "$types_name",

          // This is the main _id of the "types" doc
          productTypeId: "$_id",

          // For linking to detail pages
          categoryName: "$product_catagory.catagory_name",

          // The product's own fields (renamed to match your aggregator usage)
          _id: "$product_catagory.product._id",
          productName: "$product_catagory.product.product_name",
          code: "$product_catagory.product.code",
          colors: "$product_catagory.product.colors",
          sizes: "$product_catagory.product.sizes",
          buyingPrice: "$product_catagory.product.buyingPrice",
          originalPrice: "$product_catagory.product.originalPrice",
          offerPrice: "$product_catagory.product.offerPrice",
          images: "$product_catagory.product.images",

          // Additional fields
          title: "$product_catagory.product.title",
          subtitle: "$product_catagory.product.subtitle",
          description: "$product_catagory.product.description",
        },
      },
    ];

    const products = await ProductTypes.aggregate(pipeline);
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
