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
  Stack,
  Container
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

const StyledContainer = styled(Container)(({ theme }) => ({
  backgroundColor: '#f8f9fa',
  minHeight: '100vh',
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(6),
}));

const PageHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  paddingBottom: theme.spacing(3),
  borderBottom: '1px solid #e9ecef',
}));

const ProfileBanner = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
  color: '#ffffff',
  padding: theme.spacing(4, 4, 5, 4),
  borderRadius: '16px',
  marginBottom: theme.spacing(4),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '200px',
    height: '200px',
    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
    borderRadius: '50%',
    transform: 'translate(50%, -50%)',
  }
}));

const InfoCard = styled(Card)(({ theme }) => ({
  backgroundColor: '#ffffff',
  border: '1px solid #e9ecef',
  borderRadius: '12px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
  transition: 'all 0.3s ease',
  overflow: 'hidden',
  '&:hover': {
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    transform: 'translateY(-2px)',
  }
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(3, 3, 2, 3),
  backgroundColor: '#f8f9fa',
  borderBottom: '1px solid #e9ecef',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.1rem',
  fontWeight: 600,
  color: '#1e293b',
  letterSpacing: '-0.01em',
}));

const DetailRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  padding: theme.spacing(2.5, 3),
  borderBottom: '1px solid #f1f3f4',
  transition: 'background-color 0.2s ease',
  '&:last-child': {
    borderBottom: 'none',
  },
  '&:hover': {
    backgroundColor: '#f8f9fa',
  }
}));

const DetailItem = ({ icon: Icon, label, value, highlight = false }) => (
  <DetailRow>
    <Box sx={{ 
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 40,
      height: 40,
      borderRadius: '10px',
      backgroundColor: '#f1f5f9',
      mr: 3,
      flexShrink: 0
    }}>
      <Icon sx={{ fontSize: '1.25rem', color: '#64748b' }} />
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography 
        variant="body2" 
        sx={{ 
          color: '#64748b', 
          fontSize: '0.8rem',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          mb: 0.5
        }}
      >
        {label}
      </Typography>
      <Typography 
        variant="body1" 
        sx={{ 
          color: highlight ? '#1e293b' : '#334155',
          fontSize: '0.95rem',
          fontWeight: highlight ? 600 : 400,
          wordBreak: 'break-word',
          fontFamily: highlight ? 'monospace' : 'inherit'
        }}
      >
        {value || 'Not specified'}
      </Typography>
    </Box>
  </DetailRow>
);

const StatusChip = styled(Chip)(({ theme, status }) => ({
  borderRadius: '6px',
  fontSize: '0.75rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  height: '28px',
  ...(status === 'active' && {
    backgroundColor: '#dcfce7',
    color: '#166534',
    border: '1px solid #bbf7d0',
  }),
  ...(status === 'inactive' && {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    border: '1px solid #fde68a',
  }),
  ...(status === 'closed' && {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fecaca',
  }),
  ...(!status && {
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    border: '1px solid #e2e8f0',
  }),
}));

const PrimaryButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#1e293b',
  color: '#ffffff',
  borderRadius: '8px',
  padding: theme.spacing(1.5, 4),
  fontSize: '0.875rem',
  fontWeight: 600,
  textTransform: 'none',
  letterSpacing: '0.025em',
  boxShadow: '0 2px 8px rgba(30, 41, 59, 0.15)',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: '#334155',
    boxShadow: '0 4px 16px rgba(30, 41, 59, 0.25)',
    transform: 'translateY(-1px)',
  },
  '&:disabled': {
    backgroundColor: '#e2e8f0',
    color: '#94a3b8',
    boxShadow: 'none',
    transform: 'none',
  },
}));

const FormTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    fontSize: '0.875rem',
    transition: 'all 0.2s ease',
    '& fieldset': {
      borderColor: '#e2e8f0',
      borderWidth: '1px',
    },
    '&:hover fieldset': {
      borderColor: '#cbd5e1',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1e293b',
      borderWidth: '2px',
    },
  },
  '& .MuiInputLabel-root': {
    fontSize: '0.875rem',
    color: '#64748b',
    '&.Mui-focused': {
      color: '#1e293b',
    },
  },
}));

const HighlightCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
  border: '1px solid #cbd5e1',
  borderRadius: '12px',
  marginBottom: theme.spacing(3),
}));

