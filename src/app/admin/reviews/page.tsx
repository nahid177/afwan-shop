// src/app/admin/reviews/page.tsx

'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
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
  Switch,
  FormControlLabel,
  TextField,
} from '@mui/material';
import { Edit, Delete, Print } from '@mui/icons-material';
import {
  DataGrid,
  GridColDef,
  GridToolbar,
  GridRenderCellParams,
} from '@mui/x-data-grid';
import axios from 'axios';
import Image from 'next/image';
import AdminLayout from '../AdminLayout';

interface CustomerReview {
  id: string;
  user: string;
  reviewText: string;
  imageUrl: string;
  isActive: boolean;
  approved: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ServerCustomerReview {
  _id: string;
  user: string;
  reviewText: string;
  imageUrl: string;
  isActive: boolean;
  approved: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const AdminReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState<CustomerReview | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

  const printableContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/admin/reviews');
      const serverReviews: ServerCustomerReview[] = response.data.reviews;

      const reviewsWithId: CustomerReview[] = serverReviews.map((review) => ({
        id: review._id,
        user: review.user,
        reviewText: review.reviewText,
        imageUrl: review.imageUrl,
        isActive: review.isActive,
        approved: review.approved,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      }));

      setReviews(reviewsWithId || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Failed to fetch reviews.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (printableContentRef.current) {
      const printContents = printableContentRef.current.innerHTML;
      const originalContents = document.body.innerHTML;

      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  };

  const handleOpenEditDialog = (review: CustomerReview) => {
    setCurrentReview(review);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setCurrentReview(null);
  };

  const handleSaveReview = async () => {
    if (!currentReview) return;

    try {
      await axios.put('/api/admin/reviews', currentReview);
      setSuccess('Review updated successfully.');
      fetchReviews();
      handleCloseEditDialog();
    } catch (error) {
      console.error('Error updating review:', error);
      setError('Failed to update review.');
    }
  };

  const handleDeleteReview = async () => {
    if (!reviewToDelete) return;

    try {
      await axios.delete('/api/admin/reviews', {
        data: { id: reviewToDelete },
      });
      setSuccess('Review deleted successfully.');
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      setError('Failed to delete review.');
    } finally {
      setDeleteDialogOpen(false);
      setReviewToDelete(null);
    }
  };

  const columns: GridColDef[] = [
    { field: 'user', headerName: 'User', flex: 1 },
    { field: 'reviewText', headerName: 'Review Text', flex: 2 },
    {
      field: 'imageUrl',
      headerName: 'Image',
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Image
          src={params.value}
          alt="Review Image"
          width={100}
          height={100}
          style={{ objectFit: 'cover' }}
        />
      ),
    },
    {
      field: 'approved',
      headerName: 'Approved',
      flex: 1,
      renderCell: (params: GridRenderCellParams<CustomerReview, boolean>) =>
        params.value ? 'Yes' : 'No',
    },
    {
      field: 'isActive',
      headerName: 'Active',
      flex: 1,
      renderCell: (params: GridRenderCellParams<CustomerReview, boolean>) =>
        params.value ? 'Yes' : 'No',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1.5,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<CustomerReview>) => (
        <>
          <IconButton
            color="primary"
            onClick={() => handleOpenEditDialog(params.row)}
          >
            <Edit />
          </IconButton>
          <IconButton
            color="secondary"
            onClick={() => {
              setReviewToDelete(params.row.id);
              setDeleteDialogOpen(true);
            }}
          >
            <Delete />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <AdminLayout>
         <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Manage Customer Reviews
      </Typography>

      <Button
        variant="contained"
        color="primary"
        startIcon={<Print />}
        onClick={handlePrint}
        sx={{ mb: 2 }}
      >
        Print Reviews
      </Button>

      {error && (
        <Snackbar open autoHideDuration={6000} onClose={() => setError(null)}>
          <Alert
            onClose={() => setError(null)}
            severity="error"
            sx={{ width: '100%' }}
          >
            {error}
          </Alert>
        </Snackbar>
      )}

      {success && (
        <Snackbar open autoHideDuration={6000} onClose={() => setSuccess(null)}>
          <Alert
            onClose={() => setSuccess(null)}
            severity="success"
            sx={{ width: '100%' }}
          >
            {success}
          </Alert>
        </Snackbar>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper ref={printableContentRef}>
          <div style={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={reviews}
              columns={columns}
              getRowId={(row: CustomerReview) => row.id}
              slots={{ toolbar: GridToolbar }}
            />
          </div>
        </Paper>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Review</DialogTitle>
        <DialogContent>
          {currentReview && (
            <>
              <TextField
                label="User"
                fullWidth
                margin="normal"
                value={currentReview.user}
                onChange={(e) =>
                  setCurrentReview({ ...currentReview, user: e.target.value })
                }
              />
              <TextField
                label="Review Text"
                fullWidth
                multiline
                minRows={3}
                margin="normal"
                value={currentReview.reviewText}
                onChange={(e) =>
                  setCurrentReview({ ...currentReview, reviewText: e.target.value })
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={currentReview.approved}
                    onChange={(e) =>
                      setCurrentReview({
                        ...currentReview,
                        approved: e.target.checked,
                      })
                    }
                  />
                }
                label="Approved"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={currentReview.isActive}
                    onChange={(e) =>
                      setCurrentReview({
                        ...currentReview,
                        isActive: e.target.checked,
                      })
                    }
                  />
                }
                label="Active"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSaveReview} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Delete Review</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this review? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteReview} color="secondary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>  
    </AdminLayout>
 
  );
};

export default AdminReviewsPage;
