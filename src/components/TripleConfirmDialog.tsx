// components/TripleConfirmDialog.tsx
import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button, CircularProgress, Box } from '@mui/material';

interface TripleConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  title: string;
  content: string;
}

const TripleConfirmDialog: React.FC<TripleConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  loading,
  title,
  content,
}) => {
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
        return content;
      case 2:
        return "Please confirm again by clicking the button below to proceed.";
      case 3:
        return "Final confirmation: Click the button below to permanently perform this action.";
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onClose={handleCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography gutterBottom>
            {getContent()}
          </Typography>
          <Typography variant="subtitle2" color="textSecondary">
            Confirmation Step {step} of 3
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color={title.includes('Delete') ? 'error' : 'primary'}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : title.includes('Delete') ? 'Delete' : 'Close Account'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TripleConfirmDialog;
