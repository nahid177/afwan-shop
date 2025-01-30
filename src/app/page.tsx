"use client";

import React from 'react';
import ChatIcon from '@/components/ChatIcon';

// import CarouselPage from '@/components/Admin/Carousel';
// import FeatureSection from '@/components/FeatureSection';
// import ProductsPage from '@/components/ProductsPage';
// import Footer from '@/components/Footer';
// import CustomerReviews from '@/components/CustomerReviews';
// import IconshowPage from '@/components/Iconshow';

const Page = () => {
  return (
   
      <div className="w-full">
          <ChatIcon />
           {/* Video Only */}
    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
        >
          <source src="/afwan.mp4" type="video/mp4" />
        </video>
      </div>
        {/* <CarouselPage />
        <FeatureSection />
        <IconshowPage />

        <div className='lg:px-20 md:px-8'>
          <ProductsPage />
          <h2 className="text-2xl font-semibold text-center mb-4 relative">
              <span className="relative inline-block">
              CUSTOMER REVIEWS
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-500 transform scale-x-0 animation-underline transition-all duration-500 ease-in-out underline-offset-8" />
              </span>
              </h2>
        <CustomerReviews />
        </div>
        
        <Footer />*/}
      </div> 
   
  );
};

export default Page;
