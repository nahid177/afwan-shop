"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter, useParams } from 'next/navigation';
import { FaImage, FaLink } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Image from 'next/image'; // Import Next.js Image component

const CreateOrUpdateIconshow: React.FC = () => {
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [link, setLink] = useState('');
  const [imageUrl, setImageUrl] = useState(''); // Used to display existing image
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>(''); // To display error messages

  const router = useRouter();
  const { id } = useParams(); // Get the carousel item id from the URL

  useEffect(() => {
    // If an ID exists in the URL, it's update mode, so fetch the existing carousel item
    if (id) {
      const fetchCarouselItem = async () => {
        try {
          const response = await axios.get(`/api/iconshow/${id}`);
          const item = response.data;
          setName(item.name);
          setLink(item.link || '');
          setImageUrl(item.imageUrl);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    // Validation: Ensure name is provided and image is uploaded in create mode
    if (!name || (!id && !imageFile)) {
      toast.error('Carousel name and image are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let uploadedImageUrl = imageUrl; // Default to existing imageUrl in update mode

      // If a new image is selected, upload it
      if (imageFile) {
        const formData = new FormData();
        formData.append('files', imageFile); // Ensure 'files' matches backend
        const uploadResponse = await axios.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        // Get the URL of the uploaded image (returned from the upload API)
        uploadedImageUrl = uploadResponse.data.urls[0]; // Ensure it returns URLs
      }

      if (id) {
        // If in update mode, update the existing carousel item
        await axios.put(`/api/iconshow/${id}`, {
          name,
          imageUrl: uploadedImageUrl,
          link,
        });

        toast.success('Carousel item updated successfully!');
      } else {
        // If in create mode, create a new carousel item
        await axios.post('/api/iconshow/create', {
          name,
          imageUrl: uploadedImageUrl,
          link,
        });

        toast.success('Carousel item created successfully!');
      }

      // Reset form fields
      setName('');
      setLink('');
      setImageFile(null);
      if (!id) {
        setImageUrl(''); // Clear imageUrl only if creating a new item
      }

      setTimeout(() => {
        router.push('/admin/Iconshow'); // Redirect to carousel list page
      }, 1500);
    } catch (err: unknown) { // Changed 'error' to 'err' and type to 'unknown'
      console.error(err);
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || (id ? 'Error updating carousel item' : 'Error creating carousel item'));
        toast.error(err.response.data.message || (id ? 'Error updating carousel item' : 'Error creating carousel item'));
      } else {
        setError(id ? 'Error updating carousel item' : 'Error creating carousel item');
        toast.error(id ? 'Error updating carousel item' : 'Error creating carousel item');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 ">
      <h1 className="text-4xl font-bold mb-6 text-center">
        {id ? 'Update Carousel Item' : 'Create Carousel Item'}
      </h1>

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow-lg">
        {/* Display Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Carousel Name */}
        <div className="mb-6">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Carousel Name
          </label>
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
          <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700">
            Upload Image
          </label>
          <div className="flex items-center border border-gray-300 rounded-md shadow-sm">
            <FaImage className="mr-3 text-gray-500" />
            <input
              type="file"
              id="imageFile"
              onChange={handleFileChange}
              required={!id} // Required only when creating
              className="p-3 w-full rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Display Existing Image in Update Mode */}
          {id && imageUrl && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Current Image:</p>
              <div className="w-32 h-32 relative">
                <Image
                  src={imageUrl}
                  alt="Current Carousel Image"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-md"
                />
              </div>
            </div>
          )}
        </div>

        {/* Optional Link */}
        <div className="mb-6">
          <label htmlFor="link" className="block text-sm font-medium text-gray-700">
            Optional Link
          </label>
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

export default CreateOrUpdateIconshow;
