import React, { useState, useContext } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Avatar,
  InputAdornment,
  IconButton,
  Fade,
  Slide,
  Card,
  CardContent,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SecurityIcon from '@mui/icons-material/Security';
import LoginIcon from '@mui/icons-material/Login';
import { UserContext } from '../Context/Context';

// Animated background elements
const float = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-10px) rotate(1deg); }
  66% { transform: translateY(10px) rotate(-1deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.1); opacity: 0.4; }
  100% { transform: scale(1); opacity: 0.7; }
`;

const FloatingShape = styled(Box)(({ theme }) => ({
  position: 'absolute',
  borderRadius: '50%',
  background: 'rgba(255, 255, 255, 0.1)',
  animation: `${float} 6s ease-in-out infinite`,
  backdropFilter: 'blur(10px)',
}));

const PulsingShape = styled(Box)(({ theme }) => ({
  position: 'absolute',
  borderRadius: '50%',
  background: 'rgba(255, 255, 255, 0.05)',
  animation: `${pulse} 4s ease-in-out infinite`,
  backdropFilter: 'blur(5px)',
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(5),
  borderRadius: theme.spacing(3),
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #1976d2, #42a5f5, #64b5f6)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 100,
    height: 100,
    background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.1), transparent)',
    borderRadius: '50%',
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(2),
    backgroundColor: 'rgba(249, 250, 251, 0.8)',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: 'rgba(249, 250, 251, 1)',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
    '&.Mui-focused': {
      backgroundColor: 'white',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(25, 118, 210, 0.15)',
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500,
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(1.5, 0),
  fontSize: '1.1rem',
  fontWeight: 600,
  background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
  boxShadow: '0 8px 20px rgba(25, 118, 210, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(45deg, #1565c0, #1976d2)',
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 30px rgba(25, 118, 210, 0.4)',
  },
  '&:active': {
    transform: 'translateY(0)',
  }
}));

const GlassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(3),
}));

const AnimatedAvatar = styled(Avatar)(({ theme }) => ({
  background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
  width: 70,
  height: 70,
  marginBottom: theme.spacing(2),
  boxShadow: '0 8px 20px rgba(25, 118, 210, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1) rotate(5deg)',
    boxShadow: '0 12px 30px rgba(25, 118, 210, 0.4)',
  }
}));

export default function CollectorLoginPage() {
  const [credentials, setCredentials] = useState({ accountNumber: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const { userLogin, user } = useContext(UserContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    userLogin(credentials);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated Background Elements */}
      <FloatingShape
        sx={{
          width: 200,
          height: 200,
          top: '10%',
          left: '10%',
          animationDelay: '0s',
        }}
      />
      <FloatingShape
        sx={{
          width: 150,
          height: 150,
          top: '70%',
          right: '15%',
          animationDelay: '2s',
        }}
      />
      <PulsingShape
        sx={{
          width: 300,
          height: 300,
          top: '50%',
          left: '80%',
          animationDelay: '1s',
        }}
      />
      <PulsingShape
        sx={{
          width: 100,
          height: 100,
          top: '20%',
          right: '70%',
          animationDelay: '3s',
        }}
      />

      <Container maxWidth="sm">
        <Slide direction="up" in={true} timeout={800}>
          <Box>
            {/* Welcome Card */}
            <Fade in={true} timeout={1000}>
              <GlassCard>
                <CardContent sx={{ textAlign: 'center', py: 1 }}>
                  <SecurityIcon sx={{ fontSize: 40, color: 'white', mb: 1 }} />
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                    Welcome Back
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Secure access to your account
                  </Typography>
                </CardContent>
              </GlassCard>
            </Fade>

            {/* Login Form */}
            <Fade in={true} timeout={1200}>
              <StyledPaper elevation={0} sx={{ width: '100%', maxWidth: 450, mx: 'auto' }}>
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  mb={4}
                >
                  <AnimatedAvatar>
                    <LockOutlinedIcon sx={{ fontSize: 35 }} />
                  </AnimatedAvatar>
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                    User Login
                  </Typography>
                  <Typography variant="body1" color="text.secondary" textAlign="center">
                    Enter your credentials to access your account
                  </Typography>
                </Box>

                <Box component="form" onSubmit={handleSubmit}>
                  <StyledTextField
                    fullWidth
                    margin="normal"
                    label="Account Number"
                    type="text"
                    value={credentials.accountNumber}
                    onChange={(e) =>
                      setCredentials({ ...credentials, accountNumber: e.target.value })
                    }
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountCircleIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                  />
                  
                  <StyledTextField
                    fullWidth
                    margin="normal"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={credentials.password}
                    onChange={(e) =>
                      setCredentials({ ...credentials, password: e.target.value })
                    }
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlinedIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={togglePasswordVisibility}
                            edge="end"
                            sx={{ color: 'action.active' }}
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 3 }}
                  />

                  <StyledButton
                    fullWidth
                    type="submit"
                    variant="contained"
                    startIcon={<LoginIcon />}
                    sx={{ mb: 2 }}
                  >
                    Sign In to Account
                  </StyledButton>
                </Box>
              </StyledPaper>
            </Fade>
          </Box>
        </Slide>
      </Container>
    </Box>
  );
}