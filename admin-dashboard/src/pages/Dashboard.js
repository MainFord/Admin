// src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import { Typography, Grid, Paper } from '@mui/material';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPayments: 0,
    pendingWithdrawals: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // You might need to create specific endpoints for statistics
        const usersResponse = await api.get('/users');
        const paymentsResponse = await api.get('/payments');
        const pendingResponse = await api.get('/withdrawal-status?status=pending');

        setStats({
          totalUsers: usersResponse.data.total,
          totalPayments: paymentsResponse.data.total,
          pendingWithdrawals: pendingResponse.data.total,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Total Users</Typography>
            <Typography variant="h4">{stats.totalUsers}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Total Payments</Typography>
            <Typography variant="h4">{stats.totalPayments}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Pending Withdrawals</Typography>
            <Typography variant="h4">{stats.pendingWithdrawals}</Typography>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard;
