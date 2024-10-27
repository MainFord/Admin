// src/pages/Payments.js

import React, { useEffect, useState } from 'react';
import {
  Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Alert, FormControlLabel, Checkbox, Box, CircularProgress,
  TablePagination
} from '@mui/material';
import api from '../services/api'; // Ensure this points to your API utility

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [editData, setEditData] = useState({
    // Define necessary fields for editing a payment
    status: '',
    // Add other fields as required
  });
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false); // Loading state

  // Pagination State
  const [page, setPage] = useState(0); // Current page (zero-based)
  const [rowsPerPage, setRowsPerPage] = useState(10); // Rows per page
  const [totalPayments, setTotalPayments] = useState(0); // Total number of payments

  // Fetch payments with pagination
  const fetchPayments = async (currentPage = page, currentRowsPerPage = rowsPerPage) => {
    setLoading(true);
    setError('');
    try {
      const start = currentPage * currentRowsPerPage;
      const end = start + currentRowsPerPage - 1;
      const range = JSON.stringify([start, end]);
      const filter = JSON.stringify({}); // Adjust filters if needed
      const sort = JSON.stringify(["requestDate", "DESC"]); // Adjust sort if needed

      const response = await api.get('/payments', {
        params: {
          filter,
          range,
          sort,
        },
      });

      // Ensure that 'data' and 'total' are present
      if (response.data && Array.isArray(response.data.data) && typeof response.data.total === 'number') {
        setPayments(response.data.data);
        setTotalPayments(response.data.total);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch payments.');
      setPayments([]);
      setTotalPayments(0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    fetchPayments(newPage, rowsPerPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0); // Reset to first page
    fetchPayments(0, newRowsPerPage);
  };

  // Handle Edit
  const handleEdit = async (payment) => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      // Fetch detailed payment data if necessary
      const response = await api.get(`/payments/${payment._id}`);
      if (response.data) {
        setSelectedPayment(response.data);
        setEditData({
          status: response.data.status || '',
          // Initialize other fields as required
        });
      } else {
        throw new Error('Payment data not found');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch payment details.');
      setSelectedPayment(null);
    }
    setLoading(false);
  };

  // Handle Edit Change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle Edit Submit
  const handleEditSubmit = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      // Prepare the payload based on your backend requirements
      const payload = {
        status: editData.status,
        // Include other fields as required
      };

      await api.put(`/payments/${selectedPayment._id}`, payload);
      setSuccess('Payment updated successfully.');
      setSelectedPayment(null);
      fetchPayments();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update payment.');
    }
    setLoading(false);
  };

  // Handle Delete
  const handleDelete = async (paymentId) => {
    setError('');
    setSuccess('');
    try {
      await api.delete(`/payments/${paymentId}`);
      setSuccess('Payment deleted successfully.');
      fetchPayments();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to delete payment.');
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Payments
      </Typography>
      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Payment ID</TableCell>
                  <TableCell>User Name</TableCell>
                  <TableCell>User Email</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Request Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.length > 0 ? (
                  payments.map(payment => (
                    <TableRow key={payment._id}>
                      <TableCell>{payment.paymentId}</TableCell>
                      <TableCell>{payment.userId?.name}</TableCell>
                      <TableCell>{payment.userId?.email}</TableCell>
                      <TableCell>{payment.amount}</TableCell>
                      <TableCell>{new Date(payment.requestDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="outlined" color="secondary" onClick={() => handleEdit(payment)} sx={{ mr: 1 }}>
                          Edit
                        </Button>
                        <Button variant="outlined" color="error" onClick={() => handleDelete(payment._id)}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No payments found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination Controls */}
          <TablePagination
            component="div"
            count={totalPayments}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            sx={{ mt: 2 }}
          />
        </>
      )}

      {/* Edit Payment Dialog */}
      <Dialog open={Boolean(selectedPayment)} onClose={() => setSelectedPayment(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Payment</DialogTitle>
        <DialogContent>
          <TextField
            label="Status"
            name="status"
            value={editData.status}
            onChange={handleEditChange}
            fullWidth
            margin="normal"
          />
          {/* Add other fields as necessary */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedPayment(null)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained" color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Payments;
