// src/pages/profit.tsx

"use client";
import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import axios from 'axios';

interface IOtherCost {
  _id?: string;
  name: string;
  amount: number;
}

interface IProfit {
  _id: string;
  totalProductsSold: number;
  totalRevenue: number;
  ourProfit: number;
  otherCosts: IOtherCost[];
  createdAt: string;
  updatedAt: string;
}

const ProfitPage: React.FC = () => {
  const [profit, setProfit] = useState<IProfit | null>(null);
  const [otherCosts, setOtherCosts] = useState<IOtherCost[]>([]);
  const [newOtherCost, setNewOtherCost] = useState<IOtherCost>({ name: '', amount: 0 });
  const [editOtherCost, setEditOtherCost] = useState<IOtherCost | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch Profit data
  const fetchProfit = async () => {
    try {
      const res = await axios.get('/api/profit');
      console.log("GET /api/profit response:", res.data); // Debugging line
      if (res.data.success && res.data.data.length > 0) {
        const latestProfit = res.data.data[0]; // Assuming the latest is first due to sorting
        setProfit(latestProfit);
        setOtherCosts(latestProfit.otherCosts);
      } else {
        setProfit(null); // No Profit data exists
        setOtherCosts([]);
      }
    } catch (error) {
      console.error("Error fetching Profit data:", error);
      setSnackbar({ open: true, message: 'Failed to fetch Profit data', severity: 'error' });
    }
  };

  useEffect(() => {
    fetchProfit();
  }, []);

  // Handle adding a new other cost
  const handleAddOtherCost = async () => {
    if (!newOtherCost.name.trim() || newOtherCost.amount < 0) {
      setSnackbar({ open: true, message: 'Please provide valid name and amount', severity: 'error' });
      return;
    }

    try {
      const updatedOtherCosts = [...otherCosts, newOtherCost];
      await updateProfit({ otherCosts: updatedOtherCosts });
      setOtherCosts(updatedOtherCosts);
      setNewOtherCost({ name: '', amount: 0 });
      setSnackbar({ open: true, message: 'Other cost added successfully', severity: 'success' });
    } catch (error) {
      console.error(error);
      setSnackbar({ open: true, message: 'Failed to add other cost', severity: 'error' });
    }
  };

  // Handle editing an existing other cost
  const handleEditOtherCost = (cost: IOtherCost) => {
    setEditOtherCost(cost);
    setOpenEditDialog(true);
  };

  const handleUpdateOtherCost = async () => {
    if (!editOtherCost) return;

    if (!editOtherCost.name.trim() || editOtherCost.amount < 0) {
      setSnackbar({ open: true, message: 'Please provide valid name and amount', severity: 'error' });
      return;
    }

    try {
      const updatedOtherCosts = otherCosts.map((cost) =>
        cost._id === editOtherCost._id ? editOtherCost : cost
      );
      await updateProfit({ otherCosts: updatedOtherCosts });
      setOtherCosts(updatedOtherCosts);
      setEditOtherCost(null);
      setOpenEditDialog(false);
      setSnackbar({ open: true, message: 'Other cost updated successfully', severity: 'success' });
    } catch (error) {
      console.error(error);
      setSnackbar({ open: true, message: 'Failed to update other cost', severity: 'error' });
    }
  };

  // Handle deleting an existing other cost
  const handleDeleteOtherCost = async (id: string) => {
    try {
      const updatedOtherCosts = otherCosts.filter((cost) => cost._id !== id);
      await updateProfit({ otherCosts: updatedOtherCosts });
      setOtherCosts(updatedOtherCosts);
      setSnackbar({ open: true, message: 'Other cost deleted successfully', severity: 'success' });
    } catch (error) {
      console.error(error);
      setSnackbar({ open: true, message: 'Failed to delete other cost', severity: 'error' });
    }
  };

  // Update Profit document
  const updateProfit = async (data: Partial<IProfit>) => {
    if (!profit) return;

    try {
      const res = await axios.put(`/api/profit/${profit._id}`, data);
      console.log("PUT /api/profit/:id response:", res.data); // Debugging line
      if (res.data.success) {
        setProfit(res.data.data);
      } else {
        throw new Error(res.data.error || 'Failed to update Profit');
      }
    } catch (error) {
      throw error;
    }
  };

  // Recalculate Profit based on approved Orders
  const handleRecalculateProfit = async () => {
    try {
      const res = await axios.post('/api/profit/recalculate');
      console.log("POST /api/profit/recalculate response:", res.data); // Debugging line
      if (res.data.success) {
        setProfit(res.data.data);
        setOtherCosts(res.data.data.otherCosts);
        setSnackbar({ open: true, message: 'Profit recalculated successfully', severity: 'success' });
      } else {
        throw new Error(res.data.error || 'Failed to recalculate Profit');
      }
    } catch (error) {
      console.error("Error recalculating profit:", error);
      setSnackbar({ open: true, message: 'Failed to recalculate Profit', severity: 'error' });
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Profit Dashboard
      </Typography>

      {/* Recalculate Profit Button - Always Visible */}
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 2, mb: 2 }}
        onClick={handleRecalculateProfit}
      >
        Recalculate Profit
      </Button>

      {profit ? (
        <>
          <Typography variant="h6">Total Products Sold: {profit.totalProductsSold}</Typography>
          <Typography variant="h6">Total Revenue: ${profit.totalRevenue.toFixed(2)}</Typography>
          <Typography variant="h6">Our Profit: ${profit.ourProfit.toFixed(2)}</Typography>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            Other Costs
          </Typography>
          <TableContainer component={Paper}>
            <Table aria-label="other costs table">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell align="right">Amount ($)</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {otherCosts.map((cost) => (
                  <TableRow key={cost._id}>
                    <TableCell>{cost.name}</TableCell>
                    <TableCell align="right">{cost.amount.toFixed(2)}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleEditOtherCost(cost)}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteOtherCost(cost._id!)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell>
                    <TextField
                      label="Name"
                      value={newOtherCost.name}
                      onChange={(e) => setNewOtherCost({ ...newOtherCost, name: e.target.value })}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      label="Amount"
                      type="number"
                      value={newOtherCost.amount}
                      onChange={(e) =>
                        setNewOtherCost({ ...newOtherCost, amount: parseFloat(e.target.value) })
                      }
                      fullWidth
                      inputProps={{ min: 0, step: '0.01' }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button variant="contained" color="success" onClick={handleAddOtherCost}>
                      Add
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : (
        <Typography variant="body1" sx={{ mt: 4 }}>
          No Profit data available. Click on "Recalculate Profit" to generate Profit data based on approved Orders.
        </Typography>
      )}

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Edit Other Cost</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Name"
            fullWidth
            value={editOtherCost?.name || ''}
            onChange={(e) => setEditOtherCost({ ...editOtherCost!, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            value={editOtherCost?.amount || 0}
            onChange={(e) =>
              setEditOtherCost({ ...editOtherCost!, amount: parseFloat(e.target.value) })
            }
            inputProps={{ min: 0, step: '0.01' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateOtherCost} variant="contained" color="primary">
            Save
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
    </Container>
  );
}

export default ProfitPage;
