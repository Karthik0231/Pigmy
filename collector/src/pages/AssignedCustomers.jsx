import React, { useContext, useEffect, useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Tooltip,
  Avatar,
  LinearProgress,
  Badge,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { tableCellClasses } from '@mui/material/TableCell';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  GetApp as ExportIcon,
  Person as PersonIcon,
  AccountBalance as BankIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Visibility as ViewIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  MonetizationOn as MoneyIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { CollectorContext } from '../Context/Context';
import moment from 'moment';
import {config} from '../Config/Config';
import { useNavigate } from 'react-router-dom';

// Enhanced styled components with modern design
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    color: "blue",
    fontWeight: 700,
    fontSize: '0.95rem',
    padding: '16px 12px',
    borderBottom: 'none',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: '0.875rem',
    padding: '12px',
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    transition: 'all 0.2s ease-in-out',
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: 'all 0.3s ease-in-out',
  '&:nth-of-type(even)': {
    backgroundColor: alpha(theme.palette.primary.main, 0.02),
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  cursor: 'pointer',
}));

const StatsCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)',
  },
}));

const SearchBox = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '25px',
    backgroundColor: alpha(theme.palette.common.white, 0.8),
    backdropFilter: 'blur(10px)',
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.9),
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
    },
  },
}));

const FilterButton = styled(Button)(({ theme }) => ({
  borderRadius: '20px',
  textTransform: 'none',
  fontWeight: 600,
  backdropFilter: 'blur(10px)',
  backgroundColor: alpha(theme.palette.common.white, 0.8),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.9),
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
}));

