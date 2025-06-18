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
  IconButton,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Tabs,
  Tab,
  Badge,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Assessment as ReportIcon,
  People as CustomersIcon,
  BusinessCenter as CollectorsIcon,
  AccountBalance as PigmyIcon,
  TrendingUp as DepositsIcon,
  TrendingDown as WithdrawalsIcon,
  Feedback as FeedbackIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Timeline as TimelineIcon,
  MonetizationOn as MoneyIcon,
  Star as StarIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Person as PersonIcon,
  Today as TodayIcon,
  DateRange as DateRangeIcon,
  BarChart as ChartIcon,
} from '@mui/icons-material';
import { AdminContext } from '../Context/Context';
import moment from 'moment';

// Styled Components
const HeaderContainer = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="3" cy="3" r="3"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
  }
}));

const MetricCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  border: '1px solid rgba(0,0,0,0.04)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
  },
}));

const SectionCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  marginBottom: theme.spacing(3),
  boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
  border: '1px solid rgba(0,0,0,0.04)',
}));

const StatusChip = styled(Chip)(({ status }) => {
  const getStatusColors = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'approved':
      case 'completed':
        return { backgroundColor: '#e8f5e8', color: '#2e7d32' };
      case 'inactive':
      case 'rejected':
      case 'cancelled':
        return { backgroundColor: '#ffebee', color: '#d32f2f' };
      case 'pending':
      case 'processing':
        return { backgroundColor: '#fff3e0', color: '#f57c00' };
      default:
        return { backgroundColor: '#f5f5f5', color: '#757575' };
    }
  };
  
  const colors = getStatusColors(status);
  return {
    ...colors,
    fontWeight: 600,
    borderRadius: '8px',
  };
});

const FilterBar = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: '#fafafa',
  borderRadius: '12px',
  marginBottom: theme.spacing(3),
  border: '1px solid rgba(0,0,0,0.08)',
}));

