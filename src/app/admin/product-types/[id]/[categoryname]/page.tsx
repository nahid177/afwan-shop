"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import AddProductForm from "@/components/Admin/product-types-page/AddProductForm";
import AdminLayoutTypesName from "@/app/admin/product-types/AdminLayoutTypesName";
import AdminLayout from "@/app/admin/AdminLayout";
import EditProductForm from "@/components/Admin/product-types-page/EditProduct";
import { IProduct } from "@/types"; // Import interfaces
import { FaTimes } from "react-icons/fa"; // Import Close Icon

const CategoryPage: React.FC = () => {
  const params = useParams();
  const { id, categoryname } = params as { id: string; categoryname: string };
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [productToEdit, setProductToEdit] = useState<IProduct | null>(null);

  // State for Image Modal
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);
  const [currentProductImages, setCurrentProductImages] = useState<string[]>([]);
  const [currentProductName, setCurrentProductName] = useState<string>("");

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get<IProduct[]>(
          `/api/product-types/${id}/categories/${categoryname}`
        );
        setProducts(response.data);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [id, categoryname]);

  // Function to handle adding a new product to the state
  const handleProductAdded = (newProduct: IProduct) => {
    setProducts((prev) => [...prev, newProduct]);
  };

  // Function to handle updating a product in the state
  const handleProductUpdated = (updatedProduct: IProduct) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product._id?.toString() === updatedProduct._id?.toString()
          ? updatedProduct
          : product
      )
    );
  };

  // Function to handle deleting a product from the state
  const handleDeleteProduct = async (productId: string | undefined) => {
    if (!productId) return;
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await axios.delete(
        `/api/product-types/${id}/categories/${categoryname}/products/${productId}`
      );

      // Remove the product from state
      setProducts((prevProducts) =>
        prevProducts.filter((product) => product._id?.toString() !== productId)
      );
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Failed to delete product.");
    }
  };

  // Function to open edit modal
  const openEditModal = (product: IProduct) => {
    setProductToEdit(product);
    setIsEditModalOpen(true);
  };

  // Function to close edit modal
  const closeEditModal = () => {
    setProductToEdit(null);
    setIsEditModalOpen(false);
  };

  // Function to open image modal
  const openImageModal = (images: string[], productName: string) => {
    setCurrentProductImages(images);
    setCurrentProductName(productName);
    setIsImageModalOpen(true);
  };

  // Function to close image modal
  const closeImageModal = () => {
    setCurrentProductImages([]);
    setCurrentProductName("");
    setIsImageModalOpen(false);
  };

  /**
   * Handle printing product info as a 38×25mm label using a hidden iframe.
   */
  const handlePrintLabel = (product: IProduct) => {
    // 1. Create a hidden iframe
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.style.visibility = "hidden";

    document.body.appendChild(iframe);

    // 2. Prepare the label HTML
    const labelHtml = `
      <html>
        <head>
          <title>Print Label - ${product.product_name}</title>
          <style>
            @page {
              size: 35mm 24mm; /* Set label size */
              margin: 0;       /* No margin for label printing */
            }
            body {
              margin: 0;
              padding: 0;
            }
            .label-container {
              width: 35mm;
              height: 24mm;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              border: 1px solid #000;
              box-sizing: border-box;
              overflow: hidden;
            }
            .product-name {
              font-size: 10px;
              font-weight: bold;
              margin: 0;
              text-align: center;
            }
            .product-info {
              font-size: 8px;
              margin: 2px 0;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="label-container">
            <p class="product-info">Code: ${product.code.join(", ")}</p>
            <p class="product-info">Size: ${product.sizes.map(s => s.size).join(", ")}</p>
            <p class="product-info">Color: ${product.colors.map(c => c.color).join(", ")}</p>
          </div>
        </body>
      </html>
    `;

    // 3. Write the HTML to the iframe
    const iframeDoc = iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(labelHtml);
      iframeDoc.close();
    } else {
      console.error("Could not access iframe document.");
      return;
    }

    // 4. Give the browser a moment to render
    setTimeout(() => {
      // 5. Trigger the print from the iframe
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();

      // 6. Remove the iframe after printing
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 500);
    }, 500);
  };

  if (loading) {
    return (
      <AdminLayout>
        <AdminLayoutTypesName>
          <div className="flex justify-center items-center h-screen">
            <p className="text-gray-500">Loading products...</p>
          </div>
        </AdminLayoutTypesName>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <AdminLayoutTypesName>
          <div className="flex justify-center items-center h-screen">
            <p className="text-red-500">{error}</p>
          </div>
        </AdminLayoutTypesName>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <AdminLayoutTypesName>
        <div className="max-w-7xl mx-auto p-6">
          <h1 className="text-4xl font-bold mb-6 text-center">
            {decodeURIComponent(categoryname)}
          </h1>

          {/* Product List */}
          <div className="mb-8">
            {products.length === 0 ? (
              <p className="text-gray-500">
                No products available in this category.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {products.map((product) => (
                  <div
                    key={product._id?.toString() ?? product.product_name}
                    className="border rounded-lg p-6 shadow-lg bg-white hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="flex flex-col items-center">
                      {/* Product Image (Only the first image) */}
                      {product.images.length > 0 ? (
                        <div
                          className="w-[300px] h-[300px] relative mb-4 cursor-pointer"
                          onClick={() =>
                            openImageModal(product.images, product.product_name)
                          }
                        >
                          <Image
                            src={product.images[0]}
                            alt={"Product Image 1"}
                            fill
                            style={{ objectFit: "cover" }}
                            className="rounded-md"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = "/fallback-image.png";
                            }}
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="w-32 h-32 flex items-center justify-center bg-gray-200 rounded-md mb-4">
                          <span className="text-gray-500">No Image</span>
                        </div>
                      )}

                      {/* Product Details */}
                      <h2 className="text-2xl font-semibold mb-2 text-center break-words">
                        {product.product_name}
                      </h2>
                      <p className="text-gray-600 mb-4 text-center">
                        {product.description}
                      </p>
                      <div className="w-full">
                        <div className="mb-2">
                          <span className="font-semibold">Original Price:</span>{" "}
                          ${product.originalPrice.toFixed(2)}
                        </div>
                        <div className="mb-2">
                          <span className="font-semibold">Offer Price:</span>{" "}
                          ${product.offerPrice.toFixed(2)}
                        </div>
                        {/* Buying Price */}
                        <div className="mb-2">
                          <span className="font-semibold">Buying Price:</span>{" "}
                          ${product.buyingPrice.toFixed(2)}
                        </div>
                        <div className="mb-2">
                          <span className="font-semibold">Codes:</span>{" "}
                          {product.code.join(", ")}
                        </div>
                        <div className="mb-2">
                          <span className="font-semibold break-words">Colors:</span>{" "}
                          {product.colors
                            .map((c) => `${c.color} (${c.quantity})`)
                            .join(", ")}
                        </div>
                        <div className="mb-2">
                          <span className="font-semibold break-words">Sizes:</span>{" "}
                          {product.sizes
                            .map((s) => `${s.size} (${s.quantity})`)
                            .join(", ")}
                        </div>
                        <div className="mb-2">
                          <span className="font-semibold">Titles:</span>{" "}
                          {product.title.join(", ")}
                        </div>
                        <div className="mb-2">
                          <span className="font-semibold">Subtitles:</span>
                          <ul className="list-disc list-inside">
                            {product.subtitle.map((sub, idx) => (
                              <li key={idx}>
                                <strong>{sub.title}:</strong> {sub.titledetail}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 mt-4 justify-center">
                        <button
                          onClick={() => openEditModal(product)}
                          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteProduct(product._id?.toString())
                          }
                          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                        >
                          Delete
                        </button>
                        {/* Print Label Button */}
                        <button
                          onClick={() => handlePrintLabel(product)}
                          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                        >
                          Print Label
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Product Form */}
          <AddProductForm
            productTypeId={id}
            categoryName={categoryname}
            onProductAdded={handleProductAdded}
          />
        </div>

        {/* Edit Product Modal */}
        {isEditModalOpen && productToEdit && (
          <EditProductForm
            productTypeId={id}
            categoryName={categoryname}
            product={productToEdit}
            onProductUpdated={handleProductUpdated}
            onClose={closeEditModal}
          />
        )}

        {/* Fullscreen Image Modal */}
        {isImageModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 overflow-auto"
            onClick={closeImageModal}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="relative w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 bg-white rounded-lg p-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                className="absolute top-4 right-4 text-gray-700 text-3xl font-bold focus:outline-none"
                onClick={closeImageModal}
                aria-label="Close"
              >
                <FaTimes />
              </button>

              {/* Modal Header */}
              <h2 className="text-2xl font-semibold mb-4 text-center">
                {currentProductName} - Images
              </h2>

              {/* Images Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {currentProductImages.map((imageUrl, index) => (
                  <div
                    key={index}
                    className="relative w-full h-48 cursor-pointer"
                    onClick={() => window.open(imageUrl, "_blank")}
                  >
                    <Image
                      src={imageUrl}
                      alt={`${currentProductName} Image ${index + 1}`}
                      fill
                      style={{ objectFit: "cover" }}
                      className="rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = "/fallback-image.png";
                      }}
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>

              {/* Optional: Instructions */}
              <p className="mt-4 text-center text-gray-600">
                Click on an image to view it in a new tab.
              </p>
            </div>
          </div>
        )}
      </AdminLayoutTypesName>
    </AdminLayout>
  );
};

export default CategoryPage;
