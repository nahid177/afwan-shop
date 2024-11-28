"use client";

import React from 'react';
import CarouselPage from '@/components/Admin/Carousel';
import FeatureSection from '@/components/FeatureSection';
import ProductsPage from '@/components/ProductsPage';

const Page = () => {
  return (
   
      <div className="w-full">
        <CarouselPage />
        <FeatureSection />
        <ProductsPage />
      </div>
   
  );
};

export default Page;
