// /app/admin/promoCode/page.tsx
'use client';
import React from 'react';
import AdminLayout from '../AdminLayout';
import PromoCodeList from '@/components/Admin/Promocode/PromoCodeList';
import CreatePromoCode from '@/components/Admin/Promocode/CreatePromoCode';
import { Container } from '@mui/material';

const PromoCodePage: React.FC = () => {
  return (
    <AdminLayout>
      <Container maxWidth="md">
        <CreatePromoCode />
        <PromoCodeList />
      </Container>
    </AdminLayout>
  );
};

export default PromoCodePage;