const Rpt = () => {
  const { reportData, reportLoading, reportError, fetchComprehensiveReport } = useContext(AdminContext);
  
  // State for filtering and tabs
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchComprehensiveReport();
  }, []);

  // Calculate metrics
  const calculateMetrics = (data) => {
    if (!data) return {};
    
    const { customers, collectors, deposits, withdrawalRequests, feedbackList } = data;
    
    // Total amounts
    const totalDeposits = deposits.reduce((sum, deposit) => sum + (deposit.amount || 0), 0);
    const totalWithdrawals = withdrawalRequests.reduce((sum, req) => sum + (req.amount || 0), 0);
    
    // Active counts
    const activeCustomers = customers.filter(c => c.status === 'active').length;
    const activeCollectors = collectors.filter(c => c.status === 'active').length;
    
    // Recent activity (last 7 days)
    const sevenDaysAgo = moment().subtract(7, 'days');
    const recentDeposits = deposits.filter(d => moment(d.createdAt).isAfter(sevenDaysAgo)).length;
    const recentFeedback = feedbackList.filter(f => moment(f.createdAt).isAfter(sevenDaysAgo)).length;
    
    // Average rating
    const ratingsWithValues = feedbackList.filter(f => f.rating && f.rating > 0);
    const avgRating = ratingsWithValues.length > 0 
      ? ratingsWithValues.reduce((sum, f) => sum + f.rating, 0) / ratingsWithValues.length 
      : 0;
    
    return {
      totalCustomers: customers.length,
      activeCustomers,
      totalCollectors: collectors.length,
      activeCollectors,
      totalDeposits,
      totalWithdrawals,
      recentDeposits,
      recentFeedback,
      avgRating: avgRating.toFixed(1),
      netAmount: totalDeposits - totalWithdrawals,
    };
  };

  const metrics = calculateMetrics(reportData);

  // Filter functions
  const filterData = (data, searchTerm, statusFilter) => {
    if (!data) return [];
    
    return data.filter(item => {
      const matchesSearch = !searchTerm || 
        Object.values(item).some(value => 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'approved':
      case 'completed':
        return <CheckIcon sx={{ fontSize: 16 }} />;
      case 'inactive':
      case 'rejected':
      case 'cancelled':
        return <CancelIcon sx={{ fontSize: 16 }} />;
      case 'pending':
      case 'processing':
        return <PendingIcon sx={{ fontSize: 16 }} />;
      default:
        return null;
    }
  };

  const handleRefresh = () => {
    fetchComprehensiveReport();
  };

  const handleExport = () => {
    // Implementation for export functionality
    console.log('Export functionality to be implemented');
  };

  if (reportLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <CircularProgress size={80} thickness={4} />
          <Typography variant="h5" color="text.secondary" fontWeight={500}>
            Generating comprehensive report...
          </Typography>
          <LinearProgress sx={{ width: '300px', borderRadius: '4px' }} />
        </Box>
      </Container>
    );
  }

  if (reportError) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          sx={{ borderRadius: '12px', fontSize: '16px' }}
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
        >
          <Typography variant="h6" gutterBottom>Error Loading Report</Typography>
          {reportError}
        </Alert>
      </Container>
    );
  }

  if (!reportData) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="info" sx={{ borderRadius: '12px', fontSize: '16px' }}>
          <Typography variant="h6" gutterBottom>No Report Data Available</Typography>
          Could not load report data. Please try refreshing the page.
        </Alert>
      </Container>
    );
  }

  const { customers, collectors, pigmyPlans, deposits, withdrawalRequests, feedbackList } = reportData;

  const tabPanels = [
    { label: 'Overview', value: 0 },
    { label: 'Customers', value: 1, count: customers.length },
    { label: 'Collectors', value: 2, count: collectors.length },
    { label: 'Deposits', value: 3, count: deposits.length },
    { label: 'Withdrawals', value: 4, count: withdrawalRequests.length },
    { label: 'Feedback', value: 5, count: feedbackList.length },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Enhanced Header */}
      <HeaderContainer>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(255,255,255,0.2)' }}>
              <ReportIcon sx={{ fontSize: 36 }} />
            </Avatar>
            <Box>
              <Typography variant="h3" fontWeight="700" gutterBottom>
                Dashboard
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Comprehensive business insights and performance metrics
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                Last updated: {moment().format('MMMM DD, YYYY [at] HH:mm')}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title="Refresh Data">
              <IconButton 
                onClick={handleRefresh}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export Report">
              {/* <IconButton 
                onClick={handleExport}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              >
                <DownloadIcon />
              </IconButton> */}
            </Tooltip>
          </Box>
        </Box>
      </HeaderContainer>

      {/* Enhanced Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#e3f2fd', color: '#1976d2', width: 56, height: 56 }}>
                  <CustomersIcon sx={{ fontSize: 28 }} />
                </Avatar>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {metrics.totalCustomers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Customers
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                  label={`${metrics.activeCustomers} Active`} 
                  size="small" 
                  color="success" 
                  variant="outlined"
                />
                <Typography variant="caption" color="text.secondary">
                  {((metrics.activeCustomers / metrics.totalCustomers) * 100).toFixed(1)}% active rate
                </Typography>
              </Box>
            </CardContent>
          </MetricCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#f3e5f5', color: '#7b1fa2', width: 56, height: 56 }}>
                  <CollectorsIcon sx={{ fontSize: 28 }} />
                </Avatar>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h4" fontWeight="bold" color="secondary">
                    {metrics.totalCollectors}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Collectors
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                  label={`${metrics.activeCollectors} Active`} 
                  size="small" 
                  color="secondary" 
                  variant="outlined"
                />
                <Typography variant="caption" color="text.secondary">
                  {((metrics.activeCollectors / metrics.totalCollectors) * 100).toFixed(1)}% active rate
                </Typography>
              </Box>
            </CardContent>
          </MetricCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#e8f5e8', color: '#2e7d32', width: 56, height: 56 }}>
                  <MoneyIcon sx={{ fontSize: 28 }} />
                </Avatar>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    ₹{(metrics.totalDeposits / 100000).toFixed(1)}L
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Deposits
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                  label={`${metrics.recentDeposits} This Week`} 
                  size="small" 
                  color="success" 
                  variant="outlined"
                />
                <Typography variant="caption" color="text.secondary">
                  Recent activity
                </Typography>
              </Box>
            </CardContent>
          </MetricCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#fff3e0', color: '#ef6c00', width: 56, height: 56 }}>
                  <StarIcon sx={{ fontSize: 28 }} />
                </Avatar>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {metrics.avgRating}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Rating
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                  label={`${feedbackList.length} Reviews`} 
                  size="small" 
                  color="warning" 
                  variant="outlined"
                />
                <Typography variant="caption" color="text.secondary">
                  Customer feedback
                </Typography>
              </Box>
            </CardContent>
          </MetricCard>
        </Grid>
      </Grid>

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 3, borderRadius: '12px' }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2 }}
        >
          {tabPanels.map((tab) => (
            <Tab
              key={tab.value}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {tab.label}
                  {tab.count && (
                    <Badge badgeContent={tab.count} color="primary" max={999} />
                  )}
                </Box>
              }
              sx={{ minHeight: 64, fontWeight: 600 }}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Filter Bar */}
      {/* {activeTab > 0 && (
        <FilterBar>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ bgcolor: 'white', borderRadius: '8px' }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status Filter</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status Filter"
                  sx={{ bgcolor: 'white', borderRadius: '8px' }}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Date Filter</InputLabel>
                <Select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  label="Date Filter"
                  sx={{ bgcolor: 'white', borderRadius: '8px' }}
                >
                  <MenuItem value="all">All Time</MenuItem>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="week">This Week</MenuItem>
                  <MenuItem value="month">This Month</MenuItem>
                  <MenuItem value="year">This Year</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setDateFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </FilterBar>
      )} */}

      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Quick Stats */}
          <Grid item xs={12}>
            <SectionCard>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ChartIcon color="primary" />
                  Business Overview
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: '12px' }}>
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        Financial Summary
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Total Deposits:</Typography>
                        <Typography fontWeight="bold" color="success.main">₹{metrics.totalDeposits.toLocaleString()}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Total Withdrawals:</Typography>
                        <Typography fontWeight="bold" color="error.main">₹{metrics.totalWithdrawals.toLocaleString()}</Typography>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography fontWeight="bold">Net Amount:</Typography>
                        <Typography fontWeight="bold" color={metrics.netAmount >= 0 ? "success.main" : "error.main"}>
                          ₹{metrics.netAmount.toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: '12px' }}>
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        Activity Summary
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Recent Deposits (7 days):</Typography>
                        <Typography fontWeight="bold">{metrics.recentDeposits}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Recent Feedback (7 days):</Typography>
                        <Typography fontWeight="bold">{metrics.recentFeedback}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Pigmy Plans Available:</Typography>
                        <Typography fontWeight="bold">{pigmyPlans.length}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography>Customer Satisfaction:</Typography>
                        <Typography fontWeight="bold" color="warning.main">{metrics.avgRating}/5</Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </SectionCard>
          </Grid>
        </Grid>
      )}

      {/* Customers Tab */}
      {activeTab === 1 && (
        <SectionCard>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
              <Typography variant="h5" fontWeight="600" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CustomersIcon color="primary" />
                Customers Management ({filterData(customers, searchTerm, statusFilter).length})
              </Typography>
            </Box>
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>Contact</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>Account</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>Plan</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>Joined</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filterData(customers, searchTerm, statusFilter).map((customer) => (
                    <TableRow key={customer._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.light', color: 'white' }}>
                            {customer.name?.charAt(0)?.toUpperCase()}
                          </Avatar>
                          <Typography fontWeight={500}>{customer.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">{customer.email}</Typography>
                          <Typography variant="caption" color="text.secondary">{customer.phone}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={customer.accountNumber} variant="outlined" size="small" />
                      </TableCell>
                      <TableCell>
                        {customer.packageId ? (
                          <Chip label={customer.packageId.plan_name} color="info" size="small" />
                        ) : (
                          <Typography variant="body2" color="text.secondary">No Plan</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusChip 
                          label={customer.status} 
                          status={customer.status}
                          size="small"
                          icon={getStatusIcon(customer.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {moment(customer.createdAt).format('MMM DD, YYYY')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {moment(customer.createdAt).fromNow()}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </SectionCard>
      )}

      {/* Collectors Tab */}
      {activeTab === 2 && (
        <SectionCard>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
              <Typography variant="h5" fontWeight="600" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CollectorsIcon color="secondary" />
                Collectors Management ({filterData(collectors, searchTerm, statusFilter).length})
              </Typography>
            </Box>
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>Collector</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>Contact</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>Joined</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>Performance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filterData(collectors, searchTerm, statusFilter).map((collector) => {
                    const collectorDeposits = deposits.filter(d => d.collectorId?._id === collector._id);
                    const totalCollected = collectorDeposits.reduce((sum, d) => sum + (d.amount || 0), 0);
                    
                    return (
                      <TableRow key={collector._id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'secondary.light', color: 'white' }}>
                              {collector.name?.charAt(0)?.toUpperCase()}
                            </Avatar>
                            <Typography fontWeight={500}>{collector.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">{collector.email}</Typography>
                            <Typography variant="caption" color="text.secondary">{collector.phone}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <StatusChip 
                            label={collector.status} 
                            status={collector.status}
                            size="small"
                            icon={getStatusIcon(collector.status)}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {moment(collector.createdAt).format('MMM DD, YYYY')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {moment(collector.createdAt).fromNow()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{totalCollected}</Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </SectionCard>
      )}

{activeTab === 3 && (
  <SectionCard>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <DepositsIcon color="success" />
        <Typography variant="h5" fontWeight="600">
          Deposits ({deposits.length})
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {deposits.length > 0 ? (
        <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 400 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Collector</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {deposits.map((deposit) => (
                <TableRow key={deposit._id} hover>
                  <TableCell>
                    {deposit.customerId
                      ? `${deposit.customerId.name} (${deposit.customerId.accountNumber})`
                      : 'N/A'}
                  </TableCell>
                  <TableCell>{deposit.collectorId?.name || 'N/A'}</TableCell>
                  <TableCell>₹{deposit.amount}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {moment(deposit.createdAt).format('YYYY-MM-DD')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {moment(deposit.createdAt).fromNow()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <StatusChip
                      label={deposit.status}
                      status={deposit.status}
                      size="small"
                      icon={getStatusIcon(deposit.status)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No deposit data available.
        </Typography>
      )}
    </CardContent>
  </SectionCard>
)}


      {activeTab === 4 && (
  <SectionCard>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <WithdrawalsIcon color="error" />
        <Typography variant="h5" fontWeight="600">
          Withdrawal Requests ({withdrawalRequests.length})
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {withdrawalRequests.length > 0 ? (
        <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 400 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Request Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {withdrawalRequests.map((request) => (
                <TableRow key={request._id} hover>
                  <TableCell>
                    <Typography fontWeight={500}>
                      {request.customerId
                        ? `${request.customerId.name} (${request.customerId.accountNumber})`
                        : 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>₹{request.amount}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {moment(request.date).format('YYYY-MM-DD')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {moment(request.date).fromNow()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <StatusChip
                      label={request.status}
                      status={request.status}
                      size="small"
                      icon={getStatusIcon(request.status)}
                    />
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No withdrawal request data available.
        </Typography>
      )}
    </CardContent>
  </SectionCard>
)}

{activeTab === 5 && (
  <SectionCard>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <FeedbackIcon color="warning" />
        <Typography variant="h5" fontWeight="600">
          Feedback ({feedbackList.length})
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {feedbackList.length > 0 ? (
        <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 400 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Source</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Rating</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {feedbackList.map((feedback) => (
                <TableRow key={feedback._id} hover>
                  <TableCell>
                    <Typography fontWeight={500}>
                      {feedback.source} ({feedback.sourceId?.name || 'N/A'})
                    </Typography>
                  </TableCell>
                  <TableCell>{feedback.subject}</TableCell>
                  <TableCell>{feedback.type}</TableCell>
                  <TableCell>{feedback.rating || 'N/A'}</TableCell>
                  <TableCell>
                    <StatusChip
                      label={feedback.status}
                      status={feedback.status}
                      size="small"
                      icon={getStatusIcon(feedback.status)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {moment(feedback.createdAt).format('YYYY-MM-DD')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {moment(feedback.createdAt).fromNow()}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body2" color="text.secondary">No feedback data available.</Typography>
      )}
    </CardContent>
  </SectionCard>
)}


    </Container>
  );
};

export default Rpt;