// src/components/Layout/Sidebar.js
import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Divider } from '@mui/material';
import { Dashboard, People, Payment } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

const Sidebar = () => {
  const navigate = useNavigate();

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/' },
    { text: 'Users', icon: <People />, path: '/users' },
    { text: 'Payments', icon: <Payment />, path: '/payments' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      <Toolbar />
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem button key={item.text} onClick={() => navigate(item.path)}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
