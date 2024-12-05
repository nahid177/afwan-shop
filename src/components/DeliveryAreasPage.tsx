'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { Edit, Delete, Save, Cancel } from '@mui/icons-material';
import axios from 'axios';
import AdminLayout from '@/app/admin/AdminLayout';

interface DeliveryArea {
  _id: string;
  area: string;
  price: number;
}

const DeliveryAreasPage: React.FC = () => {
  const [deliveryAreas, setDeliveryAreas] = useState<DeliveryArea[]>([]);
  const [newArea, setNewArea] = useState('');
  const [newPrice, setNewPrice] = useState<number | ''>('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editArea, setEditArea] = useState('');
  const [editPrice, setEditPrice] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchDeliveryAreas();
  }, []);

  const fetchDeliveryAreas = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/delivery-areas');
      setDeliveryAreas(response.data.deliveryAreas || []);
    } catch (error) {
      console.error('Error fetching delivery areas:', error);
      setError('Failed to fetch delivery areas.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddArea = async () => {
    if (newArea.trim() === '' || newPrice === '') {
      setError('Please provide a valid area name and price.');
      return;
    }
    try {
      await axios.post('/api/delivery-areas', { area: newArea, price: newPrice });
      setNewArea('');
      setNewPrice('');
      setSuccess('Delivery area added successfully.');
      fetchDeliveryAreas();
    } catch (error) {
      console.error('Error adding delivery area:', error);
      setError('Failed to add delivery area.');
    }
  };

  const startEditing = (area: DeliveryArea) => {
    setEditId(area._id);
    setEditArea(area.area);
    setEditPrice(area.price);
  };

  const handleUpdateArea = async () => {
    if (editArea.trim() === '' || editPrice === '') {
      setError('Please provide valid values for area name and price.');
      return;
    }
    try {
      await axios.put('/api/delivery-areas', { id: editId, area: editArea, price: editPrice });
      setEditId(null);
      setEditArea('');
      setEditPrice('');
      setSuccess('Delivery area updated successfully.');
      fetchDeliveryAreas();
    } catch (error) {
      console.error('Error updating delivery area:', error);
      setError('Failed to update delivery area.');
    }
  };

  const confirmDeleteArea = (id: string) => {
    setAreaToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteArea = async () => {
    try {
      await axios.delete('/api/delivery-areas', { data: { id: areaToDelete } });
      setSuccess('Delivery area deleted successfully.');
      fetchDeliveryAreas();
    } catch (error) {
      console.error('Error deleting delivery area:', error);
      setError('Failed to delete delivery area.');
    } finally {
      setDeleteDialogOpen(false);
      setAreaToDelete(null);
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <AdminLayout>
        <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Manage Delivery Areas
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={5}>
          <TextField
            label="Area Name"
            fullWidth
            value={newArea}
            onChange={(e) => setNewArea(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={5}>
          <TextField
            label="Price"
            type="number"
            fullWidth
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value ? parseFloat(e.target.value) : '')}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddArea}
            fullWidth
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Add Area'}
          </Button>
        </Grid>
      </Grid>

      {error && (
        <Snackbar open autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      )}

      {success && (
        <Snackbar open autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
            {success}
          </Alert>
        </Snackbar>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Area</TableCell>
                <TableCell>Price</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {deliveryAreas.map((area) => (
                <TableRow key={area._id}>
                  <TableCell>
                    {editId === area._id ? (
                      <TextField
                        value={editArea}
                        onChange={(e) => setEditArea(e.target.value)}
                        fullWidth
                      />
                    ) : (
                      area.area
                    )}
                  </TableCell>
                  <TableCell>
                    {editId === area._id ? (
                      <TextField
                        value={editPrice}
                        type="number"
                        onChange={(e) =>
                          setEditPrice(e.target.value ? parseFloat(e.target.value) : '')
                        }
                        fullWidth
                      />
                    ) : (
                      `$${(area.price ?? 0).toFixed(2)}`
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {editId === area._id ? (
                      <>
                        <IconButton color="primary" onClick={handleUpdateArea}>
                          <Save />
                        </IconButton>
                        <IconButton color="secondary" onClick={() => setEditId(null)}>
                          <Cancel />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <IconButton color="primary" onClick={() => startEditing(area)}>
                          <Edit />
                        </IconButton>
                        <IconButton
                          color="secondary"
                          onClick={() => confirmDeleteArea(area._id)}
                        >
                          <Delete />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Delete Delivery Area</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this delivery area? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteArea} color="secondary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
    </AdminLayout>
  
  );
};

export default DeliveryAreasPage;
