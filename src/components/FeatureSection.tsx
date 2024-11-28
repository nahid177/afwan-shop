import React from 'react';
import Image from 'next/image';
import { useTheme } from '@/mode/ThemeContext';  // Import the theme hook

const FeatureSection: React.FC = () => {
  const { theme } = useTheme();  // Get the current theme from context

  return (
    <div className={`flex flex-wrap justify-between items-center p-5 gap-5 px-8 md:px-16 lg:px-32 ${theme === "light" ? "bg-white text-black" : "bg-gray-900 text-white"}`}>
      <div className="text-center flex-1 flex-shrink-0 w-full sm:w-1/2 md:w-1/4">
        <Image 
          src="https://afwanimage.s3.us-east-1.amazonaws.com/Online-Support-24-7.a66f7a77.svg" 
          alt="Online Support"
          width={250}
          height={250}
          className="mb-6"
        />
      </div>
      <div className="text-center flex-1 flex-shrink-0 w-full sm:w-1/2 md:w-1/4">
        <Image 
          src="https://afwanimage.s3.us-east-1.amazonaws.com/Fastest-Shipping.efdae6a0.svg" 
          alt="Fastest Shipping"
          width={250}
          height={250}
          className="mb-6"
        />
      </div>
      <div className="text-center flex-1 flex-shrink-0 w-full sm:w-1/2 md:w-1/4">
        <Image 
          src="https://afwanimage.s3.us-east-1.amazonaws.com/Easy-Return-Policy.247734ff.svg" 
          alt="Easy Return Policy"
          width={250}
          height={250}
          className="mb-6"
        />
      </div>
      <div className="text-center flex-1 flex-shrink-0 w-full sm:w-1/2 md:w-1/4">
        <Image 
          src="https://afwanimage.s3.us-east-1.amazonaws.com/Premium-Qualiy-Product.220aaabd.svg" 
          alt="Premium Quality"
          width={250}
          height={250}
          className="mb-6"
        />
      </div>
    </div>
  );
};

export default FeatureSection;
