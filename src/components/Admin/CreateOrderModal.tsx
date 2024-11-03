// src/components/Admin/CreateOrderModal.tsx

"use client";

import React, { useState } from 'react';
import { 
  IStoreOrder, 
  IProductType, 
  IOrderProduct, 
  IProduct, 
  IColorQuantity, 
  ISizeQuantity 
} from '@/types'; // Ensure these interfaces are defined and exported
import { FaTimes } from 'react-icons/fa';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  productType: IProductType;
  onCreateOrder: (orderData: Omit<IStoreOrder, '_id'>) => void; // Exclude _id for creation
}

const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ isOpen, onClose, productType, onCreateOrder }) => {
  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [selectedProducts, setSelectedProducts] = useState<IOrderProduct[]>([]);

  if (!isOpen) return null;

  const handleProductSelection = (product: IOrderProduct) => {
    const existingProductIndex = selectedProducts.findIndex(
      (p) => p.productId === product.productId && p.color === product.color && p.size === product.size
    );

    if (existingProductIndex > -1) {
      const updatedProducts = [...selectedProducts];
      updatedProducts[existingProductIndex].quantity += product.quantity;
      setSelectedProducts(updatedProducts);
    } else {
      setSelectedProducts([
        ...selectedProducts,
        product,
      ]);
    }
  };

  const handleRemoveProduct = (index: number) => {
    const updatedProducts = [...selectedProducts];
    updatedProducts.splice(index, 1);
    setSelectedProducts(updatedProducts);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic Validation
    if (!customerName || !customerEmail || !customerPhone || selectedProducts.length === 0) {
      alert('Please fill in all customer details and select at least one product.');
      return;
    }

    // Calculate total amount
    const totalAmount = selectedProducts.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const orderData: Omit<IStoreOrder, '_id'> = {
      customerName,
      customerEmail,
      customerPhone,
      products: selectedProducts.map((item) => ({
        product: item.productId,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
      })),
      totalAmount,
      // status: 'Pending', // Removed as per your request
    };

    onCreateOrder(orderData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-11/12 md:w-3/4 lg:w-1/2 max-h-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create Store Order</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {/* Customer Details */}
          <div className="mb-4">
            <label className="block mb-2 font-medium">Customer Name:</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Customer Email:</label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Customer Phone:</label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>

          {/* Product Selection */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Select Products:</h3>
            {productType.product_catagory.map((category, index) => (
              <div key={category.catagory_name} className="mb-4">
                <h4 className="font-medium">{category.catagory_name}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {category.product.map((product, prodIndex) => (
                    <ProductSelectionCard
                      key={product._id ? product._id.toString() : `product-${index}-${prodIndex}`} // Ensure key is string
                      product={product}
                      onSelect={handleProductSelection}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Selected Products */}
          {selectedProducts.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Selected Products:</h3>
              <ul>
                {selectedProducts.map((item, index) => (
                  <li key={index} className="flex justify-between items-center mb-2">
                    <span>
                      {item.productName} - {item.color} - {item.size} x {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
              <p className="mt-2 font-semibold">
                Total Amount: ${selectedProducts.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              disabled={selectedProducts.length === 0}
            >
              Create Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Component for selecting a product with color, size, and quantity
interface ProductSelectionCardProps {
  product: IProduct;
  onSelect: (product: IOrderProduct) => void;
}

const ProductSelectionCard: React.FC<ProductSelectionCardProps> = ({ product, onSelect }) => {
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  const handleSelect = () => {
    if (selectedColor && selectedSize && quantity > 0) {
      onSelect({
        productId: product._id ? product._id.toString() : '', // Ensure productId is a string
        productName: product.product_name,
        color: selectedColor,
        size: selectedSize,
        quantity,
        price: product.offerPrice,
      });
      // Reset selections
      setSelectedColor('');
      setSelectedSize('');
      setQuantity(1);
    } else {
      alert('Please select color, size, and specify quantity.');
    }
  };

  return (
    <div className="border p-2 rounded-lg">
      <h5 className="font-medium mb-2">{product.product_name}</h5>
      {/* Color Selection */}
      <div className="mb-2">
        <label className="block text-sm">Color:</label>
        <select
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
          className="w-full p-1 border rounded-lg"
        >
          <option value="">Select Color</option>
          {product.colors.map((colorItem: IColorQuantity) => (
            <option key={colorItem.color} value={colorItem.color} disabled={colorItem.quantity === 0}>
              {colorItem.color} {colorItem.quantity === 0 && '(Out of Stock)'}
            </option>
          ))}
        </select>
      </div>
      {/* Size Selection */}
      <div className="mb-2">
        <label className="block text-sm">Size:</label>
        <select
          value={selectedSize}
          onChange={(e) => setSelectedSize(e.target.value)}
          className="w-full p-1 border rounded-lg"
        >
          <option value="">Select Size</option>
          {product.sizes.map((sizeItem: ISizeQuantity) => (
            <option key={sizeItem.size} value={sizeItem.size} disabled={sizeItem.quantity === 0}>
              {sizeItem.size} {sizeItem.quantity === 0 && '(Out of Stock)'}
            </option>
          ))}
        </select>
      </div>
      {/* Quantity Selection */}
      <div className="mb-2">
        <label className="block text-sm">Quantity:</label>
        <input
          type="number"
          min={1}
          max={10}
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          className="w-full p-1 border rounded-lg"
        />
      </div>
      {/* Select Button */}
      <button
        type="button"
        onClick={handleSelect}
        className="w-full mt-2 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Select
      </button>
    </div>
  );
};

export default CreateOrderModal;
