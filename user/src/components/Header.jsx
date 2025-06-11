// src/components/Header.jsx
import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  useTheme,
  alpha,
  Chip
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle as AccountCircleIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Header = ({ onMenuClick, sidebarOpen }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationCount] = useState(3); // Mock notification count

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Confirm Logout',
      text: "Are you sure you want to logout?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1976d2',
      cancelButtonColor: '#757575',
      confirmButtonText: 'Yes, Logout',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      customClass: {
        popup: 'swal-custom-popup'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('userToken');
        navigate('/login');
        Swal.fire({
          title: 'Logged Out',
          text: 'You have been successfully logged out.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate('/details');
  };

  const isMenuOpen = Boolean(anchorEl);

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(25, 118, 210, 0.15)',
          borderBottom: `1px solid ${alpha('#ffffff', 0.1)}`,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
            pointerEvents: 'none',
          }
        }}
      >
        <Toolbar
          sx={{
            minHeight: '64px !important',
            padding: theme.spacing(0, 2),
            position: 'relative',
          }}
        >
          {/* Left Section - Menu & Branding */}
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={onMenuClick}
              sx={{
                mr: 2,
                padding: 1.5,
                borderRadius: 2,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: alpha('#ffffff', 0.15),
                  transform: 'scale(1.05)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }
              }}
            >
              <MenuIcon />
            </IconButton>

            {/* Brand Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.9) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                <DashboardIcon sx={{ color: '#1976d2', fontSize: 20 }} />
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  component="div"
                  sx={{
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    letterSpacing: '-0.5px',
                    background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.9) 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'white',
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  }}
                >
                  User Dashboard
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: alpha('#ffffff', 0.7),
                    fontSize: '0.75rem',
                    fontWeight: 400,
                  }}
                >
                  Management Portal
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Center Section - Status */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
            <Chip
              label="Online"
              size="small"
              sx={{
                backgroundColor: alpha('#4caf50', 0.2),
                color: '#4caf50',
                border: `1px solid ${alpha('#4caf50', 0.3)}`,
                fontWeight: 600,
                fontSize: '0.75rem',
                '& .MuiChip-label': {
                  padding: '0 8px',
                }
              }}
            />
          </Box>

          {/* Right Section - Actions & Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Notifications */}

            {/* Profile Menu */}
            <Tooltip title="Account" arrow>
              <IconButton
                onClick={handleProfileMenuOpen}
                sx={{
                  padding: 0.5,
                  borderRadius: 2,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: alpha('#ffffff', 0.15),
                    transform: 'scale(1.05)',
                  }
                }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    backgroundColor: alpha('#ffffff', 0.2),
                    color: 'white',
                    border: '2px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    fontSize: '1rem',
                    fontWeight: 600,
                  }}
                >
                  <PersonIcon fontSize="small" />
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>

        {/* Animated bottom border */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, #42a5f5, #1976d2, #0d47a1, #1976d2, #42a5f5)',
            backgroundSize: '200% 100%',
            animation: 'gradient-shift 3s ease-in-out infinite',
            '@keyframes gradient-shift': {
              '0%, 100%': { backgroundPosition: '0% 50%' },
              '50%': { backgroundPosition: '100% 50%' },
            }
          }}
        />
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        PaperProps={{
          elevation: 8,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.15))',
            mt: 1.5,
            minWidth: 200,
            borderRadius: 2,
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem
          onClick={handleProfile}
          sx={{
            padding: theme.spacing(1.5, 2),
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              '& .MuiListItemIcon-root': {
                color: theme.palette.primary.main,
              }
            }
          }}
        >
          <AccountCircleIcon sx={{ mr: 2, fontSize: 20 }} />
          My Profile
        </MenuItem>
        <MenuItem
          onClick={handleLogout}
          sx={{
            padding: theme.spacing(1.5, 2),
            color: '#f44336',
            '&:hover': {
              backgroundColor: alpha('#f44336', 0.08),
              '& .MuiListItemIcon-root': {
                color: '#f44336',
              }
            }
          }}
        >
          <LogoutIcon sx={{ mr: 2, fontSize: 20 }} />
          Logout
        </MenuItem>
      </Menu>
    </>
  );
};

export default Header;