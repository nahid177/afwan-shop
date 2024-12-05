// src/app/admin/product-types/[id]/page.tsx

import ProductTypePage from '@/components/Admin/ProductTypePage';
import React from 'react';

interface PageProps {
  params: {
    id: string;
  };
}

const Page: React.FC<PageProps> = ({ params }) => {
  return (
    <div>
      <ProductTypePage params={params} />
    </div>
  );
};

export default Page;
