import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Container,
  CircularProgress,
  Alert,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  Button,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  IconButton,
  useTheme
} from '@mui/material';
import {
  Download as DownloadIcon,
  Search as SearchIcon,
  Print as PrintIcon,
  FilterList as FilterIcon,
  AccountBalance as BankIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { CollectorContext } from '../Context/Context';
import moment from 'moment';
import { config } from '../Config/Config';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`statement-tabpanel-${index}`}
      aria-labelledby={`statement-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default function CustomerStatementPage() {
  const { customerId } = useParams();
  const {
    customerStatement,
    loading,
    error,
    fetchCustomerStatement,
    clearMessages
  } = useContext(CollectorContext);

  const { host } = config;
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    if (customerId) {
      fetchCustomerStatement(customerId);
    }
    clearMessages();
    return () => clearMessages();
  }, [customerId]);

  // const handleDownloadStatement = () => {
  //   window.print();
  // };

  const formatDate = (date) => {
    return moment(date).format('DD-MMM-YYYY');
  };

  const formatDateTime = (date) => {
    return moment(date).format('DD-MMM-YYYY HH:mm:ss');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      approved: { label: 'APPROVED', color: '#2E7D32', bgColor: '#E8F5E8' },
      pending: { label: 'PENDING', color: '#F57C00', bgColor: '#FFF3E0' },
      rejected: { label: 'REJECTED', color: '#D32F2F', bgColor: '#FFEBEE' }
    };
    
    const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
    
    return (
      <Box
        sx={{
          px: 1.5,
          py: 0.5,
          borderRadius: 1,
          bgcolor: config.bgColor,
          color: config.color,
          fontSize: '0.75rem',
          fontWeight: 600,
          textAlign: 'center',
          minWidth: '80px',
          border: `1px solid ${config.color}20`
        }}
      >
        {config.label}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
        <Box textAlign="center">
          <CircularProgress size={40} sx={{ mb: 2, color: '#1976d2' }} />
          <Typography variant="body1" color="text.secondary">Loading Statement...</Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
        <Container maxWidth="sm">
          <Paper sx={{ p: 4, textAlign: 'center', border: '1px solid #e0e0e0' }}>
            <Typography variant="h6" color="error" gutterBottom>Error Loading Statement</Typography>
            <Alert severity="error">{error}</Alert>
          </Paper>
        </Container>
      </Box>
    );
  }

  if (!customerStatement || !customerStatement.customer) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
        <Container maxWidth="sm">
          <Paper sx={{ p: 4, textAlign: 'center', border: '1px solid #e0e0e0' }}>
            <Typography variant="h6" gutterBottom>No Statement Available</Typography>
            <Typography color="text.secondary">No statement data found for this customer.</Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

  const { customer, deposits = [], withdrawalRequests = [] } = customerStatement;

  console.log("Deposits:", deposits);
  console.log("Withdrawal Requests:", withdrawalRequests);
  // Filter transactions
  const filteredDeposits = deposits.filter(deposit => {
    const matchesSearch = deposit.collectedBy?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deposit.amount.toString().includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || deposit.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredWithdrawals = withdrawalRequests.filter(request => {
    const matchesSearch = request.requirements?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.amount.toString().includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate summary
  const totalDeposits = deposits.filter(d => d.status === 'approved').reduce((sum, deposit) => sum + (deposit.amount || 0), 0);
  const totalWithdrawals = withdrawalRequests.filter(req => req.status === 'approved').reduce((sum, req) => sum + (req.amount || 0), 0);
  const netBalance = totalDeposits - totalWithdrawals;

  console.log("Filtered Deposits:", filteredDeposits);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', py: 3 }}>
      <Container maxWidth="lg">
        {/* Professional Header */}
        <Paper 
          elevation={0} 
          sx={{ 
            mb: 3, 
            border: '2px solid #1976d2',
            borderRadius: 0
          }}
        >
          {/* Bank Header */}
          <Box sx={{ bgcolor: '#1976d2', color: 'white', p: 3 }}>
            <Grid container alignItems="center" justifyContent="space-between">
              <Grid item>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <BankIcon sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" fontWeight="700" sx={{ letterSpacing: 1 }}>
                      PIGMY BANK
                    </Typography>
                    <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                      CUSTOMER ACCOUNT STATEMENT
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
              <Grid item>
                <Stack spacing={1} alignItems="flex-end">
                  {/* <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadStatement}
                    sx={{ 
                      bgcolor: 'white',
                      color: '#1976d2',
                      fontWeight: 600,
                      '&:hover': { bgcolor: '#f5f5f5' },
                      '@media print': { display: 'none' }
                    }}
                  >
                    Download PDF
                  </Button> */}
                  <Typography variant="caption" sx={{color:"white" }}>
                    Generated: {moment().format('DD-MMM-YYYY HH:mm')}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </Box>

          {/* Customer Information Section */}
          <Box sx={{ p: 4, bgcolor: 'white' }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={8}>
                <Typography variant="h6" fontWeight="600" sx={{ mb: 2, color: '#333', borderBottom: '2px solid #1976d2', pb: 1, display: 'inline-block' }}>
                  ACCOUNT HOLDER DETAILS
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>ACCOUNT HOLDER NAME</Typography>
                        <Typography variant="h6" fontWeight="600" sx={{ color: '#333' }}>{customer.name?.toUpperCase()}</Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>ACCOUNT NUMBER</Typography>
                        <Typography variant="body1" fontWeight="600" sx={{ color: '#333', fontFamily: 'monospace' }}>
                          {customer.accountNumber}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>MOBILE NUMBER</Typography>
                        <Typography variant="body1" sx={{ color: '#333' }}>{customer.phone}</Typography>
                      </Box>
                    </Stack>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>EMAIL ADDRESS</Typography>
                        <Typography variant="body1" sx={{ color: '#333' }}>{customer.email}</Typography>
                      </Box>

                      <Box>
                        <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>REGISTERED ADDRESS</Typography>
                        <Typography variant="body2" sx={{ color: '#333' }}>{customer.address}</Typography>
                      </Box>

                      <Box>
                        <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>ACCOUNT OPENED</Typography>
                        <Typography variant="body1" sx={{ color: '#333' }}>{formatDate(customer.createdAt)}</Typography>
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{ border: '2px solid #1976d2', p: 3, bgcolor: '#f8f9ff' }}>
                  <Typography variant="h6" fontWeight="600" sx={{ mb: 2, color: '#1976d2', textAlign: 'center' }}>
                    CURRENT BALANCE
                  </Typography>
                  <Typography variant="h4" fontWeight="700" sx={{ color: '#1976d2', textAlign: 'center' }}>
                    {formatCurrency(customer.balance)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666', textAlign: 'center', display: 'block', mt: 1 }}>
                    As of {moment().format('DD-MMM-YYYY')}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* Plan Details */}
        {customer.packageId && (
          <Paper elevation={0} sx={{ mb: 3, border: '1px solid #e0e0e0' }}>
            <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderBottom: '1px solid #e0e0e0' }}>
              <Typography variant="h6" fontWeight="600" sx={{ color: '#333' }}>
                PIGMY SAVINGS PLAN DETAILS
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>PLAN NAME</Typography>
                  <Typography variant="body1" fontWeight="600" sx={{ color: '#333' }}>
                    {customer.packageId.plan_name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>DEPOSIT AMOUNT</Typography>
                  <Typography variant="body1" fontWeight="600" sx={{ color: '#333' }}>
                    {formatCurrency(customer.packageId.deposit_amount)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    ({customer.packageId.deposit_frequency})
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>INTEREST RATE</Typography>
                  <Typography variant="body1" fontWeight="600" sx={{ color: '#333' }}>
                    {customer.packageId.interest_rate}% per annum
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    Duration: {customer.packageId.duration_months} months
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>MATURITY AMOUNT</Typography>
                  <Typography variant="body1" fontWeight="600" sx={{ color: '#333' }}>
                    {formatCurrency(customer.packageId.maturity_amount)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: customer.packageId.is_active ? '#2E7D32' : '#D32F2F', fontWeight: 600 }}>
                    {customer.packageId.is_active ? 'ACTIVE' : 'INACTIVE'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        )}

        {/* Summary Section */}
        <Paper elevation={0} sx={{ mb: 3, border: '1px solid #e0e0e0' }}>
          <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="h6" fontWeight="600" sx={{ color: '#333' }}>
              ACCOUNT SUMMARY
            </Typography>
          </Box>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e8f5e8', bgcolor: '#f8fff8' }}>
                  <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>TOTAL DEPOSITS</Typography>
                  <Typography variant="h5" fontWeight="700" sx={{ color: '#2E7D32' }}>
                    {formatCurrency(totalDeposits)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    ({deposits.filter(d => d.status === 'approved').length} transactions)
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #ffebee', bgcolor: '#fffafa' }}>
                  <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>TOTAL WITHDRAWALS</Typography>
                  <Typography variant="h5" fontWeight="700" sx={{ color: '#D32F2F' }}>
                    {formatCurrency(totalWithdrawals)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    ({withdrawalRequests.filter(w => w.status === 'approved').length} transactions)
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #fff3e0', bgcolor: '#fffbf5' }}>
                  <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>PENDING APPROVAL</Typography>
                  <Typography variant="h5" fontWeight="700" sx={{ color: '#F57C00' }}>
                    {deposits.filter(d => d.status === 'pending').length + withdrawalRequests.filter(w => w.status === 'pending').length}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    transactions
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, border: '2px solid #1976d2', bgcolor: '#f8f9ff' }}>
                  <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>NET BALANCE</Typography>
                  <Typography variant="h5" fontWeight="700" sx={{ color: '#1976d2' }}>
                    {formatCurrency(netBalance)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    calculated balance
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* Transaction Details */}
        <Paper elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
          <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} spacing={2}>
              <Typography variant="h6" fontWeight="600" sx={{ color: '#333' }}>
                TRANSACTION HISTORY
              </Typography>
              
              <Stack direction="row" spacing={2}>
                <TextField
                  size="small"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#666' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    minWidth: 200,
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'white'
                    }
                  }}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    label="Status"
                    onChange={(e) => setFilterStatus(e.target.value)}
                    sx={{ bgcolor: 'white' }}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Stack>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'white' }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{
                px: 2,
                '& .MuiTab-root': {
                  fontWeight: 600,
                  textTransform: 'none',
                  color: '#666',
                  '&.Mui-selected': {
                    color: '#1976d2'
                  }
                }
              }}
            >
              <Tab label={`All Transactions (${deposits.length + withdrawalRequests.length})`} />
              <Tab label={`Deposits (${deposits.length})`} />
              <Tab label={`Withdrawals (${withdrawalRequests.length})`} />
            </Tabs>
          </Box>

          <TabPanel value={activeTab} index={0}>
            <Box sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2, color: '#333' }}>
                Complete Transaction History
              </Typography>
              
              {/* Combined transaction table */}
              <TableContainer sx={{ border: '1px solid #e0e0e0' }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, color: '#333', borderRight: '1px solid #e0e0e0' }}>Date & Time</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', borderRight: '1px solid #e0e0e0' }}>Transaction Type</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', borderRight: '1px solid #e0e0e0', textAlign: 'right' }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', borderRight: '1px solid #e0e0e0' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', borderRight: '1px solid #e0e0e0' }}>Processed By</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333' }}>Reference/Remarks</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* Combine and sort all transactions */}
                    {[
                      ...deposits.map(d => ({ ...d, type: 'DEPOSIT', date: d.date })),
                      ...withdrawalRequests.map(w => ({ ...w, type: 'WITHDRAWAL', date: w.date }))
                    ]
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .slice(0, 20)
                      .map((transaction, index) => (
                        <TableRow key={`${transaction.type}-${transaction._id}`} sx={{ '&:nth-of-type(even)': { bgcolor: '#fafafa' } }}>
                          <TableCell sx={{ borderRight: '1px solid #e0e0e0', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                            {formatDateTime(transaction.date)}
                          </TableCell>
                          <TableCell sx={{ borderRight: '1px solid #e0e0e0', fontWeight: 600 }}>
                            <Box sx={{ 
                              px: 1, 
                              py: 0.5, 
                              borderRadius: 1, 
                              bgcolor: transaction.type === 'DEPOSIT' ? '#e8f5e8' : '#fff3e0',
                              color: transaction.type === 'DEPOSIT' ? '#2E7D32' : '#F57C00',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              textAlign: 'center',
                              minWidth: '80px'
                            }}>
                              {transaction.type}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ borderRight: '1px solid #e0e0e0', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>
                            {formatCurrency(transaction.amount)}
                          </TableCell>
                          <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                            {getStatusChip(transaction.status)}
                          </TableCell>
                          <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                            {transaction.collectedBy?.name || transaction.handledBy?.name || 'System'}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.85rem' }}>
                            {transaction.requirements || transaction.remarks || `Transaction ID: ${transaction.referenceId}`}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <Box sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2, color: '#333' }}>
                Deposit Transaction Details
              </Typography>
              
              <TableContainer sx={{ border: '1px solid #e0e0e0' }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, color: '#333', borderRight: '1px solid #e0e0e0' }}>Transaction Date</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', borderRight: '1px solid #e0e0e0', textAlign: 'right' }}>Amount (₹)</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', borderRight: '1px solid #e0e0e0' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', borderRight: '1px solid #e0e0e0' }}>Collected By</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333' }}>Transaction ID</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredDeposits.map((deposit) => (
                      <TableRow key={deposit._id} sx={{ '&:nth-of-type(even)': { bgcolor: '#fafafa' } }}>
                        <TableCell sx={{ borderRight: '1px solid #e0e0e0', fontFamily: 'monospace' }}>
                          {formatDateTime(deposit.date)}
                        </TableCell>
                        <TableCell sx={{ borderRight: '1px solid #e0e0e0', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>
                          {formatCurrency(deposit.amount)}
                        </TableCell>
                        <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                          {getStatusChip(deposit.status)}
                        </TableCell>
                        <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                          {deposit.collectedBy?.name || 'Pending Assignment'}
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                          {deposit.referenceId? deposit.referenceId : 'Inhand Deposit'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Box sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2, color: '#333' }}>
                Withdrawal Request Details
              </Typography>
              
              <TableContainer sx={{ border: '1px solid #e0e0e0' }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, color: '#333', borderRight: '1px solid #e0e0e0' }}>Request Date</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', borderRight: '1px solid #e0e0e0', textAlign: 'right' }}>Amount (₹)</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', borderRight: '1px solid #e0e0e0' }}>Purpose</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', borderRight: '1px solid #e0e0e0' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333', borderRight: '1px solid #e0e0e0' }}>Processed By</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#333' }}>Remarks</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredWithdrawals.map((request) => (
                      <TableRow key={request._id} sx={{ '&:nth-of-type(even)': { bgcolor: '#fafafa' } }}>
                        <TableCell sx={{ borderRight: '1px solid #e0e0e0', fontFamily: 'monospace' }}>
                          {formatDateTime(request.date)}
                        </TableCell>
                        <TableCell sx={{ borderRight: '1px solid #e0e0e0', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>
                          {formatCurrency(request.amount)}
                        </TableCell>
                        <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                          {request.requirements || 'General Withdrawal'}
                        </TableCell>
                        <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                          {getStatusChip(request.status)}
                        </TableCell>
                        <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                          {request.handledBy?.name || 'Pending Review'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.85rem' }}>
                          {request.remarks || 'Under review'}
                        </TableCell>
</TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {filteredWithdrawals.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No withdrawal requests found.
                  </Typography>
                </Box>
              )}
            </Box>
          </TabPanel>
        </Paper>

        {/* Footer Section */}
        <Box sx={{ mt: 4, '@media print': { mt: 2 } }}>
          <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', bgcolor: '#f8f9fa' }}>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" fontWeight="600" sx={{ mb: 2, color: '#333' }}>
                    IMPORTANT NOTES
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      • This statement is generated electronically and does not require a signature.
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      • All amounts shown are in Indian Rupees (INR).
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      • Pending transactions are subject to approval and may take 2-3 business days to process.
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      • For any discrepancies, please contact customer service within 30 days.
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      • Interest is calculated as per the terms and conditions of your pigmy savings plan.
                    </Typography>
                  </Stack>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography variant="h6" fontWeight="600" sx={{ mb: 2, color: '#333' }}>
                    CONTACT INFORMATION
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      <strong>Customer Service:</strong> 1800-123-4567
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      <strong>Email:</strong> support@pigmybank.com
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      <strong>Website:</strong> www.pigmybank.com
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      <strong>Business Hours:</strong> Mon-Fri, 9:00 AM - 6:00 PM
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Box>

        {/* Print Footer */}
        <Box sx={{ 
          mt: 4, 
          textAlign: 'center', 
          '@media print': { 
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            right: 0,
            bgcolor: 'white',
            borderTop: '1px solid #ccc',
            p: 1
          } 
        }}>
          <Typography variant="caption" sx={{ color: '#666' }}>
            This is a computer-generated statement. No signature is required. | Generated on {moment().format('DD-MMM-YYYY HH:mm:ss')}
          </Typography>
        </Box>
      </Container>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          .MuiContainer-root {
            max-width: none !important;
            padding: 0 !important;
          }
          
          .MuiPaper-root {
            box-shadow: none !important;
            border: 1px solid #ccc !important;
          }
          
          .MuiButton-root,
          .MuiTextField-root,
          .MuiSelect-root,
          .MuiTabs-root {
            display: none !important;
          }
          
          .MuiTableCell-root {
            padding: 8px !important;
            font-size: 12px !important;
          }
          
          .MuiTypography-h4 {
            font-size: 24px !important;
          }
          
          .MuiTypography-h5 {
            font-size: 18px !important;
          }
          
          .MuiTypography-h6 {
            font-size: 16px !important;
          }
          
          .MuiBox-root {
            page-break-inside: avoid;
          }
          
          .MuiTable-root {
            page-break-inside: auto;
          }
          
          .MuiTableRow-root {
            page-break-inside: avoid;
            page-break-after: auto;
          }
        }
      `}</style>
    </Box>
  );
}
