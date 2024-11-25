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
  CircularProgress,
  Box,
  Tooltip,
} from '@mui/material';
import { Edit, Delete, Close, Add } from '@mui/icons-material';
import axios from 'axios';
import CloseAccountDialog from '@/components/CloseAccountDialog';

// Interfaces
interface IOtherCost {
  _id?: string;
  name: string;
  amount: number;
}

interface ITitle {
  _id?: string;
  name: string;
  description?: string;
}

interface IProfit {
  _id: string;
  totalProductsSold: number;
  totalRevenue: number;
  ourProfit: number;
  otherCosts: IOtherCost[];
  titles: ITitle[];
  status: 'open' | 'closed';
  createdAt: string;
  updatedAt: string;
}

const ProfitPage: React.FC = () => {
  // State Variables
  const [profit, setProfit] = useState<IProfit | null>(null);
  const [otherCosts, setOtherCosts] = useState<IOtherCost[]>([]);
  const [titles, setTitles] = useState<ITitle[]>([]); // State for Titles

  const [newOtherCost, setNewOtherCost] = useState<IOtherCost>({ name: '', amount: 0 });
  const [editOtherCost, setEditOtherCost] = useState<IOtherCost | null>(null);
  const [openEditOtherCostDialog, setOpenEditOtherCostDialog] = useState(false);

  const [newTitle, setNewTitle] = useState<ITitle>({ name: '', description: '' });
  const [editTitle, setEditTitle] = useState<ITitle | null>(null);
  const [openEditTitleDialog, setOpenEditTitleDialog] = useState(false);

  const [openAddTitleDialog, setOpenAddTitleDialog] = useState(false); // Dialog for adding titles
  const [openCloseDialog, setOpenCloseDialog] = useState(false); // Dialog for closing account

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const [loading, setLoading] = useState(false); // Loading state for close account action

  // New States for All Profit Documents
  const [allProfits, setAllProfits] = useState<IProfit[]>([]);
  const [viewDetailsProfit, setViewDetailsProfit] = useState<IProfit | null>(null);
  const [openViewDetailsDialog, setOpenViewDetailsDialog] = useState(false);

  // Fetch Profit data
  const fetchProfit = async () => {
    try {
      const res = await axios.get('/api/profit');
      console.log("GET /api/profit response:", res.data); // Debugging line
      if (res.data.success && res.data.data.length > 0) {
        setAllProfits(res.data.data);
        const latestProfit = res.data.data.find((p: IProfit) => p.status === 'open');
        if (latestProfit) {
          console.log("Latest open Profit:", latestProfit); // Debugging
          setProfit(latestProfit);
          setOtherCosts(latestProfit.otherCosts || []);
          setTitles(latestProfit.titles || []);
        } else {
          // Handle cases where 'status' might be missing
          const fallbackProfit = res.data.data[0]; // Choose the most recent as fallback
          if (fallbackProfit) {
            console.warn("No open Profit account found. Falling back to the latest Profit account.");
            setProfit(fallbackProfit);
            setOtherCosts(fallbackProfit.otherCosts || []);
            setTitles(fallbackProfit.titles || []);
          } else {
            setProfit(null); // No open Profit account exists
            setOtherCosts([]);
            setTitles([]);
          }
        }
      } else {
        setAllProfits([]);
        setProfit(null); // No Profit data exists
        setOtherCosts([]);
        setTitles([]);
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
    if (!profit) {
      setSnackbar({ open: true, message: 'No active Profit account to add costs.', severity: 'error' });
      return;
    }

    if (profit.status !== 'open') {
      setSnackbar({ open: true, message: 'Cannot add costs to a closed Profit account.', severity: 'error' });
      return;
    }

    if (!newOtherCost.name.trim() || newOtherCost.amount < 0) {
      setSnackbar({ open: true, message: 'Please provide valid name and amount for Other Cost', severity: 'error' });
      return;
    }

    try {
      const updatedOtherCosts = [...otherCosts, newOtherCost];
      await updateProfit({ otherCosts: updatedOtherCosts });
      setOtherCosts(updatedOtherCosts);
      setNewOtherCost({ name: '', amount: 0 });
      setSnackbar({ open: true, message: 'Other Cost added successfully', severity: 'success' });
    } catch (error) {
      console.error(error);
      setSnackbar({ open: true, message: 'Failed to add Other Cost', severity: 'error' });
    }
  };

  // Handle editing an existing other cost
  const handleEditOtherCost = (cost: IOtherCost) => {
    setEditOtherCost(cost);
    setOpenEditOtherCostDialog(true);
  };

  const handleUpdateOtherCost = async () => {
    if (!editOtherCost) return;

    if (!editOtherCost.name.trim() || editOtherCost.amount < 0) {
      setSnackbar({ open: true, message: 'Please provide valid name and amount for Other Cost', severity: 'error' });
      return;
    }

    try {
      const updatedOtherCosts = otherCosts.map((cost) =>
        cost._id === editOtherCost._id ? editOtherCost : cost
      );
      await updateProfit({ otherCosts: updatedOtherCosts });
      setOtherCosts(updatedOtherCosts);
      setEditOtherCost(null);
      setOpenEditOtherCostDialog(false);
      setSnackbar({ open: true, message: 'Other Cost updated successfully', severity: 'success' });
    } catch (error) {
      console.error(error);
      setSnackbar({ open: true, message: 'Failed to update Other Cost', severity: 'error' });
    }
  };

  // Handle deleting an existing other cost
  const handleDeleteOtherCost = async (id: string) => {
    if (!profit) {
      setSnackbar({ open: true, message: 'No active Profit account found.', severity: 'error' });
      return;
    }

    if (profit.status !== 'open') {
      setSnackbar({ open: true, message: 'Cannot delete costs from a closed Profit account.', severity: 'error' });
      return;
    }

    try {
      const updatedOtherCosts = otherCosts.filter((cost) => cost._id !== id);
      await updateProfit({ otherCosts: updatedOtherCosts });
      setOtherCosts(updatedOtherCosts);
      setSnackbar({ open: true, message: 'Other Cost deleted successfully', severity: 'success' });
    } catch (error) {
      console.error(error);
      setSnackbar({ open: true, message: 'Failed to delete Other Cost', severity: 'error' });
    }
  };

  // Handle adding a new title
  const handleAddTitle = async () => {
    if (!profit) {
      setSnackbar({ open: true, message: 'No active Profit account to add titles.', severity: 'error' });
      return;
    }

    if (profit.status !== 'open') {
      setSnackbar({ open: true, message: 'Cannot add titles to a closed Profit account.', severity: 'error' });
      return;
    }

    if (!newTitle.name.trim()) {
      setSnackbar({ open: true, message: 'Title name is required', severity: 'error' });
      return;
    }

    try {
      const updatedTitles = [...titles, newTitle];
      await updateProfit({ titles: updatedTitles });
      setTitles(updatedTitles);
      setNewTitle({ name: '', description: '' });
      setSnackbar({ open: true, message: 'Title added successfully', severity: 'success' });
      setOpenAddTitleDialog(false);
    } catch (error) {
      console.error(error);
      setSnackbar({ open: true, message: 'Failed to add Title', severity: 'error' });
    }
  };

  // Handle editing an existing title
  const handleEditTitle = (title: ITitle) => {
    setEditTitle(title);
    setOpenEditTitleDialog(true);
  };

  const handleUpdateTitle = async () => {
    if (!editTitle) return;

    if (!editTitle.name.trim()) {
      setSnackbar({ open: true, message: 'Please provide a valid name for Title', severity: 'error' });
      return;
    }

    try {
      const updatedTitles = titles.map((t) =>
        t._id === editTitle._id ? editTitle : t
      );
      await updateProfit({ titles: updatedTitles });
      setTitles(updatedTitles);
      setEditTitle(null);
      setOpenEditTitleDialog(false);
      setSnackbar({ open: true, message: 'Title updated successfully', severity: 'success' });
    } catch (error) {
      console.error(error);
      setSnackbar({ open: true, message: 'Failed to update Title', severity: 'error' });
    }
  };

  // Handle deleting an existing title
  const handleDeleteTitle = async (id: string) => {
    if (!profit) {
      setSnackbar({ open: true, message: 'No active Profit account found.', severity: 'error' });
      return;
    }

    if (profit.status !== 'open') {
      setSnackbar({ open: true, message: 'Cannot delete titles from a closed Profit account.', severity: 'error' });
      return;
    }

    try {
      const updatedTitles = titles.filter((t) => t._id !== id);
      await updateProfit({ titles: updatedTitles });
      setTitles(updatedTitles);
      setSnackbar({ open: true, message: 'Title deleted successfully', severity: 'success' });
    } catch (error) {
      console.error(error);
      setSnackbar({ open: true, message: 'Failed to delete Title', severity: 'error' });
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
        // Update otherCosts and titles if they are part of the updated data
        if (res.data.data.otherCosts) setOtherCosts(res.data.data.otherCosts);
        if (res.data.data.titles) setTitles(res.data.data.titles);
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
        setOtherCosts(res.data.data.otherCosts || []);
        setTitles(res.data.data.titles || []);
        setSnackbar({ open: true, message: 'Profit recalculated successfully', severity: 'success' });
        // Refresh allProfits to include the updated document
        await fetchProfit();
      } else {
        throw new Error(res.data.error || 'Failed to recalculate Profit');
      }
    } catch (error) {
      console.error("Error recalculating profit:", error);
      setSnackbar({ open: true, message: 'Failed to recalculate Profit', severity: 'error' });
    }
  };

  // Handle Close Account
  const handleCloseAccount = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/profit/close');
      console.log("POST /api/profit/close response:", res.data); // Debugging line
      if (res.data.success) {
        setProfit(res.data.data);
        setOtherCosts(res.data.data.otherCosts || []);
        setTitles(res.data.data.titles || []);
        setSnackbar({ open: true, message: 'Account closed successfully and new Profit account created', severity: 'success' });
        // Refresh allProfits to include the new Profit document
        await fetchProfit();
      } else {
        throw new Error(res.data.error || 'Failed to close account');
      }
    } catch (error) {
      console.error("Error closing account:", error);
      setSnackbar({ open: true, message: 'Failed to close account', severity: 'error' });
    } finally {
      setLoading(false);
      setOpenCloseDialog(false);
    }
  };

  // Handle viewing details of a Profit account
  const handleViewDetails = (profitData: IProfit) => {
    setViewDetailsProfit(profitData);
    setOpenViewDetailsDialog(true);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Profit Dashboard
      </Typography>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleRecalculateProfit}
        >
          Recalculate Profit
        </Button>

        {/* Close Account Button - Visible only if there is an open Profit account */}
        {profit && profit.status === 'open' && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<Close />}
            onClick={() => setOpenCloseDialog(true)}
          >
            Close Account
          </Button>
        )}

        {/* Add Title Button */}
        {profit && profit.status === 'open' && (
          <Button
            variant="contained"
            color="secondary"
            startIcon={<Add />}
            onClick={() => setOpenAddTitleDialog(true)}
          >
            Add Title
          </Button>
        )}
      </Box>

      {/* Profit Details */}
      {profit ? (
        <>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="h6">Total Products Sold: {profit.totalProductsSold}</Typography>
            <Typography variant="h6">Total Revenue: ${profit.totalRevenue.toFixed(2)}</Typography>
            <Typography variant="h6">Our Profit: ${profit.ourProfit.toFixed(2)}</Typography>
            <Typography variant="h6">
              Status: {profit.status ? profit.status.charAt(0).toUpperCase() + profit.status.slice(1) : 'Unknown'}
            </Typography>
          </Box>

          {/* Other Costs Section */}
          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            Other Costs
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 4 }}>
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
                      <Tooltip title="Edit">
                        <IconButton onClick={() => handleEditOtherCost(cost)}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => handleDeleteOtherCost(cost._id!)}>
                          <Delete />
                        </IconButton>
                      </Tooltip>
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

          {/* Titles Section */}
          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            Titles
          </Typography>
          <TableContainer component={Paper}>
            <Table aria-label="titles table">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {titles.map((title) => (
                  <TableRow key={title._id}>
                    <TableCell>{title.name}</TableCell>
                    <TableCell>{title.description || '-'}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton onClick={() => handleEditTitle(title)}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => handleDeleteTitle(title._id!)}>
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {/* No inline add row for Titles; use Dialog instead */}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : (
        <Typography variant="body1" sx={{ mt: 4 }}>
          No Profit data available. Click on "Recalculate Profit" to generate Profit data based on approved Orders.
        </Typography>
      )}

      {/* All Profit Accounts Section */}
      {allProfits.length > 1 && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" gutterBottom>
            Previous Profit Accounts
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table aria-label="all profits table">
              <TableHead>
                <TableRow>
                  <TableCell>Account ID</TableCell>
                  <TableCell>Total Products Sold</TableCell>
                  <TableCell>Total Revenue ($)</TableCell>
                  <TableCell>Our Profit ($)</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Updated At</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allProfits.map((p) => (
                  <TableRow key={p._id} sx={{ backgroundColor: p.status === 'closed' ? '#f0f0f0' : 'inherit' }}>
                    <TableCell>{p._id}</TableCell>
                    <TableCell>{p.totalProductsSold}</TableCell>
                    <TableCell>{p.totalRevenue.toFixed(2)}</TableCell>
                    <TableCell>{p.ourProfit.toFixed(2)}</TableCell>
                    <TableCell>
                      <Typography color={p.status === 'open' ? 'green' : 'red'}>
                        {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                      </Typography>
                    </TableCell>
                    <TableCell>{new Date(p.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{new Date(p.updatedAt).toLocaleString()}</TableCell>
                    <TableCell align="right">
                      {p.status === 'closed' && (
                        <Tooltip title="View Details">
                          <IconButton onClick={() => handleViewDetails(p)}>
                            <Edit />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* View Details Dialog */}
      <Dialog open={openViewDetailsDialog} onClose={() => setOpenViewDetailsDialog(false)}>
        <DialogTitle>Profit Account Details</DialogTitle>
        <DialogContent>
          {viewDetailsProfit && (
            <>
              <Typography variant="subtitle1">Account ID: {viewDetailsProfit._id}</Typography>
              <Typography variant="subtitle1">Total Products Sold: {viewDetailsProfit.totalProductsSold}</Typography>
              <Typography variant="subtitle1">Total Revenue: ${viewDetailsProfit.totalRevenue.toFixed(2)}</Typography>
              <Typography variant="subtitle1">Our Profit: ${viewDetailsProfit.ourProfit.toFixed(2)}</Typography>
              <Typography variant="subtitle1">
                Status: {viewDetailsProfit.status.charAt(0).toUpperCase() + viewDetailsProfit.status.slice(1)}
              </Typography>
              <Typography variant="subtitle1">Created At: {new Date(viewDetailsProfit.createdAt).toLocaleString()}</Typography>
              <Typography variant="subtitle1">Updated At: {new Date(viewDetailsProfit.updatedAt).toLocaleString()}</Typography>

              {/* Other Costs */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6">Other Costs</Typography>
                <TableContainer component={Paper}>
                  <Table aria-label="other costs table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell align="right">Amount ($)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {viewDetailsProfit.otherCosts.map((cost) => (
                        <TableRow key={cost._id}>
                          <TableCell>{cost.name}</TableCell>
                          <TableCell align="right">{cost.amount.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Titles */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6">Titles</Typography>
                <TableContainer component={Paper}>
                  <Table aria-label="titles table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Description</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {viewDetailsProfit.titles.map((title) => (
                        <TableRow key={title._id}>
                          <TableCell>{title.name}</TableCell>
                          <TableCell>{title.description || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Other Cost Dialog */}
      <Dialog open={openEditOtherCostDialog} onClose={() => setOpenEditOtherCostDialog(false)}>
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
          <Button onClick={() => setOpenEditOtherCostDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateOtherCost} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Title Dialog */}
      <Dialog open={openAddTitleDialog} onClose={() => setOpenAddTitleDialog(false)}>
        <DialogTitle>Add New Title</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Title Name"
            fullWidth
            value={newTitle.name}
            onChange={(e) => setNewTitle({ ...newTitle, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={newTitle.description}
            onChange={(e) => setNewTitle({ ...newTitle, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddTitleDialog(false)}>Cancel</Button>
          <Button onClick={handleAddTitle} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Title Dialog */}
      <Dialog open={openEditTitleDialog} onClose={() => setOpenEditTitleDialog(false)}>
        <DialogTitle>Edit Title</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Title Name"
            fullWidth
            value={editTitle?.name || ''}
            onChange={(e) => setEditTitle({ ...editTitle!, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={editTitle?.description || ''}
            onChange={(e) => setEditTitle({ ...editTitle!, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditTitleDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateTitle} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Close Account Confirmation Dialog */}
      <CloseAccountDialog
        open={openCloseDialog}
        onClose={() => setOpenCloseDialog(false)}
        onConfirm={handleCloseAccount}
        loading={loading}
      />

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
