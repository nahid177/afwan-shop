// components/CloseAccountDialog.tsx
import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button, CircularProgress } from '@mui/material';

interface CloseAccountDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

const CloseAccountDialog: React.FC<CloseAccountDialogProps> = ({ open, onClose, onConfirm, loading }) => {
  const [step, setStep] = useState<number>(1);

  const handleConfirm = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onConfirm();
      setStep(1); // Reset step after confirmation
    }
  };

  const handleCancel = () => {
    onClose();
    setStep(1); // Reset step on cancel
  };

  const getContent = () => {
    switch (step) {
      case 1:
        return "Are you sure you want to close the current Profit account? This will finalize the current profit calculations and create a new account for future calculations.";
      case 2:
        return "Please confirm again by clicking 'Close Account' to proceed.";
      case 3:
        return "Final confirmation: Click 'Close Account' to permanently close the account.";
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onClose={handleCancel}>
      <DialogTitle>Close Profit Account</DialogTitle>
      <DialogContent>
        <Typography gutterBottom>
          {getContent()}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Close Account'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CloseAccountDialog;
