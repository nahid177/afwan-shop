// src/app/admin/AdminLayoutTypesName.tsx

import React from 'react';
import ProductTypesNavbar from '@/components/Admin/product-types-page/ProductTypesNavbar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayoutTypesName: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <ProductTypesNavbar />

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer (optional) */}
      {/* <footer>Admin Footer</footer> */}
    </div>
  );
};

export default AdminLayoutTypesName;
