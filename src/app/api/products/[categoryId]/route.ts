import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import { ProductTypes } from '@/models/Product';
import { Types } from 'mongoose'; // Import ObjectId

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  const { typeId, categoryId, productId } = req.query;

  if (req.method === 'GET') {
    try {
      const productType = await ProductTypes.findById(typeId);
      if (!productType) return res.status(404).json({ message: 'Product type not found' });

      // Use Mongoose subdocument method `id()` to find category
      const category = productType.product_catagory.id(categoryId);
      if (!category) return res.status(404).json({ message: 'Category not found' });

      // Use Mongoose subdocument method `id()` to find product
      const product = category.product.id(productId);
      if (!product) return res.status(404).json({ message: 'Product not found' });

      res.status(200).json(product); // Return the product details
    } catch (error) {
      console.error(error); // Log the error to avoid ESLint warning
      res.status(500).json({ message: 'Error fetching product' });
    }
  } else if (req.method === 'POST') {
    const { product_name, code, color, size, quantity, originalPrice, offerPrice, title, subtitle, description, images } = req.body;

    try {
      const productType = await ProductTypes.findById(typeId);
      if (!productType) return res.status(404).json({ message: 'Product type not found' });

      const category = productType.product_catagory.id(categoryId);
      if (!category) return res.status(404).json({ message: 'Category not found' });

      // Add the new product to the category
      const newProduct = {
        _id: new Types.ObjectId(),
        product_name,
        code,
        color,
        size,
        quantity,
        originalPrice,
        offerPrice,
        title,
        subtitle,
        description,
        images,
      };

      category.product.push(newProduct); // Add product to category

      await productType.save(); // Save the changes
      res.status(201).json(newProduct); // Return the created product
    } catch (error) {
      console.error(error); // Log the error to avoid ESLint warning
      res.status(500).json({ message: 'Error adding product' });
    }
  } else if (req.method === 'PUT') {
    const { product_name, code, color, size, quantity, originalPrice, offerPrice, title, subtitle, description, images } = req.body;

    try {
      const productType = await ProductTypes.findById(typeId);
      if (!productType) return res.status(404).json({ message: 'Product type not found' });

      const category = productType.product_catagory.id(categoryId);
      if (!category) return res.status(404).json({ message: 'Category not found' });

      const product = category.product.id(productId);
      if (!product) return res.status(404).json({ message: 'Product not found' });

      // Update product fields
      product.product_name = product_name || product.product_name;
      product.code = code || product.code;
      product.color = color || product.color;
      product.size = size || product.size;
      product.quantity = quantity || product.quantity;
      product.originalPrice = originalPrice || product.originalPrice;
      product.offerPrice = offerPrice || product.offerPrice;
      product.title = title || product.title;
      product.subtitle = subtitle || product.subtitle;
      product.description = description || product.description;
      product.images = images || product.images;

      await productType.save(); // Save the changes
      res.status(200).json(product); // Return the updated product
    } catch (error) {
      console.error(error); // Log the error to avoid ESLint warning
      res.status(500).json({ message: 'Error updating product' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const productType = await ProductTypes.findById(typeId);
      if (!productType) return res.status(404).json({ message: 'Product type not found' });

      const category = productType.product_catagory.id(categoryId);
      if (!category) return res.status(404).json({ message: 'Category not found' });

      const product = category.product.id(productId);
      if (!product) return res.status(404).json({ message: 'Product not found' });

      // Remove the product from the array by using `pull()`
      category.product.pull({ _id: productId });
      await productType.save(); // Save the changes

      res.status(204).send({}); // Successfully deleted
    } catch (error) {
      console.error(error); // Log the error to avoid ESLint warning
      res.status(500).json({ message: 'Error deleting product' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
