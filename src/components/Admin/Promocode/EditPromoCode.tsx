// /components/Admin/Promocode/EditPromoCode.tsx
'use client';
import React, { useState } from 'react';
import {
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  Grid,
  Typography,
  Alert,
  Box,
} from '@mui/material';
import axios from 'axios';

interface PromoCode {
  _id: string;
  code: string;
  discountValue: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

interface EditPromoCodeProps {
  promoCode: PromoCode;
  onUpdate: (updatedPromo: PromoCode) => void;
}

const EditPromoCode: React.FC<EditPromoCodeProps> = ({ promoCode, onUpdate }) => {
  const [form, setForm] = useState({
    id: promoCode._id,
    code: promoCode.code,
    discountValue: promoCode.discountValue.toString(),
    isActive: promoCode.isActive,
    startDate: promoCode.startDate ? promoCode.startDate.split('T')[0] : '',
    endDate: promoCode.endDate ? promoCode.endDate.split('T')[0] : '',
  });
  const [message, setMessage] = useState<string>('');
  const [severity, setSeverity] = useState<'success' | 'error'>('success');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const checked = target.checked;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    setSeverity('success');

    const parsedDiscountValue = parseFloat(form.discountValue);
    if (isNaN(parsedDiscountValue) || parsedDiscountValue <= 0) {
      setMessage('Discount value must be a positive number.');
      setSeverity('error');
      return;
    }

    const data = {
      code: form.code.trim(),
      discountValue: parsedDiscountValue,
      isActive: form.isActive,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
    };

    try {
      const response = await axios.put(`/api/promo-code/${form.id}`, data);
      setMessage('Promo code updated successfully!');
      if (onUpdate) onUpdate(response.data.promoCode);
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error) && error.response
        ? error.response.data.message
        : 'An unexpected error occurred.';
      setMessage(errorMessage);
      setSeverity('error');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Edit Promo Code
      </Typography>
      {message && (
        <Alert severity={severity} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Code"
            name="code"
            value={form.code}
            onChange={handleChange}
            required
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Discount Value"
            name="discountValue"
            type="number"
            value={form.discountValue}
            onChange={handleChange}
            required
            fullWidth
            inputProps={{ min: '0', step: '0.01' }}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={form.isActive}
                onChange={handleChange}
                name="isActive"
                color="primary"
              />
            }
            label="Active"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Start Date"
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="End Date"
            name="endDate"
            type="date"
            value={form.endDate}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Update Promo Code
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EditPromoCode;