export default function AssignedCustomers() {
  const { assignedCustomers, fetchAssignedCustomers } = useContext(CollectorContext);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [accountTypeFilter, setAccountTypeFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const {host} = config;

  const navigate = useNavigate();

  useEffect(() => {
    const loadCustomers = async () => {
      setLoading(true);
      await fetchAssignedCustomers();
      setLoading(false);
    };
    loadCustomers();
  }, []);

  // Filtered and searched customers
  const filteredCustomers = useMemo(() => {
    if (!assignedCustomers) return [];
    
    return assignedCustomers.filter(customer => {
      const matchesSearch = !searchTerm || 
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.accountNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
      const matchesAccountType = accountTypeFilter === 'all' || customer.accountType === accountTypeFilter;
      
      return matchesSearch && matchesStatus && matchesAccountType;
    });
  }, [assignedCustomers, searchTerm, statusFilter, accountTypeFilter]);

  // Statistics calculations
  const stats = useMemo(() => {
    if (!assignedCustomers || assignedCustomers.length === 0) {
      return { total: 0, active: 0, totalBalance: 0, avgBalance: 0 };
    }

    const total = assignedCustomers.length;
    const active = assignedCustomers.filter(c => c.status === 'active').length;
    const totalBalance = assignedCustomers.reduce((sum, c) => sum + (c.balance || 0), 0);
    const avgBalance = totalBalance / total;

    return { total, active, totalBalance, avgBalance };
  }, [assignedCustomers]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      default: return 'default';
    }
  };

  const getMaturityProgress = (startDate, maturityDate) => {
    if (!startDate || !maturityDate) return 0;
    
    const start = moment(startDate);
    const end = moment(maturityDate);
    const now = moment();
    
    if (now.isBefore(start)) return 0;
    if (now.isAfter(end)) return 100;
    
    const total = end.diff(start);
    const elapsed = now.diff(start);
    return Math.round((elapsed / total) * 100);
  };

  const handleCustomerClick = (customer) => {
    setSelectedCustomer(customer);
    setDetailsOpen(true);
  };

  const handleRefresh = async () => {
    setLoading(true);
    await fetchAssignedCustomers();
    setLoading(false);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      p: 3 
    }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Assigned Customers
            </Typography>
            <Typography variant="h6" color="text.secondary" fontWeight="500">
              Manage and track your assigned pigmy savings accounts
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title="Refresh Data">
              <IconButton 
                onClick={handleRefresh}
                sx={{ 
                  backgroundColor: 'white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  '&:hover': { transform: 'scale(1.1)' }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <PersonIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">{stats.total}</Typography>
                  <Typography variant="body2" opacity={0.9}>Total Customers</Typography>
                </Box>
              </CardContent>
            </StatsCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard sx={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <TrendingUpIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">{stats.active}</Typography>
                  <Typography variant="body2" opacity={0.9}>Active Accounts</Typography>
                </Box>
              </CardContent>
            </StatsCard>
          </Grid> 
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard sx={{ background: 'linear-gradient(135deg, #ff9a9e 0%,rgb(12, 8, 11) 100%)' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <MoneyIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">₹{stats.totalBalance.toLocaleString()}</Typography>
                  <Typography variant="body2" opacity={0.9}>Total Balance</Typography>
                </Box>
              </CardContent>
            </StatsCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard sx={{ background: 'linear-gradient(135deg, #a8edea 0%,rgb(240, 75, 128) 100%)' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <BankIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">₹{Math.round(stats.avgBalance).toLocaleString()}</Typography>
                  <Typography variant="body2" opacity={0.9}>Avg Balance</Typography>
                </Box>
              </CardContent>
            </StatsCard>
          </Grid>
        </Grid>

        {/* Search and Filter Section */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            borderRadius: '20px',
            backgroundColor: alpha('#fff', 0.8),
            backdropFilter: 'blur(10px)',
            mb: 3
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <SearchBox
                fullWidth
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status Filter</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status Filter"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Account Type</InputLabel>
                <Select
                  value={accountTypeFilter}
                  label="Account Type"
                  onChange={(e) => setAccountTypeFilter(e.target.value)}
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {/* <Grid item xs={12} md={2}>
              <FilterButton
                fullWidth
                startIcon={<FilterIcon />}
                variant="outlined"
              >
                Advanced
              </FilterButton>
            </Grid> */}
          </Grid>
        </Paper>
      </Box>

      {/* Main Content */}
      {loading ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '400px',
          gap: 2
        }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" color="text.secondary">Loading customer data...</Typography>
        </Box>
      ) : filteredCustomers && filteredCustomers.length > 0 ? (
        <Paper 
          elevation={0}
          sx={{ 
            borderRadius: '20px',
            overflow: 'hidden',
            backgroundColor: alpha('#fff', 0.9),
            backdropFilter: 'blur(10px)',
          }}
        >
          <TableContainer sx={{ maxHeight: '70vh' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <StyledTableCell>Customer</StyledTableCell>
                  <StyledTableCell>Contact</StyledTableCell>
                  <StyledTableCell>Account Details</StyledTableCell>
                  <StyledTableCell>Plan Information</StyledTableCell>
                  <StyledTableCell>Financial Details</StyledTableCell>
                  <StyledTableCell>Maturity Progress</StyledTableCell>
                  <StyledTableCell>Status</StyledTableCell>
                  <StyledTableCell align="center">Actions</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCustomers.map((customer) => {
                  const progress = getMaturityProgress(customer.startDate, customer.maturityDate);
                  return (
                    <StyledTableRow 
                      key={customer._id}
                      onClick={() => handleCustomerClick(customer)}
                    >
                      <StyledTableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar 
                          src={customer.profileImage ? `${host}/${customer.profileImage.replace(/\\/g, '/')}` : ''}
                          sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                            {customer.name?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="600">
                              {customer.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {customer.gender} • DOB: {customer.dob ? moment(customer.dob).format('DD/MM/YYYY') : 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      </StyledTableCell>

                      <StyledTableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PhoneIcon fontSize="small" color="action" />
                            <Typography variant="body2">{customer.phone}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <EmailIcon fontSize="small" color="action" />
                            <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                              {customer.email || 'N/A'}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationIcon fontSize="small" color="action" />
                            <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                              {customer.address || 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      </StyledTableCell>

                      <StyledTableCell>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="600">
                            {customer.accountNumber}
                          </Typography>
                          <Chip 
                            label={customer.accountType?.toUpperCase()} 
                            size="small" 
                            variant="outlined"
                            sx={{ mt: 1 }}
                          />
                        </Box>
                      </StyledTableCell>

                      <StyledTableCell>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="600">
                            {customer.packageId?.plan_name || 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {customer.packageId?.duration_months} months • {customer.packageId?.interest_rate}% p.a.
                          </Typography>
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            Frequency: {customer.packageId?.deposit_frequency}
                          </Typography>
                        </Box>
                      </StyledTableCell>

                      <StyledTableCell>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="600" color="primary">
                            Balance: ₹{customer.balance?.toLocaleString() || '0'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Deposit: ₹{customer.packageId?.deposit_amount?.toLocaleString() || 'N/A'}
                          </Typography>
                          <br />
                          <Typography variant="caption" color="success.main">
                            Maturity: ₹{customer.packageId?.maturity_amount?.toLocaleString() || 'N/A'}
                          </Typography>
                        </Box>
                      </StyledTableCell>

                      <StyledTableCell>
                        <Box sx={{ width: '100%', mb: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="caption">{progress}%</Typography>
                            <Typography variant="caption">
                              {customer.maturityDate ? moment(customer.maturityDate).format('DD/MM/YY') : 'N/A'}
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={progress} 
                            sx={{ 
                              height: 8, 
                              borderRadius: 4,
                              bgcolor: alpha('#000', 0.1),
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                                background: progress < 50 ? 'linear-gradient(90deg, #ff9a9e, #fecfef)' : 
                                          progress < 80 ? 'linear-gradient(90deg, #a8edea, #fed6e3)' :
                                          'linear-gradient(90deg, #11998e, #38ef7d)'
                              }
                            }}
                          />
                        </Box>
                      </StyledTableCell>

                      <StyledTableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Chip
                            label={customer.status || 'Active'}
                            color={getStatusColor(customer.status)}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                          <Chip
                            label={customer.isClosed ? 'Closed' : 'Open'}
                            color={customer.isClosed ? 'error' : 'success'}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </StyledTableCell>

                      <StyledTableCell align="center">
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small"
                            sx={{ 
                              bgcolor: 'primary.main',
                              color: 'white',
                              '&:hover': { bgcolor: 'primary.dark', transform: 'scale(1.1)' }
                            }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
<Button
  variant="contained"
  size="small"
  sx={{
    bgcolor: 'primary.main',
    color: 'white',
    fontWeight: 'bold',
    px: 2,
    textTransform: 'none',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      bgcolor: 'primary.dark',
      transform: 'scale(1.05)',
    },
  }}
  onClick={() => navigate(`/customer-statements/${customer._id}`)}
>
  Statement
</Button>

                        </Tooltip>
                      </StyledTableCell>
                    </StyledTableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : (
        <Paper 
          sx={{ 
            p: 6, 
            textAlign: 'center',
            borderRadius: '20px',
            backgroundColor: alpha('#fff', 0.9),
            backdropFilter: 'blur(10px)',
          }}
        >
          <BankIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" fontWeight="600" gutterBottom>
            No Customers Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
            {searchTerm || statusFilter !== 'all' || accountTypeFilter !== 'all' 
              ? 'No customers match your current search and filter criteria.'
              : 'You don\'t have any assigned pigmy customers yet.'}
          </Typography>
          {(searchTerm || statusFilter !== 'all' || accountTypeFilter !== 'all') && (
            <Button 
              variant="contained" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setAccountTypeFilter('all');
              }}
              sx={{ borderRadius: '20px' }}
            >
              Clear Filters
            </Button>
          )}
        </Paper>
      )}

      {/* Customer Details Dialog */}
      <Dialog 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            // backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          }
        }}
      >
        <DialogTitle sx={{ 
          // background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'black',
          fontWeight: 'bold'
        }}>
          Customer Details: {selectedCustomer?.name}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedCustomer && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: '12px' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Personal Information
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography><strong>Name:</strong> {selectedCustomer.name}</Typography>
                      <Typography><strong>Phone:</strong> {selectedCustomer.phone}</Typography>
                      <Typography><strong>Email:</strong> {selectedCustomer.email || 'N/A'}</Typography>
                      <Typography><strong>Gender:</strong> {selectedCustomer.gender || 'N/A'}</Typography>
                      <Typography><strong>DOB:</strong> {selectedCustomer.dob ? moment(selectedCustomer.dob).format('DD/MM/YYYY') : 'N/A'}</Typography>
                      <Typography><strong>Address:</strong> {selectedCustomer.address || 'N/A'}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: '12px' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Account Information
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography><strong>Account Number:</strong> {selectedCustomer.accountNumber}</Typography>
                      <Typography><strong>Account Type:</strong> {selectedCustomer.accountType?.toUpperCase()}</Typography>
                      <Typography><strong>Current Balance:</strong> ₹{selectedCustomer.balance?.toLocaleString() || '0'}</Typography>
                      <Typography><strong>Start Date:</strong> {selectedCustomer.startDate ? moment(selectedCustomer.startDate).format('DD/MM/YYYY') : 'N/A'}</Typography>
                      <Typography><strong>Maturity Date:</strong> {selectedCustomer.maturityDate ? moment(selectedCustomer.maturityDate).format('DD/MM/YYYY') : 'N/A'}</Typography>
                      <Typography><strong>Status:</strong> 
                        <Chip 
                          label={selectedCustomer.status || 'Active'} 
                          color={getStatusColor(selectedCustomer.status)}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                      <Typography><strong>Account Status:</strong> 
                        <Chip 
                          label={selectedCustomer.isClosed ? 'Closed' : 'Open'} 
                          color={selectedCustomer.isClosed ? 'error' : 'success'}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              {selectedCustomer.packageId && (
                <Grid item xs={12}>
                  <Card sx={{ borderRadius: '12px' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary">
                        Plan Details
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography><strong>Plan Name:</strong> {selectedCustomer.packageId.plan_name}</Typography>
                          <Typography><strong>Deposit Frequency:</strong> {selectedCustomer.packageId.deposit_frequency}</Typography>
                          <Typography><strong>Duration:</strong> {selectedCustomer.packageId.duration_months} months</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography><strong>Deposit Amount:</strong> ₹{selectedCustomer.packageId.deposit_amount?.toLocaleString()}</Typography>
                          <Typography><strong>Interest Rate:</strong> {selectedCustomer.packageId.interest_rate}% p.a.</Typography>
                          <Typography><strong>Maturity Amount:</strong> ₹{selectedCustomer.packageId.maturity_amount?.toLocaleString()}</Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}
              {selectedCustomer.withdrawalRequests && selectedCustomer.withdrawalRequests.length > 0 && (
                <Grid item xs={12}>
                  <Card sx={{ borderRadius: '12px' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary">
                        Withdrawal Requests
                      </Typography>
                      {selectedCustomer.withdrawalRequests.map((request, index) => (
                        <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Typography><strong>Amount:</strong> ₹{request.amount?.toLocaleString()}</Typography>
                          <Typography><strong>Date:</strong> {moment(request.date).format('DD/MM/YYYY')}</Typography>
                          <Typography><strong>Status:</strong> 
                            <Chip 
                              label={request.status} 
                              color={request.status === 'approved' ? 'success' : request.status === 'rejected' ? 'error' : 'warning'}
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          </Typography>
                          {request.remarks && <Typography><strong>Remarks:</strong> {request.remarks}</Typography>}
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDetailsOpen(false)} sx={{ borderRadius: '20px' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab 
        color="primary" 
        sx={{ 
          position: 'fixed', 
          bottom: 24, 
          right: 24,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '&:hover': {
            transform: 'scale(1.1)',
            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
          }
        }}
        onClick={handleRefresh}
      >
        <RefreshIcon />
      </Fab>
    </Box>
  );
}
