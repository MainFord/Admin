// src/components/ProtectedRoute.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Layout/Header';
import Sidebar from './Layout/Sidebar';
import { Box } from '@mui/material';

const ProtectedRoute = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Header />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 3,
          marginTop: '64px', // Height of the AppBar (default is 64px)
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default ProtectedRoute;
