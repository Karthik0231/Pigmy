import React, { useContext, useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Avatar,
  Divider,
  Card,
  CardContent,
  Chip,
  IconButton,
  Fade,
  Stack
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { UserContext } from '../Context/Context';
import moment from 'moment';
import { config } from '../Config/Config';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SavingsIcon from '@mui/icons-material/Savings';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import EditIcon from '@mui/icons-material/Edit';
import SecurityIcon from '@mui/icons-material/Security';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BusinessIcon from '@mui/icons-material/Business';

const StyledContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#fafafa',
  minHeight: '100vh',
  padding: theme.spacing(4),
}));

const ProfileHeader = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4, 5),
  backgroundColor: '#ffffff',
  border: '1px solid #e0e0e0',
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  borderRadius: '12px',
  marginBottom: theme.spacing(3),
}));

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: '#ffffff',
  border: '1px solid #e5e5e5',
  borderRadius: '8px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  transition: 'box-shadow 0.2s ease',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  }
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.25rem',
  fontWeight: 600,
  color: '#1a1a1a',
  marginBottom: theme.spacing(3),
  letterSpacing: '-0.01em',
}));

const DetailItem = ({ icon: Icon, label, value }) => (
  <Box sx={{ 
    display: 'flex', 
    alignItems: 'flex-start', 
    py: 2,
    borderBottom: '1px solid #f5f5f5',
    '&:last-child': {
      borderBottom: 'none',
    }
  }}>
    <Box sx={{ 
      mt: 0.5,
      mr: 3,
      color: '#666666'
    }}>
      <Icon sx={{ fontSize: '1.1rem' }} />
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography 
        variant="body2" 
        sx={{ 
          color: '#666666', 
          fontSize: '0.875rem',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          mb: 0.5
        }}
      >
        {label}
      </Typography>
      <Typography 
        variant="body1" 
        sx={{ 
          color: '#1a1a1a',
          fontSize: '0.95rem',
          fontWeight: 400,
          wordBreak: 'break-word'
        }}
      >
        {value || 'Not specified'}
      </Typography>
    </Box>
  </Box>
);

const StatusBadge = styled(Box)(({ theme, status }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: theme.spacing(0.5, 1.5),
  borderRadius: '20px',
  fontSize: '0.75rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  ...(status === 'active' && {
    backgroundColor: '#e8f5e8',
    color: '#2e7d32',
    border: '1px solid #c8e6c9',
  }),
  ...(status === 'inactive' && {
    backgroundColor: '#fff3e0',
    color: '#f57c00',
    border: '1px solid #ffcc02',
  }),
  ...(!status && {
    backgroundColor: '#f5f5f5',
    color: '#666666',
    border: '1px solid #e0e0e0',
  }),
}));

const ProfessionalButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#1a1a1a',
  color: '#ffffff',
  borderRadius: '6px',
  padding: theme.spacing(1.25, 3),
  fontSize: '0.875rem',
  fontWeight: 600,
  textTransform: 'none',
  letterSpacing: '0.25px',
  boxShadow: 'none',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: '#333333',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  '&:disabled': {
    backgroundColor: '#e0e0e0',
    color: '#999999',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#ffffff',
    borderRadius: '6px',
    fontSize: '0.875rem',
    '& fieldset': {
      borderColor: '#d0d0d0',
    },
    '&:hover fieldset': {
      borderColor: '#999999',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1a1a1a',
      borderWidth: '1px',
    },
  },
  '& .MuiInputLabel-root': {
    fontSize: '0.875rem',
    color: '#666666',
    '&.Mui-focused': {
      color: '#1a1a1a',
    },
  },
}));

