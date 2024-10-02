import { z } from 'zod';

// Define the Zod schema for ISubtitle with explicit typing
const SubtitleSchema: z.ZodType<{
  title: string;
  titledetail: string;
  subtitle?: { title: string; titledetail: string; subtitle?: unknown[] }[] | undefined;
}> = z.object({
  title: z.string(),
  titledetail: z.string(),
  subtitle: z.array(z.lazy(() => SubtitleSchema)).optional(), // Lazy evaluation for recursive structure
});

// Infer the TypeScript type from Zod schema
export type ISubtitle = z.infer<typeof SubtitleSchema>;

// Define Zod schema for IProductInput
export const ProductInputSchema = z.object({
  product_name: z.string(), // Product name
  code: z.array(z.string()), // Array of strings for product code
  color: z.array(z.string()), // Array of strings for product color
  size: z.array(z.string()), // Array of strings for product sizes
  quantity: z.number().min(0), // Non-negative quantity
  originalPrice: z.number().min(0), // Non-negative price
  offerPrice: z.number().min(0), // Non-negative offer price
  title: z.array(z.string()), // Array of strings for product titles
  subtitle: z.array(SubtitleSchema).optional(), // Optional array of subtitles
  description: z.string(), // Product description
  images: z.array(z.string()), // Array of image URLs as strings
});

// Infer the TypeScript type from the ProductInputSchema
export type IProductInput = z.infer<typeof ProductInputSchema>;

// Define Zod schema for category input
export const CategoryInputSchema = z.object({
  category_name: z.string(), // Category name as string
  product: z.array(ProductInputSchema), // Array of products
});

// Infer the TypeScript type from CategoryInputSchema
export type ICategoryInput = z.infer<typeof CategoryInputSchema>;
