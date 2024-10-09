import React from 'react';
import AdminLayout from '@/app/admin/AdminLayout';
import CreateProductType from '@/components/Admin/Product/CreateProductType';

const page = () => {
    return (
        <AdminLayout>
          <CreateProductType />
        </AdminLayout>
    );
};

export default page;