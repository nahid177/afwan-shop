"use client";

import React from 'react';
import CarouselPage from '@/components/Admin/Carousel';
import FeatureSection from '@/components/FeatureSection';
import ProductsPage from '@/components/ProductsPage';
import Footer from '@/components/Footer';
import ChatIcon from '@/components/ChatIcon';

const Page = () => {
  return (
   
      <div className="w-full">
          <ChatIcon />
        <CarouselPage />
        <FeatureSection />
        <ProductsPage />
        <Footer />
      </div>
   
  );
};

export default Page;
