"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from '@/mode/ThemeContext';  // Import the theme hook

interface CarouselItem {
  id: string;
  name: string;
  imageUrl: string;
  link?: string; // Optional link field
  createdAt: string;
  updatedAt: string;
}

const IconshowPage = () => {
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme(); // Get the current theme from context

  // Fetch carousel data when the component mounts
  useEffect(() => {
    const fetchCarouselItems = async () => {
      try {
        const response = await axios.get('/api/iconshow/get');
        setCarouselItems(response.data);
      } catch (error) {
        console.error("Error fetching carousel items:", error);
        toast.error('Error fetching carousel items');
      } finally {
        setLoading(false);
      }
    };

    fetchCarouselItems();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`p-4 sm:p-8 ${theme === "light" ? "bg-white text-black" : "bg-gray-900 text-white"}`}>
      {/* Adjusted Grid for Smaller Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {carouselItems.map((item) => (
          <div
            key={item.id}
            className=" bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden w-[150px] max-w-xs mx-auto"
          >
            {/* If link exists, wrap image with Link */}
            {item.link ? (
              <Link href={item.link}>
                <div className=" w-[150px] h-[150px] flex justify-center items-center">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    width={70} // Set fixed width
                    height={70} // Set fixed height
                    objectFit="cover"
                    className="rounded-t-lg"
                  />
                </div>
              </Link>
            ) : (
              <div className="relative w-[150px] h-[150px] flex justify-center items-center">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  width={80} // Set fixed width
                  height={80} // Set fixed height
                  objectFit="cover"
                  className="rounded-t-lg"
                />
              </div>
            )}

            {/* Adjusted Card Content */}
            <div className="p-2"> {/* Reduced padding for smaller cards */}
              <h3 className="text-center text-sm font-semibold">{item.name}</h3> {/* Reduced font size */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IconshowPage;
