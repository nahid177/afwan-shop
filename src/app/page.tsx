"use client";

import React from 'react';
import CarouselPage from '@/components/Admin/Carousel';
import FeatureSection from '@/components/FeatureSection';
import ProductsPage from '@/components/ProductsPage';
import Footer from '@/components/Footer';
import ChatIcon from '@/components/ChatIcon';
import CustomerReviews from '@/components/CustomerReviews';

const Page = () => {
  return (
   
      <div className="w-full">
          <ChatIcon />
        <CarouselPage />
        <FeatureSection />
        <div className='lg:px-20 md:px-8'>
          <ProductsPage />
        <CustomerReviews />
        </div>
        
        <Footer />
      </div>
   
  );
};

export default Page;
