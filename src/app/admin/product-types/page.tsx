import React from 'react';
import AdminLayout from '../AdminLayout';
import ProductTypesNavbar from '@/components/Admin/product-types-page/ProductTypesNavbar';

const page = () => {
    return (
        <AdminLayout>
            <ProductTypesNavbar />
        </AdminLayout>
    );
};

export default page;