// src/hooks/useStoreOrders.ts

import { useState, useEffect } from 'react';
import axios from 'axios';
import { IStoreOrder } from '@/types';

interface UseStoreOrdersReturn {
  storeOrders: IStoreOrder[];
  loading: boolean;
  error: string | null;
}

export const useStoreOrders = (): UseStoreOrdersReturn => {
  const [storeOrders, setStoreOrders] = useState<IStoreOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStoreOrders = async () => {
      try {
        const response = await axios.get<IStoreOrder[]>('/api/storeOrders');
        setStoreOrders(response.data);
      } catch (err) {
        console.error('Error fetching store orders:', err);
        setError('Failed to load store orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchStoreOrders();
  }, []);

  return { storeOrders, loading, error };
};
