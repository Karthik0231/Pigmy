import React, { useContext, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Collapse,
  Card,
  CardContent,
  Grid,
  Stack,
  Chip,
  Badge,
  Divider,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  LinearProgress,
  Container,
  Tabs,
  Tab,
  TablePagination
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { tableCellClasses } from '@mui/material/TableCell';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Block as RejectIcon,
  CheckCircle as ApproveIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  AccountBalance as BankIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Person as PersonIcon,
  CreditCard as CreditCardIcon,
  AccountBalanceWallet as WalletIcon,
  History as HistoryIcon,
  CloudDownload as OnlineIcon,
  TouchApp as HandIcon,
  Warning as PendingIcon,
  CheckCircleOutline as ApprovedIcon,
  Cancel as RejectedIcon,
  MonetizationOn as MoneyIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { AdminContext } from '../Context/Context';
import moment from 'moment';
import Swal from 'sweetalert2';
import {config} from '../Config/Config';

// Enhanced Styled Components
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
    color: theme.palette.common.white,
    fontWeight: 600,
    fontSize: '0.95rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '16px 12px',
    borderBottom: 'none',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: '0.875rem',
    padding: '14px 12px',
    borderBottom: '1px solid rgba(224, 224, 224, 0.5)',
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(even)': {
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
  },
  '&:hover': {
    backgroundColor: 'rgba(25, 118, 210, 0.08)',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    transition: 'all 0.2s ease-in-out',
  },
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
}));

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  height: '100%',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
  },
}));

const HeaderContainer = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
}));

const FilterContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  borderRadius: '12px',
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
}));

const StatusChip = styled(Chip)(({ status, theme }) => {
  let backgroundColor, color;
  
  switch (status) {
    case 'approved':
      backgroundColor = theme.palette.success.light;
      color = theme.palette.success.dark;
      break;
    case 'rejected':
      backgroundColor = theme.palette.error.light;
      color = theme.palette.error.dark;
      break;
    case 'pending':
      backgroundColor = theme.palette.warning.light;
      color = theme.palette.warning.dark;
      break;
    default:
      backgroundColor = theme.palette.grey[200];
      color = theme.palette.grey[800];
  }
  
  return {
    backgroundColor,
    color,
    fontWeight: 600,
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };
});

