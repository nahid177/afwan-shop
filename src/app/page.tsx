"use client";

import React from 'react';
import CarouselPage from '@/components/Admin/Carousel';
import FeatureSection from '@/components/FeatureSection';
import ProductsPage from '@/components/ProductsPage';
import Footer from '@/components/Footer';

const Page = () => {
  return (
   
      <div className="w-full">
        <CarouselPage />
        <FeatureSection />
        <ProductsPage />
        <Footer />
      </div>
   
  );
};

export default Page;
