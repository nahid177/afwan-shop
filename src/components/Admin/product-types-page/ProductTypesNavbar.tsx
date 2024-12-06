"use client";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Link from "next/link";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import EditProductTypeModal from "./EditProductTypeModal";
import DeleteProductTypeModal from "./DeleteProductTypeModal";
import { IProductType, IProductCategory } from "@/types"; // Import interface from types.ts

const ProductTypesNavbar: React.FC = () => {
  const [productTypes, setProductTypes] = useState<IProductType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openDropdown, setOpenDropdown] = useState<{ [key: string]: boolean }>({});
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedProductType, setSelectedProductType] = useState<IProductType | null>(null);
  const navbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        const response = await axios.get<IProductType[]>("/api/product-types");
        setProductTypes(response.data);

        // Initialize all dropdowns as closed
        const initialDropdownState: { [key: string]: boolean } = {};
        response.data.forEach((type) => {
          const id = type._id ? type._id.toString() : '';
          if (id) {
            initialDropdownState[id] = false;
          }
        });
        setOpenDropdown(initialDropdownState);
      } catch (error) {
        console.error("Error fetching product types:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductTypes();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        navbarRef.current &&
        !navbarRef.current.contains(event.target as Node)
      ) {
        // Close all dropdowns
        setOpenDropdown({});
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = (id: string): void => {
    setOpenDropdown((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  // Function to handle editing a product type
  const editProductType = async (updatedType: IProductType): Promise<void> => {
    try {
      await axios.patch("/api/product-types", {
        _id: updatedType._id,
        types_name: updatedType.types_name,
      });
      // Update local state
      setProductTypes((prevTypes) =>
        prevTypes.map((type) =>
          type._id?.toString() === updatedType._id?.toString() ? updatedType : type
        )
      );
    } catch (error) {
      console.error("Error updating product type:", error);
    }
  };

  // Function to handle deleting a product type
  const deleteProductType = async (_id: string): Promise<void> => {
    try {
      await axios.delete("/api/product-types", {
        data: { _id },
      });
      // Update local state
      setProductTypes((prevTypes) =>
        prevTypes.filter((type) => type._id?.toString() !== _id)
      );
    } catch (error) {
      console.error("Error deleting product type:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-16 bg-gradient-to-r from-blue-500 to-purple-600">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <nav
        className="bg-gradient-to-r from-blue-500 to-purple-600 shadow rounded-3xl"
        ref={navbarRef}
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center h-16">
            {/* Navigation links */}
            <div className="flex items-center space-x-4">
              {productTypes.map((type) => {
                const id = type._id ? type._id.toString() : '';
                const key = id || type.types_name;

                return (
                  <div key={key} className="relative">
                    <div className="flex items-center">
                      {/* Product Type Name as a Link */}
                      <Link
                        href={`/admin/product-types/${encodeURIComponent(id)}`}
                        className="text-white hover:bg-white hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                      >
                        {type.types_name}
                      </Link>

                      {/* Dropdown Toggle Button */}
                      {type.product_catagory.length > 0 && (
                        <button
                          onClick={() => toggleDropdown(id)}
                          className="ml-1 focus:outline-none"
                          aria-haspopup="true"
                          aria-expanded={openDropdown[id]}
                        >
                          {openDropdown[id] ? (
                            <FiChevronUp className="text-white" />
                          ) : (
                            <FiChevronDown className="text-white" />
                          )}
                        </button>
                      )}

                      {/* Edit Button */}
                      <button
                        onClick={() => {
                          setSelectedProductType(type);
                          setIsEditModalOpen(true);
                        }}
                        className="ml-2 text-white hover:text-yellow-300 focus:outline-none"
                        title="Edit Product Type"
                      >
                        ✎
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => {
                          setSelectedProductType(type);
                          setIsDeleteModalOpen(true);
                        }}
                        className="ml-2 text-white hover:text-red-300 focus:outline-none"
                        title="Delete Product Type"
                      >
                        🗑
                      </button>
                    </div>

                    {/* Dropdown Menu */}
                    {openDropdown[id] && type.product_catagory.length > 0 && (
                      <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                        <ul className="py-1">
                          {type.product_catagory.map((category: IProductCategory) => (
                            <li key={category.catagory_name}>
                              <Link
                                href={`/admin/product-types/${encodeURIComponent(
                                  id
                                )}/${encodeURIComponent(category.catagory_name)}`} 
                                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                              >
                                {category.catagory_name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Edit Product Type Modal */}
      {isEditModalOpen && selectedProductType && (
        <EditProductTypeModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          productType={selectedProductType}
          onSave={editProductType}
        />
      )}

      {/* Delete Product Type Modal */}
      {isDeleteModalOpen && selectedProductType && (
        <DeleteProductTypeModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          productType={selectedProductType}
          onDelete={deleteProductType}
        />
      )}
    </>
  );
};

export default ProductTypesNavbar;
