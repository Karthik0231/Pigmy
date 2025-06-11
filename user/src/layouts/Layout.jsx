import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';

const drawerWidth = 240;

const AdminLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  
  // State for sidebar visibility
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
      setMobileOpen(false);
    }
  }, [isMobile]);

  const handleMenuClick = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  const handleSidebarClose = () => {
    if (isMobile) {
      setMobileOpen(false);
    } else {
      setSidebarOpen(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Header - Fixed position */}
      <Header 
        onMenuClick={handleMenuClick}
        sidebarOpen={sidebarOpen}
      />
      
      {/* Sidebar */}
      <Sidebar 
        open={isMobile ? mobileOpen : sidebarOpen}
        onClose={handleSidebarClose}
      />
      
      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          // Dynamic width and margin based on sidebar state
          width: isMobile 
            ? '100%' 
            : sidebarOpen 
              ? `calc(100% - ${drawerWidth}px)` 
              : '100%',
          // Smooth transition when sidebar toggles
          transition: theme.transitions.create(['margin-left', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          // Ensure content doesn't go under header
          marginTop: '64px', // Height of the header
          minHeight: 'calc(100vh - 64px)', // Full height minus header
        }}
      >
        <Box
          sx={{
            // Add responsive padding and spacing
            px: {
              xs: 1,
              sm: 2,
              md: 3,
            },
            py: {
              xs: 1,
              sm: 2,
            },
            // Ensure proper scrolling
            overflowX: 'auto',
            width: '100%',
          }}
        >
          <Outlet />
        </Box>
      </Box>
      
      {/* Backdrop for mobile when sidebar is open */}
      {isMobile && mobileOpen && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            zIndex: theme.zIndex.drawer - 1,
          }}
          onClick={handleSidebarClose}
        />
      )}
    </Box>
  );
};

export default AdminLayout;