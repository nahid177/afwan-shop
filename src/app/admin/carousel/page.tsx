"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image'; // Import Image from next/image
import { FaEdit, FaTrash } from 'react-icons/fa'; // Icons for Edit and Delete
import { toast } from 'react-toastify'; // Assuming you are using react-toastify for notifications

interface CarouselItem {
  _id: string;
  name: string;
  imageUrl: string;
  link: string;
}

const Page = () => {
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editableItem, setEditableItem] = useState<CarouselItem | null>(null);

  // Fetch carousel data when the component mounts
  useEffect(() => {
    const fetchCarouselItems = async () => {
      try {
        const response = await axios.get('/api/carousel/get');
        setCarouselItems(response.data);
      } catch (error) {
        console.error("Error fetching carousel items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCarouselItems();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const response = await axios.delete(`/api/carousel/delete/${id}`);
      if (response.status === 200) {
        setCarouselItems(carouselItems.filter(item => item._id !== id));
        toast.success('Item deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Error deleting item');
    }
  };
  
  // Handle edit action
  const handleEdit = (item: CarouselItem) => {
    setEditableItem(item);
  };

  const handleSaveEdit = async () => {
    if (editableItem) {
      try {
        const response = await axios.put(`/api/carousel/update/${editableItem._id}`, editableItem);
        if (response.status === 200) {
          setCarouselItems(
            carouselItems.map(item =>
              item._id === editableItem._id ? editableItem : item
            )
          );
          toast.success('Item updated successfully');
          setEditableItem(null);
        }
      } catch (error) {
        console.error('Error updating item:', error);
        toast.error('Error updating item');
      }
    }
  };
  
  // Handle input changes for editable fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editableItem) {
      setEditableItem({
        ...editableItem,
        [e.target.name]: e.target.value
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Carousel Items</h1>

      {/* Display Carousel Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {carouselItems.map((item) => (
          <div key={item._id} className="bg-white rounded-lg shadow-lg overflow-hidden relative group">
            {/* Image Component */}
            <Image
              src={item.imageUrl}
              alt={item.name}
              width={500}
              height={300}
              className="w-full h-64 object-cover transition-transform duration-300 transform group-hover:scale-105"
            />

            {/* Edit and Delete Buttons */}
            <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button onClick={() => handleEdit(item)} className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600">
                <FaEdit />
              </button>
              <button onClick={() => handleDelete(item._id)} className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600">
                <FaTrash />
              </button>
            </div>

            <div className="p-4">
              {/* Editable name and link */}
              {editableItem?._id === item._id ? (
                <div>
                  <input
                    type="text"
                    name="name"
                    value={editableItem.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md mb-2"
                  />
                  <input
                    type="url"
                    name="link"
                    value={editableItem.link}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md mb-2"
                  />
                  <button onClick={handleSaveEdit} className="w-full bg-green-500 text-white py-2 rounded-md mt-2">Save</button>
                </div>
              ) : (
                <div>
                  <h3 className="text-xl font-semibold">{item.name}</h3>
                  <p className="text-gray-500">{item.link}</p>
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-500">View More</a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
