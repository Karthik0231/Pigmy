import React, { useContext, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Container,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Tooltip,
  IconButton,
  Badge,
  LinearProgress,
  useTheme,
  alpha,
  Fade,
  Zoom,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  Assessment as ReportIcon,
  People as CustomersIcon,
  TrendingUp as DepositsIcon,
  TrendingDown as WithdrawalsIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon,
  FileDownload as DownloadIcon,
  Timeline as TimelineIcon,
  AccountBalance as BankIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckIcon,
  Pending as PendingIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { CollectorContext } from '../Context/Context';
import moment from 'moment';

// Keyframe animations
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Enhanced Styled Components
const HeaderContainer = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, 
    ${theme.palette.primary.main}15 0%, 
    ${theme.palette.secondary.main}15 50%, 
    ${theme.palette.primary.main}10 100%)`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  padding: theme.spacing(5),
  marginBottom: theme.spacing(4),
  borderRadius: '24px',
  boxShadow: `0 20px 60px ${alpha(theme.palette.primary.main, 0.1)}`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `radial-gradient(circle at 20% 50%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 50%),
                 radial-gradient(circle at 80% 20%, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 50%)`,
    zIndex: 0,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23000000" fill-opacity="0.02"%3E%3Ccircle cx="2" cy="2" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    zIndex: 0,
  }
}));

const MetricCard = styled(Card)(({ theme, color = 'primary' }) => ({
  borderRadius: '20px',
  background: `linear-gradient(135deg, 
    ${theme.palette.background.paper} 0%, 
    ${alpha(theme.palette[color].main, 0.02)} 100%)`,
  border: `1px solid ${alpha(theme.palette[color].main, 0.1)}`,
  boxShadow: `0 8px 32px ${alpha(theme.palette[color].main, 0.08)}`,
  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: `0 20px 60px ${alpha(theme.palette[color].main, 0.15)}`,
    '& .metric-icon': {
      animation: `${pulse} 1s ease-in-out infinite`,
    },
    '& .metric-value': {
      color: theme.palette[color].main,
    }
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, ${alpha(theme.palette[color].main, 0.1)}, transparent)`,
    transition: 'left 0.5s',
  },
  '&:hover::before': {
    left: '100%',
  }
}));

const SectionCard = styled(Card)(({ theme }) => ({
  borderRadius: '20px',
  marginBottom: theme.spacing(4),
  background: `linear-gradient(135deg, 
    ${theme.palette.background.paper} 0%, 
    ${alpha(theme.palette.background.default, 0.3)} 100%)`,
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.04)}`,
  backdropFilter: 'blur(10px)',
  overflow: 'hidden',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, 
      ${theme.palette.primary.main}, 
      ${theme.palette.secondary.main}, 
      ${theme.palette.primary.main})`,
    backgroundSize: '200% 100%',
    animation: `${shimmer} 3s ease-in-out infinite`,
  }
}));

const StatusChip = styled(Chip)(({ status, theme }) => {
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'approved':
      case 'completed':
        return { 
          bg: alpha(theme.palette.success.main, 0.1), 
          color: theme.palette.success.main,
          icon: <CheckIcon sx={{ fontSize: 16 }} />
        };
      case 'inactive':
      case 'rejected':
      case 'cancelled':
        return { 
          bg: alpha(theme.palette.error.main, 0.1), 
          color: theme.palette.error.main,
          icon: <ErrorIcon sx={{ fontSize: 16 }} />
        };
      case 'pending':
      case 'processing':
        return { 
          bg: alpha(theme.palette.warning.main, 0.1), 
          color: theme.palette.warning.main,
          icon: <PendingIcon sx={{ fontSize: 16 }} />
        };
      default:
        return { 
          bg: alpha(theme.palette.grey[500], 0.1), 
          color: theme.palette.grey[600],
          icon: <TimeIcon sx={{ fontSize: 16 }} />
        };
    }
  };

  const config = getStatusConfig(status);
  return {
    backgroundColor: config.bg,
    color: config.color,
    fontWeight: 600,
    borderRadius: '12px',
    border: `1px solid ${alpha(config.color, 0.2)}`,
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: alpha(config.color, 0.15),
      transform: 'scale(1.05)',
    },
    '& .MuiChip-icon': {
      color: 'inherit',
    }
  };
});

const EnhancedTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: '16px',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  '& .MuiTableHead-root': {
    background: `linear-gradient(135deg, 
      ${alpha(theme.palette.primary.main, 0.05)} 0%, 
      ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
  },
  '& .MuiTableRow-root:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.02),
    transform: 'scale(1.001)',
    transition: 'all 0.2s ease',
  },
  '& .MuiTableCell-root': {
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
  }
}));

const FloatingActionButton = styled(IconButton)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(3),
  right: theme.spacing(3),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  width: 64,
  height: 64,
  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    transform: 'scale(1.1)',
    animation: `${float} 2s ease-in-out infinite`,
  },
  zIndex: 1000,
}));

const LoadingOverlay = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '60vh',
  gap: theme.spacing(3),
  '& .loading-spinner': {
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      top: -10,
      left: -10,
      right: -10,
      bottom: -10,
      border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
      borderRadius: '50%',
      animation: `${pulse} 2s ease-in-out infinite`,
    }
  }
}));

const AllReportsPage = () => {
  const theme = useTheme();
  const {
    assignedCustomers,
    deposits,
    withdrawalRequests,
    loading,
    error,
    fetchAssignedCustomers,
    fetchAssignedCustomerDeposits,
    fetchAssignedCustomerWithdrawalRequests,
  } = useContext(CollectorContext);

  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [filteredDeposits, setFilteredDeposits] = useState([]);
  const [filteredWithdrawals, setFilteredWithdrawals] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAssignedCustomers();
    fetchAssignedCustomerDeposits();
    fetchAssignedCustomerWithdrawalRequests();
  }, []);

  useEffect(() => {
    setFilteredCustomers(assignedCustomers || []);
    setFilteredDeposits(deposits || []);
    setFilteredWithdrawals(withdrawalRequests || []);
  }, [assignedCustomers, deposits, withdrawalRequests]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchAssignedCustomers(),
      fetchAssignedCustomerDeposits(),
      fetchAssignedCustomerWithdrawalRequests(),
    ]);
    setRefreshing(false);
  };

  const calculateCollectorMetrics = () => {
    const totalDepositsCollected = (deposits || []).reduce((sum, deposit) => sum + (deposit.amount || 0), 0);
    const totalWithdrawalsProcessed = (withdrawalRequests || []).filter(req => req.status === 'approved').reduce((sum, req) => sum + (req.amount || 0), 0);
    const pendingWithdrawals = (withdrawalRequests || []).filter(req => req.status === 'pending').length;
    const activeCustomers = (assignedCustomers || []).filter(customer => customer.status === 'active').length;

    return {
      assignedCustomersCount: (assignedCustomers || []).length,
      activeCustomers,
      totalDepositsCollected,
      totalWithdrawalsProcessed,
      pendingWithdrawals,
      recentDeposits: (deposits || []).filter(d => moment(d.createdAt).isAfter(moment().subtract(7, 'days'))).length,
    };
  };

  const metrics = calculateCollectorMetrics();

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <LoadingOverlay>
          <Box className="loading-spinner">
            <CircularProgress size={80} thickness={4} />
          </Box>
          <Typography variant="h5" color="text.secondary" fontWeight={500}>
            Loading collector reports...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Fetching your latest data
          </Typography>
        </LoadingOverlay>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Fade in>
          <Alert 
            severity="error" 
            sx={{ 
              borderRadius: '16px', 
              fontSize: '16px',
              boxShadow: `0 8px 32px ${alpha(theme.palette.error.main, 0.1)}`,
            }}
            action={
              <IconButton color="inherit" onClick={handleRefresh}>
                <RefreshIcon />
              </IconButton>
            }
          >
            <Typography variant="h6" gutterBottom>Error Loading Reports</Typography>
            {error}
          </Alert>
        </Fade>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Enhanced Header */}
      <Fade in timeout={800}>
        <HeaderContainer>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Avatar 
                sx={{ 
                  width: 80, 
                  height: 80, 
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                }}
              >
                <ReportIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Box>
                <Typography variant="h3" fontWeight="800" gutterBottom sx={{ 
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  Collector Dashboard
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 500 }}>
                  Comprehensive overview of your assigned customers and activities
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                  <Chip 
                    icon={<TimelineIcon />} 
                    label={`Last Updated: ${moment().format('MMM DD, YYYY HH:mm')}`}
                    size="small"
                    sx={{ 
                      backgroundColor: alpha(theme.palette.background.paper, 0.8),
                      backdropFilter: 'blur(10px)',
                    }}
                  />
                </Box>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Tooltip title="Refresh Data">
                <IconButton 
                  onClick={handleRefresh}
                  disabled={refreshing}
                  sx={{ 
                    backgroundColor: alpha(theme.palette.background.paper, 0.8),
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.background.paper, 0.9),
                    }
                  }}
                >
                  <RefreshIcon sx={{ 
                    animation: refreshing ? `${pulse} 1s ease-in-out infinite` : 'none' 
                  }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </HeaderContainer>
      </Fade>

      {/* Enhanced Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <Zoom in timeout={600}>
            <MetricCard color="primary">
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Avatar 
                    className="metric-icon"
                    sx={{ 
                      bgcolor: alpha(theme.palette.primary.main, 0.1), 
                      color: theme.palette.primary.main, 
                      width: 64, 
                      height: 64,
                      boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.2)}`,
                    }}
                  >
                    <CustomersIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h3" fontWeight="bold" color="primary" className="metric-value">
                      {metrics.assignedCustomersCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Total Customers
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="success.main" fontWeight={600}>
                    {metrics.activeCustomers} Active
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={(metrics.activeCustomers / metrics.assignedCustomersCount) * 100 || 0}
                    sx={{ 
                      width: '60%', 
                      height: 6, 
                      borderRadius: 3,
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                      }
                    }}
                  />
                </Box>
              </CardContent>
            </MetricCard>
          </Zoom>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Zoom in timeout={800}>
            <MetricCard color="success">
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Avatar 
                    className="metric-icon"
                    sx={{ 
                      bgcolor: alpha(theme.palette.success.main, 0.1), 
                      color: theme.palette.success.main, 
                      width: 64, 
                      height: 64,
                      boxShadow: `0 8px 32px ${alpha(theme.palette.success.main, 0.2)}`,
                    }}
                  >
                    <MoneyIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h3" fontWeight="bold" color="success.main" className="metric-value">
                      ₹{(metrics.totalDepositsCollected / 1000).toFixed(0)}K
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Deposits Collected
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="success.main" fontWeight={600}>
                    +{metrics.recentDeposits} This Week
                  </Typography>
                  <Chip 
                    label="₹" 
                    size="small" 
                    sx={{ 
                      backgroundColor: alpha(theme.palette.success.main, 0.1),
                      color: theme.palette.success.main,
                      fontWeight: 'bold',
                    }}
                  />
                </Box>
              </CardContent>
            </MetricCard>
          </Zoom>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Zoom in timeout={1000}>
            <MetricCard color="info">
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Avatar 
                    className="metric-icon"
                    sx={{ 
                      bgcolor: alpha(theme.palette.info.main, 0.1), 
                      color: theme.palette.info.main, 
                      width: 64, 
                      height: 64,
                      boxShadow: `0 8px 32px ${alpha(theme.palette.info.main, 0.2)}`,
                    }}
                  >
                    <BankIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h3" fontWeight="bold" color="info.main" className="metric-value">
                      ₹{(metrics.totalWithdrawalsProcessed / 1000).toFixed(0)}K
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Withdrawals Processed
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="info.main" fontWeight={600}>
                    Approved
                  </Typography>
                  <CheckIcon color="success" sx={{ fontSize: 20 }} />
                </Box>
              </CardContent>
            </MetricCard>
          </Zoom>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Zoom in timeout={1200}>
            <MetricCard color="warning">
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Badge badgeContent={metrics.pendingWithdrawals} color="error">
                    <Avatar 
                      className="metric-icon"
                      sx={{ 
                        bgcolor: alpha(theme.palette.warning.main, 0.1), 
                        color: theme.palette.warning.main, 
                        width: 64, 
                        height: 64,
                        boxShadow: `0 8px 32px ${alpha(theme.palette.warning.main, 0.2)}`,
                      }}
                    >
                      <HistoryIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                  </Badge>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h3" fontWeight="bold" color="warning.main" className="metric-value">
                      {metrics.pendingWithdrawals}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Pending Requests
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="warning.main" fontWeight={600}>
                    Requires Action
                  </Typography>
                  <PendingIcon color="warning" sx={{ fontSize: 20 }} />
                </Box>
              </CardContent>
            </MetricCard>
          </Zoom>
        </Grid>
      </Grid>

      {/* Enhanced Assigned Customers Section */}
      <Fade in timeout={1000}>
        <SectionCard>
          <Box sx={{ p: 4, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
            <Typography variant="h4" fontWeight="700" sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              <CustomersIcon sx={{ color: theme.palette.primary.main, fontSize: 32 }} />
              Assigned Customers
              <Chip 
                label={filteredCustomers.length}
                size="small"
                sx={{ 
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  fontWeight: 'bold',
                }}
              />
            </Typography>
          </Box>
          {filteredCustomers.length === 0 && !loading && !error ? (
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <CustomersIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No assigned customers found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Customer assignments will appear here once available
              </Typography>
            </CardContent>
          ) : (
            <EnhancedTableContainer sx={{ maxHeight: 500 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Contact</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Account</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCustomers.map((customer, index) => (
                    <Fade in timeout={300 + index * 100} key={customer._id}>
                      <TableRow hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar 
                              sx={{ 
                                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                fontWeight: 'bold',
                                boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.2)}`,
                              }}
                            >
                              {customer.name?.charAt(0)?.toUpperCase()}
                            </Avatar>
                            <Typography fontWeight={600} variant="body1">
                              {customer.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {customer.email}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {customer.phone}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={customer.accountNumber} 
                            variant="outlined" 
                            size="small"
                            sx={{ 
                              fontFamily: 'monospace',
                              fontWeight: 'bold',
                              borderRadius: '8px',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <StatusChip
                            label={customer.status}
                            status={customer.status}
                            size="small"
                            icon={customer.status === 'active' ? <CheckIcon /> : undefined}
                          />
                        </TableCell>
                      </TableRow>
                    </Fade>
                  ))}
                </TableBody>
              </Table>
            </EnhancedTableContainer>
          )}
        </SectionCard>
      </Fade>

      {/* Enhanced Recent Deposits Section */}
      <Fade in timeout={1200}>
        <SectionCard>
          <Box sx={{ p: 4, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
            <Typography variant="h4" fontWeight="700" sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.light})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              <DepositsIcon sx={{ color: theme.palette.success.main, fontSize: 32 }} />
              Recent Deposits Collected
              <Chip 
                label={filteredDeposits.length}
                size="small"
                sx={{ 
                  backgroundColor: alpha(theme.palette.success.main, 0.1),
                  color: theme.palette.success.main,
                  fontWeight: 'bold',
                }}
              />
            </Typography>
          </Box>
          {filteredDeposits.length === 0 && !loading && !error ? (
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <DepositsIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No deposit records found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Deposit transactions will appear here once available
              </Typography>
            </CardContent>
          ) : (
            <EnhancedTableContainer sx={{ maxHeight: 500 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDeposits
                    .sort((a, b) => moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf())
                    .map((deposit, index) => (
                    <Fade in timeout={300 + index * 100} key={deposit._id}>
                      <TableRow hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar 
                              sx={{ 
                                background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.light})`,
                                width: 32,
                                height: 32,
                                fontSize: '0.875rem',
                                fontWeight: 'bold',
                              }}
                            >
                              {deposit.customerId?.name?.charAt(0)?.toUpperCase() || 'N'}
                            </Avatar>
                            <Box>
                              <Typography fontWeight={600} variant="body2">
                                {deposit.customerId?.name || 'N/A'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {deposit.customerId?.accountNumber || 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MoneyIcon sx={{ fontSize: 16, color: 'success.main' }} />
                            <Typography variant="body1" fontWeight={700} color="success.main">
                              ₹{deposit.amount?.toLocaleString()}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {moment(deposit.createdAt).format('MMM DD, YYYY')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {moment(deposit.createdAt).fromNow()}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <StatusChip
                            label={deposit.status}
                            status={deposit.status}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    </Fade>
                  ))}
                </TableBody>
              </Table>
            </EnhancedTableContainer>
          )}
        </SectionCard>
      </Fade>

      {/* Enhanced Recent Withdrawal Requests Section */}
      <Fade in timeout={1400}>
        <SectionCard>
          <Box sx={{ p: 4, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
            <Typography variant="h4" fontWeight="700" sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              background: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.light})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              <WithdrawalsIcon sx={{ color: theme.palette.error.main, fontSize: 32 }} />
              Recent Withdrawal Requests
              <Chip 
                label={filteredWithdrawals.length}
                size="small"
                sx={{ 
                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                  color: theme.palette.error.main,
                  fontWeight: 'bold',
                }}
              />
              {metrics.pendingWithdrawals > 0 && (
                <Badge badgeContent={metrics.pendingWithdrawals} color="warning">
                  <Chip 
                    label="Pending"
                    size="small"
                    icon={<PendingIcon />}
                    sx={{ 
                      backgroundColor: alpha(theme.palette.warning.main, 0.1),
                      color: theme.palette.warning.main,
                      fontWeight: 'bold',
                      animation: `${pulse} 2s ease-in-out infinite`,
                    }}
                  />
                </Badge>
              )}
            </Typography>
          </Box>
          {filteredWithdrawals.length === 0 && !loading && !error ? (
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <WithdrawalsIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No withdrawal requests found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Withdrawal requests will appear here once submitted
              </Typography>
            </CardContent>
          ) : (
            <EnhancedTableContainer sx={{ maxHeight: 500 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Request Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredWithdrawals
                    .sort((a, b) => moment(b.requestDate).valueOf() - moment(a.requestDate).valueOf())
                    .map((request, index) => (
                    <Fade in timeout={300 + index * 100} key={request._id}>
                      <TableRow hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar 
                              sx={{ 
                                background: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.light})`,
                                width: 32,
                                height: 32,
                                fontSize: '0.875rem',
                                fontWeight: 'bold',
                              }}
                            >
                              {request.customerId?.name?.charAt(0)?.toUpperCase() || 'N'}
                            </Avatar>
                            <Box>
                              <Typography fontWeight={600} variant="body2">
                                {request.customerId?.name || 'N/A'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {request.customerId?.accountNumber || 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <WithdrawalsIcon sx={{ fontSize: 16, color: 'error.main' }} />
                            <Typography variant="body1" fontWeight={700} color="error.main">
                              ₹{request.amount?.toLocaleString()}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {moment(request.date).format('MMM DD, YYYY')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {moment(request.date).fromNow()}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <StatusChip
                            label={request.status}
                            status={request.status}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    </Fade>
                  ))}
                </TableBody>
              </Table>
            </EnhancedTableContainer>
          )}
        </SectionCard>
      </Fade>

      {/* Floating Action Button */}
      <Tooltip title="Refresh All Data">
        <FloatingActionButton onClick={handleRefresh} disabled={refreshing}>
          <RefreshIcon sx={{ 
            animation: refreshing ? `${pulse} 1s ease-in-out infinite` : 'none' 
          }} />
        </FloatingActionButton>
      </Tooltip>
    </Container>
  );
};

export default AllReportsPage;