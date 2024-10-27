// src/pages/Users.js
import React, { useEffect, useState } from 'react';
import {
  Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Alert, FormControlLabel, Checkbox, Box, CircularProgress,
  TablePagination
} from '@mui/material';
import api from '../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    accountDetails: {
      accountNumber: '',
      ifsc: '',
      holderName: '',
    },
    adminApproved: false,
    courses: [
      {
        url1: '',
        url2: '',
        url3: '',
      },
    ],
    images: [],
  });
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false); // Loading state

  // Pagination State
  const [page, setPage] = useState(0); // Current page (zero-based)
  const [rowsPerPage, setRowsPerPage] = useState(10); // Rows per page
  const [totalUsers, setTotalUsers] = useState(0); // Total number of users

  // State for Screenshot Modal
  const [screenshotUrl, setScreenshotUrl] = useState(null); // To store the current screenshot URL

  const fetchUsers = async (currentPage = page, currentRowsPerPage = rowsPerPage) => {
    setLoading(true);
    try {
      const start = currentPage * currentRowsPerPage;
      const end = start + currentRowsPerPage - 1;
      const range = JSON.stringify([start, end]);
      const filter = JSON.stringify({}); // Adjust filters if needed
      const sort = JSON.stringify(["id", "ASC"]); // Adjust sort if needed
      const selectFields = JSON.stringify('name email adminApproved referralCode paymentUrlOfReg'); // Include paymentUrlOfReg

      const response = await api.get('/users', {
        params: {
          filter,
          range,
          sort,
          select: selectFields, // Add select parameter
        },
      });

      setUsers(response.data.data);
      setTotalUsers(response.data.total);
    } catch (err) {
      setError('Failed to fetch users.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    fetchUsers(newPage, rowsPerPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0); // Reset to first page
    fetchUsers(0, newRowsPerPage);
  };

  const handleApprove = async (userId) => {
    try {
      await api.put('/approve-user', { userId });
      setSuccess('User approved successfully.');
      fetchUsers();
    } catch (err) {
      setError('Failed to approve user.');
    }
  };

  const handleDelete = async (userId) => {
    try {
      await api.delete(`/users/${userId}`);
      setSuccess('User deleted successfully.');
      fetchUsers();
    } catch (err) {
      setError('Failed to delete user.');
    }
  };

  const handleEdit = async (user) => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const response = await api.get(`/users/${user._id}`);
      setSelectedUser(response.data); // Assuming the backend returns the user object directly
      setEditData({
        name: response.data.name,
        email: response.data.email,
        phone: response.data.phone,
        dob: response.data.dob ? new Date(response.data.dob).toISOString().substr(0, 10) : '',
        accountDetails: {
          accountNumber: response.data.accountDetails.accountNumber || '',
          ifsc: response.data.accountDetails.ifsc || '',
          holderName: response.data.accountDetails.holderName || '',
        },
        adminApproved: response.data.adminApproved || false,
        courses: response.data.courses.length > 0 ? response.data.courses : [
          {
            url1: 'PLfqMhTWNBTe137I_EPQd34TsgV6IO55pt',
            url2: 'PLXwTOG3-tRwiJmAyVJ47SVvv-dUIy2S0I',
            url3: 'PLXwTOG3-tRwgy4lJ9j_CPwpJmr2uCaGH1',
          },
        ],
        images: response.data.images || [],
      });
    } catch (err) {
      setError('Failed to fetch user details.');
    }
    setLoading(false);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    // Handle nested fields
    if (name.startsWith('accountDetails.')) {
      const field = name.split('.')[1];
      setEditData((prev) => ({
        ...prev,
        accountDetails: {
          ...prev.accountDetails,
          [field]: value,
        },
      }));
    } else if (name.startsWith('courses[')) {
      const regex = /^courses\[(\d+)\]\.(\w+)$/;
      const match = name.match(regex);
      if (match) {
        const index = parseInt(match[1], 10);
        const field = match[2];
        const updatedCourses = [...editData.courses];
        updatedCourses[index][field] = value;
        setEditData((prev) => ({
          ...prev,
          courses: updatedCourses,
        }));
      }
    } else if (name.startsWith('images[')) {
      const regex = /^images\[(\d+)\]$/;
      const match = name.match(regex);
      if (match) {
        const index = parseInt(match[1], 10);
        const updatedImages = [...editData.images];
        updatedImages[index] = value;
        setEditData((prev) => ({
          ...prev,
          images: updatedImages,
        }));
      }
    } else {
      setEditData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const addImageField = () => {
    setEditData((prev) => ({
      ...prev,
      images: [...prev.images, ''],
    }));
  };

  const handleEditSubmit = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      // Prepare the payload based on your backend requirements
      const payload = {
        name: editData.name,
        email: editData.email,
        phone: editData.phone,
        dob: editData.dob,
        accountDetails: editData.accountDetails,
        adminApproved: editData.adminApproved,
        courses: editData.courses,
        images: editData.images,
      };

      await api.put(`/users/${selectedUser._id}`, payload);
      setSuccess('User updated successfully.');
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      setError('Failed to update user.');
    }
    setLoading(false);
  };

  // Handle viewing the screenshot
  const handleViewScreenshot = (url) => {
    setScreenshotUrl(url);
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Users
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
                  <TableCell>Referral Code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Admin Approved</TableCell>
                  <TableCell>Payment Screenshot</TableCell> {/* New Column */}
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user._id}>
                    <TableCell>{user.referralCode}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.adminApproved ? 'Yes' : 'No'}</TableCell>
                    <TableCell>
                      {user.paymentUrlOfReg ? (
                        <Button variant="outlined" onClick={() => handleViewScreenshot(user.paymentUrlOfReg)}>
                          View Screenshot
                        </Button>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      {!user.adminApproved && (
                        <Button variant="contained" color="primary" onClick={() => handleApprove(user._id)}>
                          Approve
                        </Button>
                      )}
                      <Button variant="outlined" color="secondary" onClick={() => handleEdit(user)} sx={{ ml: 1 }}>
                        Edit
                      </Button>
                      <Button variant="outlined" color="error" onClick={() => handleDelete(user._id)} sx={{ ml: 1 }}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination Controls */}
          <TablePagination
            component="div"
            count={totalUsers}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            sx={{ mt: 2 }}
          />
        </>
      )}

      {/* Edit User Dialog */}
      <Dialog open={Boolean(selectedUser)} onClose={() => setSelectedUser(null)} maxWidth="md" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            name="name"
            value={editData.name}
            onChange={handleEditChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={editData.email}
            onChange={handleEditChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Phone"
            name="phone"
            type="tel"
            value={editData.phone}
            onChange={handleEditChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Date of Birth"
            name="dob"
            type="date"
            value={editData.dob}
            onChange={handleEditChange}
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
          
          {/* Account Details */}
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Account Details
          </Typography>
          <TextField
            label="Account Number"
            name="accountDetails.accountNumber"
            value={editData.accountDetails.accountNumber}
            onChange={handleEditChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="IFSC"
            name="accountDetails.ifsc"
            value={editData.accountDetails.ifsc}
            onChange={handleEditChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Holder Name"
            name="accountDetails.holderName"
            value={editData.accountDetails.holderName}
            onChange={handleEditChange}
            fullWidth
            margin="normal"
          />
          
          {/* Admin Approved */}
          <FormControlLabel
            control={
              <Checkbox
                checked={editData.adminApproved}
                onChange={(e) => setEditData({ ...editData, adminApproved: e.target.checked })}
                name="adminApproved"
              />
            }
            label="Admin Approved"
            sx={{ mt: 2 }}
          />
          
          {/* Courses */}
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Courses
          </Typography>
          {editData.courses.map((course, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label={`Course ${index + 1} URL 1`}
                name={`courses[${index}].url1`}
                value={course.url1}
                onChange={handleEditChange}
                fullWidth
              />
              <TextField
                label={`Course ${index + 1} URL 2`}
                name={`courses[${index}].url2`}
                value={course.url2}
                onChange={handleEditChange}
                fullWidth
              />
              <TextField
                label={`Course ${index + 1} URL 3`}
                name={`courses[${index}].url3`}
                value={course.url3}
                onChange={handleEditChange}
                fullWidth
              />
            </Box>
          ))}
          
          {/* Images */}
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Images
          </Typography>
          {editData.images.map((image, index) => (
            <TextField
              key={index}
              label={`Image URL ${index + 1}`}
              name={`images[${index}]`}
              value={image}
              onChange={handleEditChange}
              fullWidth
              margin="normal"
            />
          ))}
          
          {/* Add more images if needed */}
          <Button variant="outlined" onClick={() => addImageField()} sx={{ mt: 1 }}>
            Add Image
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedUser(null)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained" color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Screenshot Modal */}
      <Dialog
        open={Boolean(screenshotUrl)}
        onClose={() => setScreenshotUrl(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Payment Screenshot</DialogTitle>
        <DialogContent>
          {screenshotUrl ? (
            <Box sx={{ textAlign: 'center' }}>
              <img
                src={screenshotUrl}
                alt="Payment Screenshot"
                style={{ maxWidth: '100%', maxHeight: '80vh' }}
              />
            </Box>
          ) : (
            <Typography>No screenshot available.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScreenshotUrl(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Users;
