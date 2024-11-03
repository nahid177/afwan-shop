"use client";

import React, { useState, useEffect } from 'react';
import {
    IStoreOrder,
    IProductType,
    IOrderProduct
} from '@/types';
import { FaTimes } from 'react-icons/fa';

interface CreateOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    productType: IProductType;
    onCreateOrder: (orderData: Omit<IStoreOrder, '_id'>) => void;
}

const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ isOpen, onClose, productType, onCreateOrder }) => {
    const [customerName, setCustomerName] = useState<string>('');
    const [customerEmail, setCustomerEmail] = useState<string>('');
    const [customerPhone, setCustomerPhone] = useState<string>('');
    const [selectedProducts, setSelectedProducts] = useState<IOrderProduct[]>([]);
    const [discount, setDiscount] = useState<number>(0);
    const [totalAmount, setTotalAmount] = useState<number>(0);

    useEffect(() => {
        if (isOpen) {
            // Reset fields when modal is opened
            setCustomerName('');
            setCustomerEmail('');
            setCustomerPhone('');
            setSelectedProducts([]);
            setDiscount(0);
            setTotalAmount(0);
        }
    }, [isOpen]);

    useEffect(() => {
        // Calculate total amount whenever selectedProducts change
        const calculatedTotal = selectedProducts.reduce((acc, item) => acc + item.price * item.quantity, 0);
        setTotalAmount(calculatedTotal); // Set totalAmount automatically
    }, [selectedProducts]);

    const handleProductSelection = (product: IOrderProduct) => {
        const existingProductIndex = selectedProducts.findIndex(
            (p) => p.productId === product.productId && p.color === product.color && p.size === product.size
        );

        if (existingProductIndex > -1) {
            const updatedProducts = [...selectedProducts];
            updatedProducts[existingProductIndex].quantity += product.quantity;
            setSelectedProducts(updatedProducts);
        } else {
            setSelectedProducts([...selectedProducts, product]);
        }
    };

    const handleRemoveProduct = (index: number) => {
        const updatedProducts = [...selectedProducts];
        updatedProducts.splice(index, 1);
        setSelectedProducts(updatedProducts);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!customerName || !customerEmail || !customerPhone || selectedProducts.length === 0) {
            alert('Please fill in all customer details and select at least one product.');
            return;
        }

        const finalAmount = Math.max(totalAmount - discount, 0);

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
            totalAmount: finalAmount,
        };

        onCreateOrder(orderData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Create Store Order</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <FaTimes size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Customer Details */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-lg font-medium text-gray-700 dark:text-gray-200">Customer Name</label>
                            <input
                                type="text"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-lg font-medium text-gray-700 dark:text-gray-200">Customer Email</label>
                            <input
                                type="email"
                                value={customerEmail}
                                onChange={(e) => setCustomerEmail(e.target.value)}
                                className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-lg font-medium text-gray-700 dark:text-gray-200">Customer Phone</label>
                            <input
                                type="tel"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>

                    {/* Product Selection */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Select Products</h3>
                        <div className="space-y-4">
                            {productType.product_catagory.map((category) => (
                                <div key={category.catagory_name} className="mb-6">
                                    <h4 className="text-md font-medium text-gray-600 dark:text-gray-300 mb-2">{category.catagory_name}</h4>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {category.product.map((product, prodIndex) => (
                                            <ProductSelectionCard
                                                key={product._id ? product._id.toString() : `product-${prodIndex}`}
                                                product={{
                                                    _id: product._id ? product._id.toString() : '',
                                                    product_name: product.product_name,
                                                    colors: product.colors,
                                                    sizes: product.sizes,
                                                    offerPrice: product.offerPrice,
                                                }}
                                                onSelect={handleProductSelection}
                                            />
                                        ))}
                                    </div>

                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Selected Products */}
                    {selectedProducts.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Selected Products</h3>
                            <ul className="space-y-2">
                                {selectedProducts.map((item, index) => (
                                    <li key={index} className="flex justify-between items-center bg-gray-100 p-2 rounded-lg shadow">
                                        <span className="text-gray-700 dark:text-gray-200">
                                            {item.productName} - {item.color} - {item.size} x {item.quantity}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveProduct(index)}
                                            className="text-red-500 hover:text-red-700 font-semibold"
                                        >
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <p className="mt-4 font-semibold text-gray-900 dark:text-gray-100">
                                Total Amount: ${totalAmount.toFixed(2)}
                            </p>
                            <div className="mt-2">
                                <label className="block text-lg font-medium text-gray-700 dark:text-gray-200">Discount</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={discount}
                                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                    className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <p className="mt-4 font-semibold text-gray-900 dark:text-gray-100">
                                Final Amount (after discount): ${Math.max(totalAmount - discount, 0).toFixed(2)}
                            </p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="mt-6 flex justify-end">
                        <button
                            type="submit"
                            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-lg"
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

// Define the ProductSelectionCard component
interface ProductSelectionCardProps {
    product: {
        _id: string;
        product_name: string;
        colors: Array<{ color: string; quantity: number }>;
        sizes: Array<{ size: string; quantity: number }>;
        offerPrice: number;
    };
    onSelect: (product: IOrderProduct) => void;
}

const ProductSelectionCard: React.FC<ProductSelectionCardProps> = ({ product, onSelect }) => {
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1);

    const handleSelect = () => {
        if (selectedColor && selectedSize && quantity > 0) {
            onSelect({
                productId: product._id,
                productName: product.product_name,
                color: selectedColor,
                size: selectedSize,
                quantity,
                price: product.offerPrice,
            });
            setSelectedColor('');
            setSelectedSize('');
            setQuantity(1);
        } else {
            alert('Please select color, size, and specify quantity.');
        }
    };

    return (
        <div className="border p-4 rounded-lg shadow-md">
            <h5 className="font-medium text-gray-700 dark:text-gray-200 mb-2">{product.product_name}</h5>
            <div className="mb-2">
                <label className="block text-sm text-gray-600 dark:text-gray-300">Color:</label>
                <select
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Select Color</option>
                    {product.colors.map((colorItem) => (
                        <option key={colorItem.color} value={colorItem.color} disabled={colorItem.quantity === 0}>
                            {colorItem.color} {colorItem.quantity === 0 && '(Out of Stock)'}
                        </option>
                    ))}
                </select>
            </div>
            <div className="mb-2">
                <label className="block text-sm text-gray-600 dark:text-gray-300">Size:</label>
                <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Select Size</option>
                    {product.sizes.map((sizeItem) => (
                        <option key={sizeItem.size} value={sizeItem.size} disabled={sizeItem.quantity === 0}>
                            {sizeItem.size} {sizeItem.quantity === 0 && '(Out of Stock)'}
                        </option>
                    ))}
                </select>
            </div>
            <div className="mb-2">
                <label className="block text-sm text-gray-600 dark:text-gray-300">Quantity:</label>
                <input
                    type="number"
                    min={1}
                    max={10}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <button
                type="button"
                onClick={handleSelect}
                className="w-full mt-3 px-3 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 shadow-md"
            >
                Select
            </button>
        </div>
    );
};

export default CreateOrderModal;
export { ProductSelectionCard };