export default function ProfilePage() {
  const { user, loading, fetchUserDetails, changeUserPassword } = useContext(UserContext);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const { host } = config;

  useEffect(() => {
    if (!user && !loading) {
      fetchUserDetails();
    }
  }, [user, loading, fetchUserDetails]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({ ...passwordForm, [name]: value });
  };

  const handleSubmitPasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setPasswordError("New passwords don't match.");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
        setPasswordError("New password must be at least 6 characters long.");
        return;
    }

    setPasswordLoading(true);
    const success = await changeUserPassword(passwordForm.oldPassword, passwordForm.newPassword);
    setPasswordLoading(false);

    if (success) {
      setPasswordForm({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
    }
  };

  if (loading) {
    return (
      <StyledContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Stack alignItems="center" spacing={2}>
            <CircularProgress size={32} sx={{ color: '#666666' }} />
            <Typography variant="body1" color="#666666">Loading profile...</Typography>
          </Stack>
        </Box>
      </StyledContainer>
    );
  }

  if (!user) {
    return (
      <StyledContainer>
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: '8px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626'
          }}
        >
          Could not load user profile. Please log in again.
        </Alert>
      </StyledContainer>
    );
  }

  const profileImageUrl = user.profileImage ? `${host}/${user.profileImage.replace(/\\/g, '/')}` : '';

  return (
    <StyledContainer>
      <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{
            fontWeight: 700,
            color: '#1a1a1a',
            mb: 4,
            fontSize: '2rem',
            letterSpacing: '-0.02em'
          }}
        >
          Profile
        </Typography>

        {/* Profile Header */}
        <ProfileHeader>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} sm={4} md={3}>
              <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Avatar
                    src={profileImageUrl}
                    sx={{ 
                      width: 100, 
                      height: 100,
                      backgroundColor: '#f5f5f5',
                      color: '#666666',
                      fontSize: '2.5rem'
                    }}
                  >
                    {user.name?.charAt(0).toUpperCase() || <PersonIcon sx={{ fontSize: '2.5rem' }} />}
                  </Avatar>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={8} md={9}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 600, 
                  color: '#1a1a1a',
                  mb: 1,
                  fontSize: '1.5rem'
                }}
              >
                {user.name}
              </Typography>
              <StatusBadge status={user.status} sx={{ mb: 2 }}>
                {user.status?.toUpperCase() || 'UNKNOWN'}
              </StatusBadge>
              <Typography variant="body2" color="#666666" sx={{ mb: 0.5 }}>
                Account: {user.accountNumber}
              </Typography>
              <Typography variant="body2" color="#999999">
                Member since {moment(user.createdAt).format('MMMM YYYY')}
              </Typography>
            </Grid>
          </Grid>
        </ProfileHeader>

        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid item xs={12} lg={6}>
            <StyledCard>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <AccountCircleIcon sx={{ mr: 2, color: '#666666', fontSize: '1.5rem' }} />
                  <SectionTitle>Personal Information</SectionTitle>
                </Box>
                <DetailItem icon={EmailIcon} label="Email Address" value={user.email} />
                <DetailItem icon={PhoneIcon} label="Phone Number" value={user.phone} />
                <DetailItem icon={PersonIcon} label="Gender" value={user.gender} />
                <DetailItem 
                  icon={CalendarTodayIcon} 
                  label="Date of Birth" 
                  value={user.dob ? moment(user.dob).format('MMMM DD, YYYY') : null} 
                />
                <DetailItem icon={LocationOnIcon} label="Address" value={user.address} />
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Account Details */}
          <Grid item xs={12} lg={6}>
            <StyledCard>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <BusinessIcon sx={{ mr: 2, color: '#666666', fontSize: '1.5rem' }} />
                  <SectionTitle>Account Details</SectionTitle>
                </Box>
                <DetailItem icon={AccountBalanceIcon} label="Account Number" value={user.accountNumber} />
                <DetailItem icon={CreditCardIcon} label="Account Type" value={user.accountType?.toUpperCase()} />
                <DetailItem 
                  icon={SavingsIcon} 
                  label="Current Balance" 
                  value={`₹${user.balance?.toLocaleString() || '0'}`} 
                />
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  py: 2
                }}>
                  <Box sx={{ 
                    mt: 0.5,
                    mr: 3,
                    color: user.isClosed ? '#dc2626' : '#16a34a'
                  }}>
                    {user.isClosed ? 
                      <CancelOutlinedIcon sx={{ fontSize: '1.1rem' }} /> : 
                      <CheckCircleOutlineIcon sx={{ fontSize: '1.1rem' }} />
                    }
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#666666', 
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        mb: 0.5
                      }}
                    >
                      Account Status
                    </Typography>
                    <StatusBadge status={user.isClosed ? 'inactive' : 'active'}>
                      {user.isClosed ? 'CLOSED' : 'ACTIVE'}
                    </StatusBadge>
                  </Box>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Pigmy Plan Details */}
          <Grid item xs={12}>
            <StyledCard>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <SavingsIcon sx={{ mr: 2, color: '#666666', fontSize: '1.5rem' }} />
                  <SectionTitle>Pigmy Plan Details</SectionTitle>
                </Box>
                {user.packageId ? (
                  <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                      <DetailItem icon={SavingsIcon} label="Plan Name" value={user.packageId.plan_name} />
<DetailItem
  icon={EventIcon}
  label="Maturity Date"
  value={user.maturityDate ? moment(user.maturityDate).format('DD MMMM YYYY') : ''}
/>                      <DetailItem 
                        icon={AttachMoneyIcon} 
                        label="Deposit Amount" 
                        value={`₹${user.packageId.deposit_amount?.toLocaleString() || 'N/A'}`} 
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <DetailItem 
                        icon={CalendarTodayIcon} 
                        label="Duration" 
                        value={`${user.packageId.duration_months} months`} 
                      />
                      <DetailItem 
                        icon={TrendingUpIcon} 
                        label="Interest Rate" 
                        value={`${user.packageId.interest_rate}%`} 
                      />
                      <DetailItem 
                        icon={AttachMoneyIcon} 
                        label="Maturity Amount" 
                        value={`₹${user.packageId.maturity_amount?.toLocaleString() || 'N/A'}`} 
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2, borderColor: '#f0f0f0' }} />
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        py: 1
                      }}>
                        <Box sx={{ 
                          mt: 0.5,
                          mr: 3,
                          color: user.packageId.is_active ? '#16a34a' : '#dc2626'
                        }}>
                          {user.packageId.is_active ? 
                            <CheckCircleOutlineIcon sx={{ fontSize: '1.1rem' }} /> : 
                            <CancelOutlinedIcon sx={{ fontSize: '1.1rem' }} />
                          }
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: '#666666', 
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              mb: 0.5
                            }}
                          >
                            Plan Status
                          </Typography>
                          <StatusBadge status={user.packageId.is_active ? 'active' : 'inactive'}>
                            {user.packageId.is_active ? 'ACTIVE' : 'INACTIVE'}
                          </StatusBadge>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                ) : (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 6,
                    color: '#999999'
                  }}>
                    <SavingsIcon sx={{ fontSize: '3rem', color: '#e0e0e0', mb: 2 }} />
                    <Typography variant="h6" color="#666666" sx={{ fontWeight: 500, mb: 1 }}>
                      No Pigmy Plan Assigned
                    </Typography>
                    <Typography variant="body2" color="#999999">
                      Contact your administrator to assign a plan
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Change Password */}
          <Grid item xs={12}>
            <StyledCard>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                  <SecurityIcon sx={{ mr: 2, color: '#666666', fontSize: '1.5rem' }} />
                  <SectionTitle>Change Password</SectionTitle>
                </Box>
                <Box sx={{ maxWidth: 400, mx: 'auto' }}>
                  <Box component="form" onSubmit={handleSubmitPasswordChange}>
                    {passwordError && (
                      <Alert 
                        severity="error" 
                        sx={{ 
                          mb: 3,
                          borderRadius: '6px',
                          backgroundColor: '#fef2f2',
                          border: '1px solid #fecaca',
                          color: '#dc2626'
                        }}
                      >
                        {passwordError}
                      </Alert>
                    )}
                    <StyledTextField
                      fullWidth
                      margin="normal"
                      label="Current Password"
                      type="password"
                      name="oldPassword"
                      value={passwordForm.oldPassword}
                      onChange={handlePasswordChange}
                      required
                      sx={{ mb: 2 }}
                    />
                    <StyledTextField
                      fullWidth
                      margin="normal"
                      label="New Password"
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      required
                      sx={{ mb: 2 }}
                    />
                    <StyledTextField
                      fullWidth
                      margin="normal"
                      label="Confirm New Password"
                      type="password"
                      name="confirmNewPassword"
                      value={passwordForm.confirmNewPassword}
                      onChange={handlePasswordChange}
                      required
                      sx={{ mb: 3 }}
                    />
                    <ProfessionalButton
                      type="submit"
                      fullWidth
                      disabled={passwordLoading}
                      startIcon={passwordLoading ? 
                        <CircularProgress size={16} sx={{ color: 'inherit' }} /> : 
                        <LockOutlinedIcon sx={{ fontSize: '1rem' }} />
                      }
                    >
                      {passwordLoading ? 'Updating...' : 'Update Password'}
                    </ProfessionalButton>
                  </Box>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>
      </Box>
    </StyledContainer>
  );
}