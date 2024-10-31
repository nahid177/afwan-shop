// /components/Admin/Promocode/PromoCodeList.tsx
'use client';
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Box,
} from '@mui/material';
import axios from 'axios';
import EditPromoCode from './EditPromoCode';

interface PromoCode {
  _id: string;
  code: string;
  discountValue: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

const PromoCodeList: React.FC = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const fetchPromoCodes = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/api/promo-code');
      setPromoCodes(response.data.promoCodes);
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error) && error.response
        ? error.response.data.message
        : 'An unexpected error occurred.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const handleUpdate = (updatedPromo: PromoCode) => {
    setPromoCodes((prev) => prev.map((promo) => (promo._id === updatedPromo._id ? updatedPromo : promo)));
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this promo code?')) return;

    try {
      await axios.delete(`/api/promo-code/${id}`);
      setPromoCodes((prev) => prev.filter((promo) => promo._id !== id));
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error) && error.response
        ? error.response.data.message
        : 'Failed to delete promo code.';
      setError(errorMessage);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Promo Codes
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label="promo codes table">
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Discount Value</TableCell>
                <TableCell>Active</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {promoCodes.map((promo) => (
                <TableRow key={promo._id}>
                  <TableCell>{promo.code}</TableCell>
                  <TableCell>{promo.discountValue}%</TableCell>
                  <TableCell>{promo.isActive ? 'Yes' : 'No'}</TableCell>
                  <TableCell>
                    {promo.startDate ? new Date(promo.startDate).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {promo.endDate ? new Date(promo.endDate).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      sx={{ mr: 1 }}
                      onClick={() => setEditingId(promo._id)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="small"
                      onClick={() => handleDelete(promo._id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {editingId && (
        <Box sx={{ mt: 4 }}>
          <EditPromoCode
            promoCode={promoCodes.find((promo) => promo._id === editingId)!}
            onUpdate={handleUpdate}
          />
        </Box>
      )}
    </Box>
  );
};

export default PromoCodeList;
