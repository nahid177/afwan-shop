// src/app/admin/offerEntries/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
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
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import {
  DataGrid,
  GridColDef,
  GridToolbar,
  GridRenderCellParams,
} from '@mui/x-data-grid';
import axios from 'axios';

interface OfferEntry {
  _id: string;
  title: string;
  detail: string;
  endTime: string; // ISO date string
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const OfferEntriesPage: React.FC = () => {
  const [offerEntries, setOfferEntries] = useState<OfferEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // States for Add/Edit Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentOfferEntry, setCurrentOfferEntry] = useState<OfferEntry | null>(null);

  // State for Delete Confirmation Dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [offerEntryToDelete, setOfferEntryToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchOfferEntries();
  }, []);

  const fetchOfferEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/offer-entries');
      console.log('Offer Entries received:', response.data.offerEntries); // For debugging
      setOfferEntries(response.data.offerEntries || []);
    } catch (error) {
      console.error('Error fetching offer entries:', error);
      setError('Failed to fetch offer entries.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (offerEntry?: OfferEntry) => {
    if (offerEntry) {
      setIsEditMode(true);
      setCurrentOfferEntry(offerEntry);
    } else {
      setIsEditMode(false);
      setCurrentOfferEntry({
        _id: '',
        title: '',
        detail: '',
        endTime: '',
        isActive: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrentOfferEntry(null);
  };

  const handleSaveOfferEntry = async () => {
    const { title, detail, endTime, isActive, _id } = currentOfferEntry!;
    if (!title || !detail || !endTime) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      if (isEditMode) {
        // Update existing offer entry
        await axios.put('/api/offer-entries', {
          id: _id,
          title,
          detail,
          endTime,
          isActive,
        });
        setSuccess('Offer entry updated successfully.');
      } else {
        // Create new offer entry
        await axios.post('/api/offer-entries', {
          title,
          detail,
          endTime,
          isActive,
        });
        setSuccess('Offer entry created successfully.');
      }
      fetchOfferEntries();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving offer entry:', error);
      setError('Failed to save offer entry.');
    }
  };

  const handleDeleteOfferEntry = async () => {
    try {
      await axios.delete('/api/offer-entries', {
        data: { id: offerEntryToDelete },
      });
      setSuccess('Offer entry deleted successfully.');
      fetchOfferEntries();
    } catch (error) {
      console.error('Error deleting offer entry:', error);
      setError('Failed to delete offer entry.');
    } finally {
      setDeleteDialogOpen(false);
      setOfferEntryToDelete(null);
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  console.log('offerEntries state:', offerEntries); // For debugging

  const columns: GridColDef[] = [
    { field: 'title', headerName: 'Title', flex: 2 },
    { field: 'detail', headerName: 'Detail', flex: 2 },
    {
      field: 'endTime',
      headerName: 'End Time',
      flex: 2,
      renderCell: (params: GridRenderCellParams<OfferEntry>) => {
        const value = params.row.endTime;
        if (!value) return '';
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          console.error('Invalid date:', value);
          return '';
        }
        return <span>{date.toLocaleString()}</span>;
      },
    },
    {
      field: 'isActive',
      headerName: 'Active',
      flex: 1,
      renderCell: (params: GridRenderCellParams<OfferEntry, boolean>) =>
        params.value ? 'Yes' : 'No',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1.5,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<OfferEntry>) => (
        <>
          <IconButton
            color="primary"
            onClick={() => handleOpenDialog(params.row)}
          >
            <Edit />
          </IconButton>
          <IconButton
            color="secondary"
            onClick={() => {
              setOfferEntryToDelete(params.row._id);
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
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Manage Offer Entries
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Offer Entry
        </Button>
      </Box>

      {error && (
        <Snackbar open autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert
            onClose={handleCloseSnackbar}
            severity="error"
            sx={{ width: '100%' }}
          >
            {error}
          </Alert>
        </Snackbar>
      )}

      {success && (
        <Snackbar open autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert
            onClose={handleCloseSnackbar}
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
        <Paper>
          <div style={{ height: 500, width: '100%' }}>
            <DataGrid
              rows={offerEntries}
              columns={columns}
              getRowId={(row: OfferEntry) => row._id}
              slots={{ toolbar: GridToolbar }}
            />
          </div>
        </Paper>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isEditMode ? 'Edit Offer Entry' : 'Add Offer Entry'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Title"
                fullWidth
                value={currentOfferEntry?.title || ''}
                onChange={(e) =>
                  setCurrentOfferEntry({
                    ...currentOfferEntry!,
                    title: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Detail"
                fullWidth
                multiline
                minRows={3}
                value={currentOfferEntry?.detail || ''}
                onChange={(e) =>
                  setCurrentOfferEntry({
                    ...currentOfferEntry!,
                    detail: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="End Time"
                type="datetime-local"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={
                  currentOfferEntry?.endTime
                    ? currentOfferEntry.endTime.slice(0, 16) // ISO string formatted for datetime-local
                    : ''
                }
                onChange={(e) =>
                  setCurrentOfferEntry({
                    ...currentOfferEntry!,
                    endTime: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={currentOfferEntry?.isActive || false}
                    onChange={(e) =>
                      setCurrentOfferEntry({
                        ...currentOfferEntry!,
                        isActive: e.target.checked,
                      })
                    }
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSaveOfferEntry} color="primary">
            {isEditMode ? 'Update' : 'Save'}
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
        <DialogTitle id="delete-dialog-title">Delete Offer Entry</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this offer entry? This action cannot
            be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            color="primary"
          >
            Cancel
          </Button>
          <Button onClick={handleDeleteOfferEntry} color="secondary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OfferEntriesPage;
