// src/app/search/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FaEye, FaSpinner } from "react-icons/fa";
import { FiShoppingCart, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { useTheme } from "@/mode/ThemeContext";
import { useCart, CartItem } from "@/context/CartContext";
import Toast from "@/components/Toast/Toast";
import ChatIcon from "@/components/ChatIcon";

/* -----------------------------------------------------
   1) Data Interfaces from aggregator
   (these align with your aggregator's $project)
------------------------------------------------------ */
interface IColorQuantity {
  color: string;
  quantity: number;
}
interface ISizeQuantity {
  size: string;
  quantity: number;
}

interface Product {
  // from aggregator
  typesName?: string;
  productTypeId?: string;
  categoryName?: string;
  subCategoryName?: string;
  _id: string;         // product’s own _id
  productName: string; // aggregator calls it productName

  originalPrice?: number;
  offerPrice?: number;
  buyingPrice?: number;

  images?: string[];
  code?: string[];
  colors?: IColorQuantity[];
  sizes?: ISizeQuantity[];
}

const SearchResultsPage: React.FC = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();

  // get "q" param, handle blank
  const query = (searchParams.get("q") ?? "").trim();

  const [allResults, setAllResults] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);

  // UI
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Toast
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning">("success");

  // Cart & Modal
  const { addToCart } = useCart();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);

  /* -----------------------------------------------------
     2) Fetch aggregator partial matches from /api/search
  ------------------------------------------------------ */
  useEffect(() => {
    const fetchSearch = async () => {
      // If user typed only spaces or nothing, show error
      if (!query) {
        setError("Please enter a search query.");
        setLoading(false);
        return;
      }
      try {
        const resp = await axios.get(`/api/search?q=${encodeURIComponent(query)}`);
        const data = resp.data?.products || [];
        setAllResults(data);
      } catch (err) {
        console.error("Search error:", err);
        setError("Failed to fetch search results.");
      } finally {
        setLoading(false);
      }
    };
    fetchSearch();
  }, [query]);

  /* -----------------------------------------------------
     3) EXACT match logic (case-insensitive, ignoring extra spaces)
  ------------------------------------------------------ */
  useEffect(() => {
    if (!allResults || allResults.length === 0) {
      setFiltered([]);
      return;
    }

    // Normalize user query: trim, lowerCase, collapse multiple spaces
    const normalizedQuery = query
      .toLowerCase()
      .replace(/\s+/g, " ");

    // helper to do same to product fields
    const normalize = (str: string) =>
      str
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

    // 1) typesName
    const hasTypesName = allResults.some((doc) =>
      doc.typesName && normalize(doc.typesName) === normalizedQuery
    );
    if (hasTypesName) {
      setFiltered(
        allResults.filter(
          (doc) => doc.typesName && normalize(doc.typesName) === normalizedQuery
        )
      );
      return;
    }

    // 2) categoryName
    const hasCategory = allResults.some((doc) =>
      doc.categoryName && normalize(doc.categoryName) === normalizedQuery
    );
    if (hasCategory) {
      setFiltered(
        allResults.filter(
          (doc) =>
            doc.categoryName && normalize(doc.categoryName) === normalizedQuery
        )
      );
      return;
    }

    // 3) subCategoryName
    const hasSubCat = allResults.some((doc) =>
      doc.subCategoryName && normalize(doc.subCategoryName) === normalizedQuery
    );
    if (hasSubCat) {
      setFiltered(
        allResults.filter(
          (doc) =>
            doc.subCategoryName &&
            normalize(doc.subCategoryName) === normalizedQuery
        )
      );
      return;
    }

    // 4) productName
    const hasProdName = allResults.some((doc) =>
      doc.productName && normalize(doc.productName) === normalizedQuery
    );
    if (hasProdName) {
      const exactProd = allResults.filter(
        (doc) =>
          doc.productName && normalize(doc.productName) === normalizedQuery
      );
      setFiltered(exactProd);
      return;
    }

    // 5) If no EXACT match => show 0 results
    setFiltered([]);
  }, [allResults, query]);

  /* -----------------------------------------------------
     4) Modal open/close
  ------------------------------------------------------ */
  const openModal = (prod: Product) => {
    setSelectedProduct(prod);
    if (prod.colors && prod.colors.length > 0) {
      setSelectedColor(prod.colors[0].color);
    } else {
      setSelectedColor("");
    }
    if (prod.sizes && prod.sizes.length > 0) {
      setSelectedSize(prod.sizes[0].size);
    } else {
      setSelectedSize("");
    }
    setQuantity(1);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setSelectedColor("");
    setSelectedSize("");
    setQuantity(1);
  };

  const incrementQuantity = () => {
    if (!selectedProduct?.sizes) return;
    const foundSize = selectedProduct.sizes.find(
      (s) => s.size === selectedSize
    );
    const maxQuantity = foundSize ? foundSize.quantity : 1;
    setQuantity((prev) => Math.min(prev + 1, maxQuantity));
  };

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(prev - 1, 1));
  };

  /* -----------------------------------------------------
     5) Add to Cart / Buy Now
  ------------------------------------------------------ */
  const handleAddToCart = () => {
    if (!selectedProduct) return;
    const cartItem: CartItem = {
      id: selectedProduct._id,
      name: selectedProduct.productName,
      price: selectedProduct.offerPrice || selectedProduct.originalPrice || 0,
      buyingPrice: selectedProduct.buyingPrice || 0,
      quantity,
      imageUrl: selectedProduct.images?.[0] || "/placeholder.png",
      color: selectedColor,
      size: selectedSize,
      code: selectedProduct.code || [],
    };
    addToCart(cartItem);
    setToastMessage("Product added to cart!");
    setToastType("success");
    setToastVisible(true);
    closeModal();
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/place-order");
  };

  /* -----------------------------------------------------
     6) Render 
  ------------------------------------------------------ */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-gray-500" />
      </div>
    );
  }

  return (
    <div
      className={`w-full mx-auto px-4 py-6 ${
        theme === "light" ? "bg-white text-black" : "bg-gray-900 text-white"
      }`}
    >
      <ChatIcon />

      {/* Toast */}
      {toastVisible && (
        <div className="fixed top-4 right-4 z-50">
          <Toast
            type={toastType}
            message={toastMessage}
            onClose={() => setToastVisible(false)}
          />
        </div>
      )}

      {/* Breadcrumb */}
      <div className={`mb-4 text-gray-600 ${theme === "light" ? "" : "text-gray-400"}`}>
        <Link href="/">
          <span className="hover:underline">Home</span>
        </Link>
        {" / "}
        <span className="font-bold">Search Results for &quot;{query}&quot;</span>
      </div>

      <h1 className="text-2xl font-semibold mb-6">
        Search Results for &quot;{query}&quot;
      </h1>

      {/* error */}
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* no results */}
      {!error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center text-gray-600">
          <p className="text-lg font-medium">No products found.</p>
        </div>
      )}

      {/* EXACT matches */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filtered.map((p) => (
            <div
              key={p._id}
              className={`border p-3 rounded-lg shadow-md hover:shadow-lg transition-shadow ${
                theme === "light" ? "bg-white text-black" : "bg-gray-800 text-white"
              }`}
            >
              <div className="mb-1">
                <Link
                  href={`/products/details/${p.productTypeId || "unknown"}/${p.categoryName || "unknown"}/${p._id}`}
                >
                  <Image
                    src={p.images?.[0] || "/placeholder.png"}
                    alt={p.productName}
                    width={300}
                    height={300}
                    className="w-full h-28 md:h-60 lg:h-72 object-cover rounded transition-transform hover:scale-105"
                  />
                </Link>
              </div>

              <Link
                href={`/products/details/${p.productTypeId || "unknown"}/${p.categoryName || "unknown"}/${p._id}`}
              >
                <h3 className="text-xs font-medium mb-2 text-center hover:text-blue-400 transition-colors">
                  {p.productName}
                </h3>
              </Link>

              <div className="flex gap-3 justify-center mb-4">
                {p.offerPrice && (
                  <span className="text-red-500 text-xs md:text-base lg:text-base font-bold">
                    {p.offerPrice.toFixed(0)}৳
                  </span>
                )}
              </div>

              {/* "Buy Now" button */}
                <button
                  onClick={() => openModal(p)}
                  className="btn-gradient-blue flex items-center justify-center w-full lg:text-xs md:text-xs text-[9px] py-2 px-2 rounded-lg transition-transform hover:scale-105 mb-4"
                  aria-label={`Buy now ${p.productName}`}
                >
                  <FiShoppingCart className="mr-2 mb-1" />
                  Buy Now
                </button>
                <Link
                href={`/products/details/${p.productTypeId || "unknown"}/${p.categoryName || "unknown"}/${p._id}`}
              >
                <button
            className={`flex items-center justify-center w-full text-xs   py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all ${theme === "light" ? "" : "bg-gray-700 text-white"}`}
          >
            <FaEye className="mr-2" />
            <span>See Details</span>
          </button>
        </Link>
              </div>
          ))}
        </div>
      )}


      {/* ============= "Buy Now" / "Add to Cart" Modal ============= */}
      {isModalOpen && selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          role="dialog"
          aria-modal="true"
        >
          <div
            className={`bg-white dark:bg-gray-800 rounded-lg p-6 w-11/12 sm:w-3/4 md:w-1/2 lg:w-1/2 ${
              theme === "light" ? "text-black" : "text-white"
            }`}
          >
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-center">
              Select Options
            </h2>

            {/* If product has colors */}
            {selectedProduct.colors && selectedProduct.colors.length > 0 && (
              <div className="mb-4 flex">
                <label className="mr-2 text-sm mb-2 font-medium">Color:</label>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.colors.map((cItem, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedColor(cItem.color);
                        setQuantity(1);
                      }}
                      className={`px-3 py-1 rounded-full border ${
                        selectedColor === cItem.color
                          ? "bg-blue-500 text-white"
                          : "bg-transparent text-gray-700 dark:text-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      aria-pressed={selectedColor === cItem.color}
                    >
                      {cItem.color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* If product has sizes */}
            {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
              <div className="mb-4 flex">
                <label className="mr-2 text-sm mb-2 font-medium">Size:</label>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.sizes.map((sItem, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedSize(sItem.size);
                        setQuantity(1);
                      }}
                      className={`px-3 py-1 rounded-full border ${
                        selectedSize === sItem.size
                          ? "bg-green-500 text-white"
                          : "bg-transparent text-gray-700 dark:text-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-green-500`}
                      aria-pressed={selectedSize === sItem.size}
                    >
                      {sItem.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-4">
              <label
                className={`block mb-2 text-sm font-medium ${
                  theme === "light" ? "text-gray-800" : "text-gray-200"
                }`}
              >
                Quantity:
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={decrementQuantity}
                  className={`px-3 py-1 rounded-lg ${
                    theme === "light"
                      ? "bg-gray-300 hover:bg-gray-400"
                      : "bg-gray-700 hover:bg-gray-600"
                  } transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val >= 1) {
                      if (selectedProduct.sizes && selectedSize) {
                        const foundSize = selectedProduct.sizes.find(
                          (sz) => sz.size === selectedSize
                        );
                        const maxQ = foundSize ? foundSize.quantity : 1;
                        setQuantity(val > maxQ ? maxQ : val);
                      } else {
                        setQuantity(val);
                      }
                    }
                  }}
                  className={`w-16 text-center border rounded-lg px-2 py-1 ${
                    theme === "light"
                      ? "border-gray-400 bg-white text-gray-800"
                      : "border-gray-600 bg-gray-800 text-gray-200"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  min={1}
                />
                <button
                  onClick={incrementQuantity}
                  className={`px-3 py-1 rounded-lg ${
                    theme === "light"
                      ? "bg-gray-300 hover:bg-gray-400"
                      : "bg-gray-700 hover:bg-gray-600"
                  } transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  +
                </button>
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="xl:flex lg:flex space-y-4 justify-end gap-4">
              <div className="xl:mt-[15px] lg:mt-[15px]">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-2 flex text-xs py-2 items-center bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  <FiXCircle className="mr-2" />
                  Cancel
                </button>
              </div>

              <div className="flex sm:flex-row gap-2">
                <button
                  onClick={handleAddToCart}
                  className="flex text-xs items-center px-2 py-2 btn-gradient-blue rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={
                    (selectedProduct.colors && selectedProduct.colors.length > 0 && !selectedColor) ||
                    (selectedProduct.sizes && selectedProduct.sizes.length > 0 && !selectedSize) ||
                    quantity < 1
                  }
                >
                  <FiShoppingCart className="mr-2" />
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex text-xs items-center px-2 py-2 btn-gradient-blue rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={
                    (selectedProduct.colors && selectedProduct.colors.length > 0 && !selectedColor) ||
                    (selectedProduct.sizes && selectedProduct.sizes.length > 0 && !selectedSize) ||
                    quantity < 1
                  }
                >
                  <FiCheckCircle className="mr-2" />
                  Confirm Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;