const EmptyState = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(6, 4),
  color: '#64748b',
  backgroundColor: '#f8f9fa',
  borderRadius: '12px',
  border: '2px dashed #e2e8f0',
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
      <StyledContainer maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Stack alignItems="center" spacing={3}>
            <CircularProgress size={40} sx={{ color: '#1e293b' }} />
            <Typography variant="h6" color="#64748b" sx={{ fontWeight: 500 }}>
              Loading your profile...
            </Typography>
          </Stack>
        </Box>
      </StyledContainer>
    );
  }

  if (!user) {
    return (
      <StyledContainer maxWidth="lg">
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: '12px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            fontSize: '0.95rem'
          }}
        >
          Unable to load your profile. Please log in again to continue.
        </Alert>
      </StyledContainer>
    );
  }

  const profileImageUrl = user.profileImage ? `${host}/${user.profileImage.replace(/\\/g, '/')}` : '';

  return (
    <StyledContainer maxWidth="lg">
      {/* Page Header */}
      <PageHeader>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{
            fontWeight: 700,
            color: '#1e293b',
            fontSize: '2.5rem',
            letterSpacing: '-0.025em',
            mb: 1
          }}
        >
          Account Profile
        </Typography>
        <Typography variant="body1" color="#64748b" sx={{ fontSize: '1rem' }}>
          Manage your pigmy bank account information and settings
        </Typography>
      </PageHeader>

      {/* Profile Banner */}
      <ProfileBanner elevation={0}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} sm={4} md={3}>
            <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
              <Avatar
                src={profileImageUrl}
                sx={{ 
                  width: 120, 
                  height: 120,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: '#ffffff',
                  fontSize: '3rem',
                  border: '4px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                }}
              >
                {user.name?.charAt(0).toUpperCase() || <PersonIcon sx={{ fontSize: '3rem' }} />}
              </Avatar>
            </Box>
          </Grid>
          <Grid item xs={12} sm={8} md={9}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700, 
                color: '#ffffff',
                mb: 2,
                fontSize: '2rem',
                letterSpacing: '-0.02em'
              }}
            >
              {user.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <StatusChip 
                label={user.status?.toUpperCase() || 'UNKNOWN'} 
                status={user.status} 
              />
              <StatusChip 
                label={user.isClosed ? 'ACCOUNT CLOSED' : 'ACCOUNT ACTIVE'} 
                status={user.isClosed ? 'closed' : 'active'} 
              />
            </Box>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', mb: 1, fontFamily: 'monospace' }}>
              Account: {user.accountNumber}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Member since {moment(user.createdAt).format('MMMM YYYY')}
            </Typography>
          </Grid>
        </Grid>
      </ProfileBanner>

      {/* Account Summary Card */}
      <HighlightCard>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ 
                  fontWeight: 700, 
                  color: '#1e293b',
                  mb: 1,
                  fontFamily: 'monospace'
                }}>
                  ₹{user.balance?.toLocaleString() || '0'}
                </Typography>
                <Typography variant="body2" color="#64748b" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Current Balance
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ 
                  fontWeight: 600, 
                  color: '#1e293b',
                  mb: 1
                }}>
                  {user.packageId?.duration_months || 'N/A'}
                </Typography>
                <Typography variant="body2" color="#64748b" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Plan Duration (Months)
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ 
                  fontWeight: 600, 
                  color: '#1e293b',
                  mb: 1
                }}>
                  {user.packageId?.interest_rate || 'N/A'}%
                </Typography>
                <Typography variant="body2" color="#64748b" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Interest Rate
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </HighlightCard>

      <Grid container spacing={4}>
        {/* Personal Information */}
        <Grid item xs={12} lg={6}>
          <InfoCard>
            <SectionHeader>
              <AccountCircleIcon sx={{ mr: 2, color: '#64748b', fontSize: '1.5rem' }} />
              <SectionTitle>Personal Information</SectionTitle>
            </SectionHeader>
            <DetailItem icon={EmailIcon} label="Email Address" value={user.email} />
            <DetailItem icon={PhoneIcon} label="Phone Number" value={user.phone} highlight />
            <DetailItem icon={PersonIcon} label="Gender" value={user.gender} />
            <DetailItem 
              icon={CalendarTodayIcon} 
              label="Date of Birth" 
              value={user.dob ? moment(user.dob).format('DD MMMM YYYY') : null} 
            />
            <DetailItem icon={LocationOnIcon} label="Address" value={user.address} />
          </InfoCard>
        </Grid>

        {/* Account Details */}
        <Grid item xs={12} lg={6}>
          <InfoCard>
            <SectionHeader>
              <BusinessIcon sx={{ mr: 2, color: '#64748b', fontSize: '1.5rem' }} />
              <SectionTitle>Account Information</SectionTitle>
            </SectionHeader>
            <DetailItem icon={AccountBalanceIcon} label="Account Number" value={user.accountNumber} highlight />
            <DetailItem icon={CreditCardIcon} label="Account Type" value={user.accountType?.toUpperCase()} />
            <DetailItem 
              icon={SavingsIcon} 
              label="Current Balance" 
              value={`₹${user.balance?.toLocaleString() || '0'}`} 
              highlight
            />
            <DetailRow>
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: '10px',
                backgroundColor: user.isClosed ? '#fee2e2' : '#dcfce7',
                mr: 3,
                flexShrink: 0
              }}>
                {user.isClosed ? 
                  <CancelOutlinedIcon sx={{ fontSize: '1.25rem', color: '#991b1b' }} /> : 
                  <CheckCircleOutlineIcon sx={{ fontSize: '1.25rem', color: '#166534' }} />
                }
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#64748b', 
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    mb: 0.5
                  }}
                >
                  Account Status
                </Typography>
                <StatusChip 
                  label={user.isClosed ? 'CLOSED' : 'ACTIVE'} 
                  status={user.isClosed ? 'closed' : 'active'} 
                />
              </Box>
            </DetailRow>
          </InfoCard>
        </Grid>

        {/* Pigmy Plan Details */}
        <Grid item xs={12}>
          <InfoCard>
            <SectionHeader>
              <SavingsIcon sx={{ mr: 2, color: '#64748b', fontSize: '1.5rem' }} />
              <SectionTitle>Pigmy Savings Plan</SectionTitle>
            </SectionHeader>
            {user.packageId ? (
              <Box sx={{ p: 3 }}>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={4}>
                    <DetailItem icon={SavingsIcon} label="Plan Name" value={user.packageId.plan_name} highlight />
                    <DetailItem 
                      icon={AttachMoneyIcon} 
                      label="Monthly Deposit" 
                      value={`₹${user.packageId.deposit_amount?.toLocaleString() || 'N/A'}`} 
                      highlight
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <DetailItem 
                      icon={CalendarTodayIcon} 
                      label="Plan Duration" 
                      value={`${user.packageId.duration_months} months`} 
                    />
                    <DetailItem 
                      icon={TrendingUpIcon} 
                      label="Interest Rate" 
                      value={`${user.packageId.interest_rate}% per annum`} 
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <DetailItem
                      icon={EventIcon}
                      label="Maturity Date"
                      value={user.maturityDate ? moment(user.maturityDate).format('DD MMMM YYYY') : 'Not set'}
                      highlight
                    />
                    <DetailItem 
                      icon={AttachMoneyIcon} 
                      label="Maturity Amount" 
                      value={`₹${user.packageId.maturity_amount?.toLocaleString() || 'N/A'}`} 
                      highlight
                    />
                  </Grid>
                </Grid>
                <Divider sx={{ my: 3, borderColor: '#e9ecef' }} />
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <StatusChip 
                    label={user.packageId.is_active ? 'PLAN ACTIVE' : 'PLAN INACTIVE'} 
                    status={user.packageId.is_active ? 'active' : 'inactive'} 
                  />
                </Box>
              </Box>
            ) : (
              <EmptyState>
                <SavingsIcon sx={{ fontSize: '4rem', color: '#cbd5e1', mb: 2 }} />
                <Typography variant="h6" color="#64748b" sx={{ fontWeight: 600, mb: 1 }}>
                  No Pigmy Plan Assigned
                </Typography>
                <Typography variant="body2" color="#94a3b8">
                  Contact your bank representative to enroll in a pigmy savings plan
                </Typography>
              </EmptyState>
            )}
          </InfoCard>
        </Grid>

        {/* Change Password */}
        <Grid item xs={12}>
          <InfoCard>
            <SectionHeader>
              <SecurityIcon sx={{ mr: 2, color: '#64748b', fontSize: '1.5rem' }} />
              <SectionTitle>Security Settings</SectionTitle>
            </SectionHeader>
            <Box sx={{ p: 4 }}>
              <Box sx={{ maxWidth: 500, mx: 'auto' }}>
                <Typography variant="body2" color="#64748b" sx={{ mb: 4, textAlign: 'center' }}>
                  Update your account password to keep your pigmy bank account secure
                </Typography>
                <Box component="form" onSubmit={handleSubmitPasswordChange}>
                  {passwordError && (
                    <Alert 
                      severity="error" 
                      sx={{ 
                        mb: 3,
                        borderRadius: '8px',
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        color: '#dc2626'
                      }}
                    >
                      {passwordError}
                    </Alert>
                  )}
                  <FormTextField
                    fullWidth
                    margin="normal"
                    label="Current Password"
                    type="password"
                    name="oldPassword"
                    value={passwordForm.oldPassword}
                    onChange={handlePasswordChange}
                    required
                    sx={{ mb: 3 }}
                  />
                  <FormTextField
                    fullWidth
                    margin="normal"
                    label="New Password"
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    required
                    sx={{ mb: 3 }}
                  />
                  <FormTextField
                    fullWidth
                    margin="normal"
                    label="Confirm New Password"
                    type="password"
                    name="confirmNewPassword"
                    value={passwordForm.confirmNewPassword}
                    onChange={handlePasswordChange}
                    required
                    sx={{ mb: 4 }}
                  />
                  <PrimaryButton
                    type="submit"
                    fullWidth
                    disabled={passwordLoading}
                    startIcon={passwordLoading ? 
                      <CircularProgress size={18} sx={{ color: 'inherit' }} /> : 
                      <LockOutlinedIcon sx={{ fontSize: '1.1rem' }} />
                    }
                  >
                    {passwordLoading ? 'Updating Password...' : 'Update Password'}
                  </PrimaryButton>
                </Box>
              </Box>
            </Box>
          </InfoCard>
        </Grid>
      </Grid>
    </StyledContainer>
  );
}