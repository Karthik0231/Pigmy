// src/components/Sidebar.jsx
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
import SettingsIcon from '@mui/icons-material/Settings';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PaymentIcon from '@mui/icons-material/Payment';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import FeedbackIcon from '@mui/icons-material/Feedback';
import PersonIcon from '@mui/icons-material/Person';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const drawerWidth = 240;

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
          localStorage.removeItem('adminToken');
    navigate('/login');
    });
  };

  const menuItems = [
    { text: 'Dashboard', icon: <HomeIcon />, path: '/dashboard' },
    { text: 'Collectors', icon: <AccountBalanceWalletIcon />, path: '/collectors' },
    { text: 'Pigmy Plans', icon: <PaymentIcon />, path: '/pigmyplans' },
    { text: 'Customers', icon: <PeopleIcon />, path: '/customers' },
    { text: 'Payments', icon: <NotificationsIcon />, path: '/payments' },
    { text: 'Feedbacks', icon: < FeedbackIcon/>, path: '/feedbacks' },
  ];

 const settingsItems = [
     { text: 'Logout', icon: <LogoutIcon />, action: handleLogout }
   ];
 
   const drawerContent = (
     <>
       {/* User Header */}
       <Box sx={{ 
         padding: 2, 
         marginTop: '64px', // Account for header height
         display: 'flex',
         alignItems: 'center',
         backgroundColor: 'purple',
         color: 'white'
       }}>
         <Avatar sx={{ bgcolor: '#fff', color: '#1976d2', mr: 2 }}>
           <PersonIcon />
         </Avatar>
         <Box>
           <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
             Admin Panel
           </Typography>
           <Typography variant="caption">
             Welcome Back
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
                 backgroundColor: '#e3f2fd',
                 '& .MuiListItemIcon-root': {
                   color: '#1976d2',
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
                 backgroundColor: text === 'Logout' ? '#ffebee' : '#e3f2fd',
                 '& .MuiListItemIcon-root': {
                   color: text === 'Logout' ? '#d32f2f' : '#1976d2',
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
     </>
   );
 
   return (
     <Drawer
       variant={isMobile ? 'temporary' : 'persistent'}
       open={open}
       onClose={onClose}
       ModalProps={{
         keepMounted: true, // Better mobile performance
       }}
       sx={{
         width: drawerWidth,
         flexShrink: 0,
         '& .MuiDrawer-paper': { 
           width: drawerWidth, 
           boxSizing: 'border-box',
           backgroundColor: '#f8f9fa',
           borderRight: '1px solid #e0e0e0',
           // Smooth transition for desktop
           ...(!isMobile && {
             transition: theme.transitions.create('transform', {
               easing: theme.transitions.easing.sharp,
               duration: theme.transitions.duration.enteringScreen,
             }),
           }),
         },
       }}
     >
       {drawerContent}
     </Drawer>
   );
 };
 
 export default Sidebar;