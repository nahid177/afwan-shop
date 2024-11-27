"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter, useParams } from 'next/navigation';
import { FaImage, FaLink } from 'react-icons/fa';
import { toast } from 'react-toastify';

const CreateOrUpdateCarousel: React.FC = () => {
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [link, setLink] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { id } = useParams(); // Get the carousel item id from the URL

  useEffect(() => {
    // If an ID exists in the URL, it's update mode, so fetch the existing carousel item
    if (id) {
      const fetchCarouselItem = async () => {
        try {
          const response = await axios.get(`/api/carousel/${id}`);
          const item = response.data;
          setName(item.name);
          setLink(item.link || '');
          setImageUrl(item.imageUrl);
        } catch (error) {
          toast.error('Error fetching carousel item');
        }
      };
      fetchCarouselItem();
    }
  }, [id]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setImageFile(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !imageFile) {
      toast.error('Carousel name and image are required');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Upload the image to the server (via /api/upload)
      const formData = new FormData();
      formData.append('files', imageFile); // Ensure 'files' matches backend
      const uploadResponse = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Step 2: Get the URL of the uploaded image (returned from the upload API)
      const uploadedImageUrl = uploadResponse.data.urls[0]; // Ensure it returns URLs

      if (id) {
        // If in update mode, update the existing carousel item
        await axios.put(`/api/carousel/${id}`, {
          name,
          imageUrl: uploadedImageUrl,
          link,
        });

        toast.success('Carousel item updated successfully!');
      } else {
        // If in create mode, create a new carousel item
        await axios.post('/api/carousel/create', {
          name,
          imageUrl: uploadedImageUrl,
          link,
        });

        toast.success('Carousel item created successfully!');
      }

      setName('');
      setLink('');
      setImageFile(null);

      setTimeout(() => {
        router.push('/admin/carousel'); // Redirect to carousel list page
      }, 1500);
    } catch (error) {
      toast.error(id ? 'Error updating carousel item' : 'Error creating carousel item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold mb-6 text-center">{id ? 'Update Carousel Item' : 'Create Carousel Item'}</h1>

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow-lg">
        {/* Carousel Name */}
        <div className="mb-6">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Carousel Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-2 p-3 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Image File Upload */}
        <div className="mb-6">
          <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700">Upload Image</label>
          <div className="flex items-center border border-gray-300 rounded-md shadow-sm">
            <FaImage className="mr-3 text-gray-500" />
            <input
              type="file"
              id="imageFile"
              onChange={handleFileChange}
              required={!id} // Required only when updating (we don't require it for update if imageUrl exists)
              className="p-3 w-full rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Optional Link */}
        <div className="mb-6">
          <label htmlFor="link" className="block text-sm font-medium text-gray-700">Optional Link</label>
          <div className="flex items-center border border-gray-300 rounded-md shadow-sm">
            <FaLink className="mr-3 text-gray-500" />
            <input
              type="url"
              id="link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="p-3 w-full rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="mb-6">
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 ${loading ? 'bg-gray-400' : 'bg-blue-600'} text-white rounded-md transition-all`}
          >
            {loading ? 'Processing...' : id ? 'Update Carousel' : 'Create Carousel'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateOrUpdateCarousel;
