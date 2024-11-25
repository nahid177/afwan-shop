// src/components/CloseAccountButton.tsx

import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  CircularProgress,
  Snackbar,
} from '@mui/material';

const CloseAccountButton: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleCloseAccount = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/profit/close', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        setSnackbar({ open: true, message: result.message, severity: 'success' });
        // Optionally, refresh the Profit data or trigger a re-fetch
        // e.g., window.location.reload();
      } else {
        setSnackbar({ open: true, message: result.error || 'An error occurred while closing the account.', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'An unexpected error occurred.', severity: 'error' });
      console.error(err);
    } finally {
      setLoading(false);
      setOpenDialog(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        color="error"
        startIcon={<Close />}
        onClick={() => setOpenDialog(true)}
      >
        Close Account
      </Button>

      {/* Confirmation Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Close Profit Account</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to close the current Profit account? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCloseAccount} variant="contained" color="error" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Close Account'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
};

export default CloseAccountButton;
