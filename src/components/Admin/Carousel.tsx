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

const CarouselPage = () => {
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0); // To track the current carousel item
  const { theme } = useTheme(); // Get the current theme from context

  // Fetch carousel data when the component mounts
  useEffect(() => {
    const fetchCarouselItems = async () => {
      try {
        const response = await axios.get('/api/carousel/get');
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

  // Auto-slide effect every 3 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselItems.length);
    }, 3000); // 3 seconds interval

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [carouselItems]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`p-4 sm:p-8 ${theme === "light" ? "bg-white text-black" : "bg-gray-900 text-white"}`}>
      {/* Carousel */}
      <div className="carousel w-full max-w-full  rounded-xl ">
        {carouselItems.map((item, index) => (
          <div
            id={`item${index + 1}`}
            className={`carousel-item w-full ${index === currentIndex ? 'block' : 'hidden'}`} // Show the current item
            key={item.id}
          >
            {/* If link exists, wrap image with Link directly */}
            {item.link ? (
              <Link href={item.link}>
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  width={1200}  // Increase width for large screens
                  height={600}  // Increase height for large screens
                  className="w-full h-auto max-h-[600px] object-cover"
                />
              </Link>
            ) : (
              <Image
                src={item.imageUrl}
                alt={item.name}
                width={1200}  // Increase width for large screens
                height={600}  // Increase height for large screens
                className="w-full h-auto max-h-[600px] object-cover"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CarouselPage;
