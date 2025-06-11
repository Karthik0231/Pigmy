// src/components/CollectorSidebar.jsx
import React from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const drawerWidth = 240;

const CollectorSidebar = ({ open, onClose }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    Swal.fire({
      title: 'Confirm Logout',
      text: 'Are you sure you want to logout?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1976d2',
      cancelButtonColor: '#757575',
      confirmButtonText: 'Yes, Logout',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    })
    .then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('collectorToken');
        navigate('/login');
      }
    });
  };

  const menuItems = [
    { text: 'Dashboard', icon: <HomeIcon />, path: '/dashboard' },
    { text: 'My Customers', icon: <PeopleIcon />, path: '/assigned-customers' },
    { text: 'Deposits', icon: <AccountBalanceWalletIcon />, path: '/manage-deposits' },
    { text: 'Withdrawal Requests', icon: <ReceiptIcon />, path: '/withdrawal-requests' },
    { text:'Feedbacks', icon: <AssessmentIcon />, path: '/feedbacks' },
    { text: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
  ];

  const settingsItems = [
    { text: 'Logout', icon: <LogoutIcon />, action: handleLogout },
  ];

  return (
    <Drawer
      variant="persistent"
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': { 
          width: drawerWidth, 
          boxSizing: 'border-box',
          backgroundColor: '#f8f9fa',
          borderRight: '1px solid #e0e0e0'
        },
      }}
    >
      {/* Collector Header */}
      <Box sx={{ 
        padding: 2, 
        marginTop: '64px',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#2e7d32',
        color: 'white'
      }}>
        <Avatar sx={{ bgcolor: '#fff', color: '#2e7d32', mr: 2 }}>
          <PersonIcon />
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Collector Panel
          </Typography>
          <Typography variant="caption">
            Pigmy Collection
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Main Menu Items */}
      <List sx={{ flexGrow: 1, pt: 1 }}>
        {menuItems.map(({ text, icon, path }) => (
          <ListItem 
            button 
            key={text} 
            onClick={() => navigate(path)}
            sx={{
              mx: 1,
              mb: 0.5,
              borderRadius: 1,
              '&:hover': {
                backgroundColor: '#e8f5e8',
                '& .MuiListItemIcon-root': {
                  color: '#2e7d32',
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {icon}
            </ListItemIcon>
            <ListItemText 
              primary={text}
              primaryTypographyProps={{
                fontSize: '0.9rem',
                fontWeight: 500
              }}
            />
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* Settings & Logout */}
      <List sx={{ pb: 2 }}>
        {settingsItems.map(({ text, icon, path, action }) => (
          <ListItem 
            button 
            key={text} 
            onClick={action || (() => navigate(path))}
            sx={{
              mx: 1,
              mb: 0.5,
              borderRadius: 1,
              '&:hover': {
                backgroundColor: text === 'Logout' ? '#ffebee' : '#e8f5e8',
                '& .MuiListItemIcon-root': {
                  color: text === 'Logout' ? '#d32f2f' : '#2e7d32',
                },
                '& .MuiListItemText-primary': {
                  color: text === 'Logout' ? '#d32f2f' : 'inherit',
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {icon}
            </ListItemIcon>
            <ListItemText 
              primary={text}
              primaryTypographyProps={{
                fontSize: '0.9rem',
                fontWeight: 500
              }}
            />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default CollectorSidebar;