const PaymentManagement = () => {
  const {
    customerPaymentSummary,
    selectedCustomerDetails,
    paymentLoading,
    paymentError,
    fetchCustomerPaymentSummary,
    fetchCustomerPaymentDetails,
    rejectDepositAdmin,
    rejectWithdrawalRequestAdmin,
  } = useContext(AdminContext);

  // State Management
  const [expandedCustomerId, setExpandedCustomerId] = useState(null);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [transactionType, setTransactionType] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [accountTypeFilter, setAccountTypeFilter] = useState('all');
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const {host} = config;

  // Statistics calculation
  const statistics = React.useMemo(() => {
    if (!customerPaymentSummary.length) return { totalCustomers: 0, totalBalance: 0, totalDeposits: 0, totalWithdrawals: 0 };

    return {
      totalCustomers: customerPaymentSummary.length,
      totalBalance: customerPaymentSummary
      .reduce((sum, customer) => sum + customer.balance, 0),
      totalDeposits: customerPaymentSummary.reduce((sum, customer) => sum + customer.totalDeposits, 0),
      totalWithdrawals: customerPaymentSummary.reduce((sum, customer) => sum + customer.totalWithdrawals, 0),
    };
  }, [customerPaymentSummary]);

  // Filtered data
  const filteredCustomers = React.useMemo(() => {
    return customerPaymentSummary.filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.accountNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAccountType = accountTypeFilter === 'all' || customer.accountType === accountTypeFilter;

      return matchesSearch && matchesAccountType;
    });
  }, [customerPaymentSummary, searchTerm, accountTypeFilter]);

  // Paginated data
  const paginatedCustomers = filteredCustomers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  useEffect(() => {
    fetchCustomerPaymentSummary();
  }, []);

  const handleRowClick = (customerId) => {
    if (expandedCustomerId === customerId) {
      setExpandedCustomerId(null);
    } else {
      setExpandedCustomerId(customerId);
      fetchCustomerPaymentDetails(customerId);
    }
  };

  // {{ edit_1 }}
  const handleRejectClick = (transaction, type) => {
    setCurrentTransaction(transaction);
    setTransactionType(type);
    setRejectionReason('');
    setRejectionDialogOpen(true);
  };

  const handleRejectionDialogClose = () => {
    setRejectionDialogOpen(false);
    setCurrentTransaction(null);
    setTransactionType(null);
    setRejectionReason('');
  };

  const handleRejectConfirm = () => {
    if (!rejectionReason.trim()) {
      Swal.fire({
        title: "Warning",
        text: "Please provide a rejection reason.",
        icon: "warning",
        confirmButtonColor: "#d32f2f"
      });
      return;
    }

    const confirmReject = () => {
      if (transactionType === 'deposit') {
        rejectDepositAdmin(currentTransaction._id, rejectionReason);
      } else if (transactionType === 'withdrawal') {
        rejectWithdrawalRequestAdmin(currentTransaction._id, rejectionReason);
      }

      setRejectionDialogOpen(false);
      setCurrentTransaction(null);
      setTransactionType(null);
      setRejectionReason('');

      // Refresh data after rejection
      // Adding a small delay to allow backend update before refetching
      setTimeout(() => {
        fetchCustomerPaymentSummary();
        if (expandedCustomerId) {
          fetchCustomerPaymentDetails(expandedCustomerId);
        }
      }, 500); // Reduced delay slightly
    };
        confirmReject();
  };

  const canRejectTransaction = (transaction, type) => {

    if (type === 'deposit') {
      // This condition seems unusual (rejecting *approved* online deposits)
      // but keeping it as per the code provided in the previous turn.
      return transaction.paymentMethod === 'online' && transaction.status === 'approved';
    } else if (type === 'withdrawal') {
      return transaction.status === 'pending';
    }
    return false;
  };
  // {{ edit_1 ends }}

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <ApprovedIcon sx={{ fontSize: 16 }} />;
      case 'rejected':
        return <RejectedIcon sx={{ fontSize: 16 }} />;
      case 'pending':
        return <PendingIcon sx={{ fontSize: 16 }} />;
      default:
        return <InfoIcon sx={{ fontSize: 16 }} />;
    }
  };

  const getPaymentMethodIcon = (method) => {
    return method === 'online' ? <OnlineIcon sx={{ fontSize: 16 }} /> : <HandIcon sx={{ fontSize: 16 }} />;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header Section */}
      <HeaderContainer>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
              <BankIcon sx={{ fontSize: 28 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="700" color="primary.main">
                Payment Management System
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Manage Pigmy Account Transactions & Payments
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={() => fetchCustomerPaymentSummary()}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3
            }}
          >
            Refresh Data
          </Button>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StyledCard>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" fontWeight="700">
                      {statistics.totalCustomers}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Customers
                    </Typography>
                  </Box>
                  <PersonIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StyledCard sx={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h5" fontWeight="700">
                      {formatCurrency(statistics.totalBalance)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Balance
                    </Typography>
                  </Box>
                  <WalletIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StyledCard sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h5" fontWeight="700">
                      {formatCurrency(statistics.totalDeposits)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Deposits
                    </Typography>
                  </Box>
                  <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StyledCard sx={{ background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h5" fontWeight="700">
                      {formatCurrency(statistics.totalWithdrawals)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Withdrawals
                    </Typography>
                  </Box>
                  <TrendingDownIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>
      </HeaderContainer>

      {/* Filters Section */}
      <FilterContainer elevation={0}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by name or account number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: 'white',
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            {/* <FormControl fullWidth>
              <InputLabel>Account Type</InputLabel>
              <Select
                value={accountTypeFilter}
                label="Account Type"
                onChange={(e) => setAccountTypeFilter(e.target.value)}
                sx={{
                  borderRadius: '12px',
                  backgroundColor: 'white',
                }}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="pigmy">Pigmy</MenuItem>
                <MenuItem value="savings">Savings</MenuItem>
                <MenuItem value="current">Current</MenuItem>
              </Select>
            </FormControl> */}
          </Grid>
          <Grid item xs={12} md={5}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Showing {filteredCustomers.length} of {statistics.totalCustomers} customers
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </FilterContainer>

      {/* Loading State */}
      {paymentLoading && !selectedCustomerDetails && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6 }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
            Loading payment data...
          </Typography>
        </Box>
      )}

      {/* Error State */}
      {paymentError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
          <Typography variant="h6">Error Loading Data</Typography>
          {paymentError}
        </Alert>
      )}

      {/* No Data State */}
      {!paymentLoading && !paymentError && customerPaymentSummary.length === 0 && (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: '12px' }}>
          <BankIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No Payment Data Available
          </Typography>
          <Typography variant="body1" color="text.disabled">
            There are no customer payment records to display at the moment.
          </Typography>
        </Paper>
      )}

      {/* Main Table */}
{!paymentLoading && filteredCustomers.length > 0 && (
  <Paper 
    elevation={4} 
    sx={{ 
      borderRadius: '16px', 
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
      border: '1px solid rgba(0,0,0,0.05)'
    }}
  >
    <TableContainer sx={{ maxHeight: '70vh' }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <StyledTableCell sx={{ minWidth: 200 }}>Customer Details</StyledTableCell>
            <StyledTableCell sx={{ minWidth: 160 }}>Account Info</StyledTableCell>
            <StyledTableCell align="right" sx={{ minWidth: 140 }}>Current Balance</StyledTableCell>
            <StyledTableCell align="right" sx={{ minWidth: 140 }}>Total Deposits</StyledTableCell>
            <StyledTableCell align="right" sx={{ minWidth: 160 }}>Total Withdrawals</StyledTableCell>
            <StyledTableCell sx={{ minWidth: 160 }}>Data Collector</StyledTableCell>
            <StyledTableCell align="center" sx={{ minWidth: 100 }}>Actions</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedCustomers.map((summary, index) => (
            <React.Fragment key={`${summary._id}-${index}`}>
              <StyledTableRow 
                onClick={() => handleRowClick(summary._id)}
                sx={{
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  },
                  transition: 'all 0.2s ease-in-out',
                  cursor: 'pointer'
                }}
              >
                <TableCell sx={{ padding: '16px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      src={summary.profileImage ? `${host}/${summary.profileImage.replace(/\\/g, '/')}` : ''}
                      alt={summary.name}
                      sx={{ 
                        width: 48, 
                        height: 48,
                        border: '3px solid',
                        borderColor: 'primary.light',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        fontSize: '1.2rem',
                        fontWeight: 600
                      }}
                    >
                      {!summary.profileImage && summary.name?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography 
                        variant="subtitle1" 
                        fontWeight="600"
                        sx={{ 
                          color: 'text.primary',
                          lineHeight: 1.2,
                          mb: 0.5
                        }}
                      >
                        {summary.name}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'text.secondary',
                          fontSize: '0.75rem'
                        }}
                      >
                        ID: {summary._id.slice(-6).toUpperCase()}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>

                <TableCell sx={{ padding: '16px' }}>
                  <Box>
                    <Typography 
                      variant="body2" 
                      fontWeight="600"
                      sx={{ 
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                        mb: 1
                      }}
                    >
                      {summary.accountNumber}
                    </Typography>
                    <Chip
                      label={summary.accountType}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ 
                        textTransform: 'capitalize',
                        fontWeight: 500,
                        fontSize: '0.75rem',
                        borderRadius: '6px'
                      }}
                    />
                  </Box>
                </TableCell>

                <TableCell align="right" sx={{ padding: '16px' }}>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography 
                      variant="h6" 
                      fontWeight="700" 
                      sx={{
                        color: summary.balance >= 0 ? 'success.main' : 'error.main',
                        fontFamily: 'monospace',
                        fontSize: '1.1rem'
                      }}
                    >
                      {formatCurrency(summary.balance)}
                    </Typography>
                    {summary.balance < 0 && (
                      <Typography variant="caption" color="error.main">
                        Overdrawn
                      </Typography>
                    )}
                  </Box>
                </TableCell>

                <TableCell align="right" sx={{ padding: '16px' }}>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography 
                      variant="body2" 
                      color="info.main" 
                      fontWeight="600"
                      sx={{ fontFamily: 'monospace' }}
                    >
                      {formatCurrency(summary.totalDeposits)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total In
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell align="right" sx={{ padding: '16px' }}>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography 
                      variant="body2" 
                      color="error.main" 
                      fontWeight="600"
                      sx={{ fontFamily: 'monospace' }}
                    >
                      {formatCurrency(summary.totalWithdrawals)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Out
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell sx={{ padding: '16px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      src={summary.collectorId?.image ? `${host}/uploads/admin/${summary.collectorId?.image.replace(/\\/g, '/')}` : ''}
                      alt={summary.collectorId?.name}
                      sx={{ 
                        width: 32, 
                        height: 32,
                        border: '2px solid',
                        borderColor: 'primary.light',
                        fontSize: '0.75rem'
                      }}
                    >
                      {!summary.collectorId?.image && summary.collectorId?.name?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography 
                        variant="body2" 
                        fontWeight="500"
                        sx={{ lineHeight: 1.2 }}
                      >
                        {summary.collectorId?.name || 'Not Assigned'}
                      </Typography>
                      {!summary.collectorId?.name && (
                        <Typography variant="caption" color="warning.main">
                          Pending Assignment
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>

                <TableCell align="center" sx={{ padding: '16px' }}>
                  <Tooltip title={expandedCustomerId === summary._id ? "Collapse Details" : "Expand Details"}>
                    <IconButton
                      size="medium"
                      sx={{
                        bgcolor: expandedCustomerId === summary._id ? 'primary.main' : 'grey.100',
                        color: expandedCustomerId === summary._id ? 'white' : 'text.secondary',
                        width: 40,
                        height: 40,
                        boxShadow: expandedCustomerId === summary._id ? '0 4px 12px rgba(25,118,210,0.3)' : 'none',
                        '&:hover': {
                          bgcolor: expandedCustomerId === summary._id ? 'primary.dark' : 'grey.200',
                          transform: 'scale(1.05)',
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      {expandedCustomerId === summary._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </StyledTableRow>

              {/* Enhanced Expanded Details Section */}
              <TableRow>
                <TableCell 
                  style={{ paddingBottom: 0, paddingTop: 0, border: 'none' }} 
                  colSpan={7}
                >
                  <Collapse 
                    in={expandedCustomerId === summary._id} 
                    timeout="auto" 
                    unmountOnExit
                  >
                    <Box sx={{ 
                      m: 2, 
                      p: 4, 
                      bgcolor: 'grey.50', 
                      borderRadius: '16px',
                      border: '1px solid',
                      borderColor: 'divider',
                      position: 'relative'
                    }}>
                      {/* Loading State */}
                      {paymentLoading && expandedCustomerId === summary._id ? (
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'center', 
                          alignItems: 'center',
                          py: 6,
                          flexDirection: 'column',
                          gap: 2
                        }}>
                          <CircularProgress size={40} thickness={4} />
                          <Typography variant="body1" color="text.secondary">
                            Loading transaction details...
                          </Typography>
                        </Box>
                      ) : selectedCustomerDetails && (selectedCustomerDetails.deposits || selectedCustomerDetails.withdrawalRequests) ? (
                        <>
                          {/* Summary Stats Bar */}
                          <Box sx={{ 
                            display: 'flex', 
                            gap: 3, 
                            mb: 4,
                            p: 2,
                            bgcolor: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}>
                            <Box sx={{ textAlign: 'center', flex: 1 }}>
                              <Typography variant="h4" fontWeight="700" color="success.main">
                                {selectedCustomerDetails.deposits?.length || 0}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Total Deposits
                              </Typography>
                            </Box>
                            <Divider orientation="vertical" flexItem />
                            <Box sx={{ textAlign: 'center', flex: 1 }}>
                              <Typography variant="h4" fontWeight="700" color="error.main">
                                {selectedCustomerDetails.withdrawalRequests?.length || 0}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Withdrawal Requests
                              </Typography>
                            </Box>
                            <Divider orientation="vertical" flexItem />
                            <Box sx={{ textAlign: 'center', flex: 1 }}>
                              <Typography variant="h4" fontWeight="700" color="info.main">
                                {((selectedCustomerDetails.deposits?.length || 0) + 
                                  (selectedCustomerDetails.withdrawalRequests?.length || 0))}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Total Transactions
                              </Typography>
                            </Box>
                          </Box>

                          <Grid container spacing={4}>
                            {/* Enhanced Deposits Section */}
                            <Grid item xs={12} lg={6}>
                              <Paper sx={{ 
                                p: 3, 
                                borderRadius: '16px', 
                                height: '100%',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                border: '1px solid rgba(76, 175, 80, 0.1)'
                              }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                  <Box sx={{
                                    p: 1,
                                    borderRadius: '8px',
                                    bgcolor: 'success.light',
                                    mr: 2
                                  }}>
                                    <TrendingUpIcon sx={{ color: 'success.main', fontSize: '1.5rem' }} />
                                  </Box>
                                  <Typography variant="h6" fontWeight="600" sx={{ flex: 1 }}>
                                    Deposit History
                                  </Typography>
                                  <Chip
                                    label={selectedCustomerDetails.deposits?.length || 0}
                                    size="small"
                                    color="success"
                                    sx={{ 
                                      fontWeight: 600,
                                      minWidth: 40
                                    }}
                                  />
                                </Box>
                                
                                {selectedCustomerDetails.deposits && selectedCustomerDetails.deposits.length > 0 ? (
                                  <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    <Table size="small">
                                      <TableHead>
                                        <TableRow>
                                          <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Date</TableCell>
                                          <TableCell align="right" sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Amount</TableCell>
                                          <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Method</TableCell>
                                          <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Status</TableCell>
                                          <TableCell align="center" sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Actions</TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {selectedCustomerDetails.deposits.map((deposit, idx) => (
                                          <TableRow 
                                            key={`${deposit._id}-${idx}`} 
                                            hover
                                            sx={{
                                              '&:hover': {
                                                bgcolor: 'success.light',
                                                '& .MuiTableCell-root': {
                                                  color: 'success.contrastText'
                                                }
                                              }
                                            }}
                                          >
                                            <TableCell>
                                              <Typography variant="body2" fontWeight="500">
                                                {moment(deposit.date).format('DD MMM YYYY')}
                                              </Typography>
                                              <Typography variant="caption" color="text.secondary">
                                                {moment(deposit.date).format('hh:mm A')}
                                              </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                              <Typography 
                                                variant="body2" 
                                                fontWeight="700" 
                                                color="success.main"
                                                sx={{ fontFamily: 'monospace' }}
                                              >
                                                {formatCurrency(deposit.amount)}
                                              </Typography>
                                            </TableCell>
                                            <TableCell>
<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
  {getPaymentMethodIcon(deposit.paymentMethod)}
  <Typography variant="body2" sx={{ textTransform: 'capitalize', display: 'flex', flexDirection: 'column' }}>
    {deposit.paymentMethod}
    {deposit.paymentMethod === 'online' && deposit.referenceId && (
      <span style={{ fontSize: '0.8em', color: '#666' }}>{deposit.referenceId}</span>
    )}
  </Typography>
</Box>
                                            </TableCell>
                                            <TableCell>
                                              <StatusChip
                                                status={deposit.status}
                                                label={deposit.status}
                                                size="small"
                                                icon={getStatusIcon(deposit.status)}
                                              />
                                            </TableCell>
                                            <TableCell align="center">
                                              {canRejectTransaction(deposit, 'deposit') && (
                                                <Tooltip title="Reject Online Deposit">
                                                  <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleRejectClick(deposit, 'deposit');
                                                    }}
                                                    sx={{
                                                      '&:hover': {
                                                        bgcolor: 'error.main',
                                                        color: 'white',
                                                        transform: 'scale(1.1)'
                                                      },
                                                      transition: 'all 0.2s ease'
                                                    }}
                                                  >
                                                    <RejectIcon fontSize="small" />
                                                  </IconButton>
                                                </Tooltip>
                                              )}
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </Box>
                                ) : (
                                  <Box sx={{ textAlign: 'center', py: 6 }}>
                                    <MoneyIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                                    <Typography variant="h6" color="text.secondary" fontWeight="500">
                                      No Deposits Found
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      This customer hasn't made any deposits yet
                                    </Typography>
                                  </Box>
                                )}
                              </Paper>
                            </Grid>

                            {/* Enhanced Withdrawals Section */}
                            <Grid item xs={12} lg={6}>
                              <Paper sx={{ 
                                p: 3, 
                                borderRadius: '16px', 
                                height: '100%',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                border: '1px solid rgba(244, 67, 54, 0.1)'
                              }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                  <Box sx={{
                                    p: 1,
                                    borderRadius: '8px',
                                    bgcolor: 'error.light',
                                    mr: 2
                                  }}>
                                    <TrendingDownIcon sx={{ color: 'error.main', fontSize: '1.5rem' }} />
                                  </Box>
                                  <Typography variant="h6" fontWeight="600" sx={{ flex: 1 }}>
                                    Withdrawal Requests
                                  </Typography>
                                  <Chip
                                    label={selectedCustomerDetails.withdrawalRequests?.length || 0}
                                    size="small"
                                    color="error"
                                    sx={{ 
                                      fontWeight: 600,
                                      minWidth: 40
                                    }}
                                  />
                                </Box>

                                {selectedCustomerDetails.withdrawalRequests && selectedCustomerDetails.withdrawalRequests.length > 0 ? (
                                  <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    <Table size="small">
                                      <TableHead>
                                        <TableRow>
                                          <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Date</TableCell>
                                          <TableCell align="right" sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Amount</TableCell>
                                          <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Status</TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {selectedCustomerDetails.withdrawalRequests.map((request, idx) => (
                                          <TableRow 
                                            key={`${request._id}-${idx}`} 
                                            hover
                                            sx={{
                                              '&:hover': {
                                                bgcolor: 'error.light',
                                                '& .MuiTableCell-root': {
                                                  color: 'error.contrastText'
                                                }
                                              }
                                            }}
                                          >
                                            <TableCell>
                                              <Typography variant="body2" fontWeight="500">
                                                {moment(request.requestDate).format('DD MMM YYYY')}
                                              </Typography>
                                              <Typography variant="caption" color="text.secondary">
                                                {moment(request.requestDate).format('hh:mm A')}
                                              </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                              <Typography 
                                                variant="body2" 
                                                fontWeight="700" 
                                                color="error.main"
                                                sx={{ fontFamily: 'monospace' }}
                                              >
                                                {formatCurrency(request.amount)}
                                              </Typography>
                                            </TableCell>
                                            <TableCell>
                                              <Chip
                                                label={request.status}
                                                size="small"
                                                color={
                                                  request.status === 'Pending' ? 'warning' :
                                                  request.status === 'Approved' ? 'success' :
                                                  request.status === 'Rejected' ? 'error' : 'default'
                                                }
                                                variant={request.status === 'Pending' ? 'outlined' : 'filled'}
                                                sx={{ fontWeight: 500 }}
                                              />
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </Box>
                                ) : (
                                  <Box sx={{ textAlign: 'center', py: 6 }}>
                                    <MoneyIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                                    <Typography variant="h6" color="text.secondary" fontWeight="500">
                                      No Withdrawal Requests
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      This customer hasn't requested any withdrawals
                                    </Typography>
                                  </Box>
                                )}
                              </Paper>
                            </Grid>
                          </Grid>
                        </>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                          <InfoIcon sx={{ fontSize: 72, color: 'text.disabled', mb: 3 }} />
                          <Typography variant="h6" color="text.secondary" fontWeight="500" sx={{ mb: 1 }}>
                            No Transaction Data Available
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            No detailed transaction data is available for this customer at the moment.
                          </Typography>
                          <IconButton
                            color="primary"
                            onClick={() => handleRowClick(summary._id)}
                            sx={{
                              bgcolor: 'primary.light',
                              '&:hover': { bgcolor: 'primary.main', color: 'white' }
                            }}
                          >
                            <RefreshIcon />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>

    {/* Enhanced Professional Pagination */}
    <Box sx={{ 
      borderTop: '1px solid',
      borderColor: 'divider',
      bgcolor: 'grey.50'
    }}>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={filteredCustomers.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
        sx={{
          '& .MuiTablePagination-toolbar': {
            paddingLeft: 3,
            paddingRight: 2,
            minHeight: 64
          },
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
            fontWeight: 500,
            color: 'text.secondary'
          },
          '& .MuiTablePagination-select': {
            fontWeight: 600
          },
          '& .MuiIconButton-root': {
            borderRadius: '8px',
            '&:hover': {
              bgcolor: 'primary.light',
              color: 'primary.main'
            }
          }
        }}
        labelRowsPerPage="Rows per page:"
        labelDisplayedRows={({ from, to, count }) => 
          `${from}–${to} of ${count !== -1 ? count : `more than ${to}`} customers`
        }
      />
    </Box>
  </Paper>
)}

      {/* {{ edit_4 }} */}
      {/* Rejection Dialog */}
      <Dialog open={rejectionDialogOpen} onClose={handleRejectionDialogClose} PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle sx={{ bgcolor: 'error.main', color: 'white', pb: 1 }}>
            Reject {transactionType === 'deposit' ? 'Deposit' : 'Withdrawal Request'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please provide a reason for rejecting this {transactionType === 'deposit' ? 'deposit' : 'withdrawal request'}.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Rejection Reason"
            type="text"
            fullWidth
            variant="outlined"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            multiline
            rows={4}
            sx={{
                '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleRejectionDialogClose} color="secondary" variant="outlined" sx={{ borderRadius: '8px' }}>
            Cancel
          </Button>
          <Button onClick={handleRejectConfirm} color="error" variant="contained" sx={{ borderRadius: '8px' }}>
            Confirm Reject
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
};

export default PaymentManagement;

// {{ edit_5 }}
// Helper function to determine if a transaction can be rejected
// Based on backend logic, only pending transactions can be rejected
const canRejectTransaction = (transaction, type) => {
    return transaction.status === 'pending';
};

