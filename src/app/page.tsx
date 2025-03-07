"use client";

import React from 'react';
import ChatIcon from '@/components/ChatIcon';

import CarouselPage from '@/components/Admin/Carousel';
import FeatureSection from '@/components/FeatureSection';
import ProductsPage from '@/components/ProductsPage';
import CustomerReviews from '@/components/CustomerReviews';
import IconshowPage from '@/components/Iconshow';

const Page = () => {
  return (

    <div className="w-full">
      <ChatIcon />
      {/* Video Only */}
      <CarouselPage />
      <FeatureSection />
      <IconshowPage />

      <div className=' '>
        <ProductsPage />
        <h2 className="text-2xl font-semibold text-center mb-4 relative">
          <span className="relative inline-block">
            CUSTOMER REVIEWS
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-500 transform scale-x-0 animation-underline transition-all duration-500 ease-in-out underline-offset-8" />
          </span>
        </h2>
        <CustomerReviews />
      </div>

     
    </div>

  );
};

export default Page;
