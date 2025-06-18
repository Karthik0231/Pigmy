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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Assessment as ReportIcon,
  People as CustomersIcon,
  TrendingUp as DepositsIcon,
  TrendingDown as WithdrawalsIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { CollectorContext } from '../Context/Context';
import moment from 'moment';

// Styled Components (can be simplified compared to admin if needed)
const HeaderContainer = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)', // Lighter gradient for collector
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
  color: theme.palette.text.primary,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23000000" fill-opacity="0.03"%3E%3Ccircle cx="3" cy="3" r="3"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
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


const ReportsPage = () => {
  const {
    loading, // Use loading from context
    error, // Use error from context
    fetchAssignedCustomers, // Assuming context has these fetch functions
    fetchAssignedCustomerDeposits,
    fetchAssignedCustomerWithdrawalRequests,
    assignedCustomers,
    deposits,
    withdrawalRequests,
  } = useContext(CollectorContext);

  // State for local filtering if needed, but starting simple
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [filteredDeposits, setFilteredDeposits] = useState([]);
  const [filteredWithdrawals, setFilteredWithdrawals] = useState([]);

  useEffect(() => {
    // Fetch data when the component mounts
      fetchAssignedCustomers(); // Assuming fetch functions take collector ID
      fetchAssignedCustomerDeposits();
      fetchAssignedCustomerWithdrawalRequests();
    // Removed collector from dependency array as it's not used
  }, []);

  useEffect(() => {
      // Update filtered data when context data changes
      setFilteredCustomers(assignedCustomers || []);
      setFilteredDeposits(deposits || []);
      setFilteredWithdrawals(withdrawalRequests || []);
  }, []);


  // Calculate collector-specific metrics
  const calculateCollectorMetrics = () => {
    const totalDepositsCollected = (deposits || []).reduce((sum, deposit) => sum + (deposit.amount || 0), 0);
    const totalWithdrawalsProcessed = (withdrawalRequests || []).filter(req => req.status === 'approved').reduce((sum, req) => sum + (req.amount || 0), 0);
    const pendingWithdrawals = (withdrawalRequests || []).filter(req => req.status === 'pending').length;

    return {
      assignedCustomersCount: (assignedCustomers || []).length,
      totalDepositsCollected,
      totalWithdrawalsProcessed,
      pendingWithdrawals,
    };
  };

  const metrics = calculateCollectorMetrics();

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <CircularProgress size={80} thickness={4} />
          <Typography variant="h5" color="text.secondary" fontWeight={500}>
            Loading collector report...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ borderRadius: '12px', fontSize: '16px' }}>
          <Typography variant="h6" gutterBottom>Error Loading Report</Typography>
          {error}
        </Alert>
      </Container>
    );
  }

      //  return (
      //   <Container maxWidth="xl" sx={{ py: 4 }}>
      //      <Alert severity="info" sx={{ borderRadius: '12px', fontSize: '16px' }}>
      //       <Typography variant="h6" gutterBottom>Collector Data Not Available</Typography>
      //       Please ensure you are logged in as a collector.
      //     </Alert>
      //   </Container>
      // );

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <HeaderContainer>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(255,255,255,0.2)' }}>
              <ReportIcon sx={{ fontSize: 36 }} />
            </Avatar>
            <Box>
              <Typography variant="h3" fontWeight="700" gutterBottom>
                Collector Report
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Overview of your assigned customers and activities
              </Typography>
            </Box>
          </Box>
          {/* Add refresh/export buttons if needed */}
        </Box>
      </HeaderContainer>

      {/* Collector Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#e3f2fd', color: '#1976d2', width: 56, height: 56 }}>
                  <CustomersIcon sx={{ fontSize: 28 }} />
                </Avatar>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {metrics.assignedCustomersCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Assigned Customers
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </MetricCard>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <MetricCard>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#e8f5e8', color: '#2e7d32', width: 56, height: 56 }}>
                  <MoneyIcon sx={{ fontSize: 28 }} />
                </Avatar>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    ₹{metrics.totalDepositsCollected.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Deposits Collected
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </MetricCard>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <MetricCard>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#fff3e0', color: '#ef6c00', width: 56, height: 56 }}>
                  <HistoryIcon sx={{ fontSize: 28 }} />
                </Avatar>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {metrics.pendingWithdrawals}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Withdrawals
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </MetricCard>
        </Grid>
      </Grid>

      {/* Assigned Customers Section */}
      <SectionCard>
        <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
              <Typography variant="h5" fontWeight="600" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CustomersIcon color="primary" />
                Assigned Customers ({filteredCustomers.length})
              </Typography>
            </Box>
          {filteredCustomers.length > 0 ? (
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>Contact</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>Account Number</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCustomers.map((customer) => (
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
                        <StatusChip
                          label={customer.status}
                          status={customer.status}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <CardContent><Typography variant="body2" color="text.secondary">No assigned customer data available.</Typography></CardContent>
          )}
        </CardContent>
      </SectionCard>

      {/* Recent Deposits Section */}
      <SectionCard>
        <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
              <Typography variant="h5" fontWeight="600" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DepositsIcon color="success" />
                Recent Deposits Collected ({filteredDeposits.length})
              </Typography>
            </Box>
          {filteredDeposits.length > 0 ? (
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Sort deposits by date descending */}
                  {filteredDeposits.sort((a, b) => moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf()).map((deposit) => (
                    <TableRow key={deposit._id} hover>
                      <TableCell>{deposit.customerId ? `${deposit.customerId.name} (${deposit.customerId.accountNumber})` : 'N/A'}</TableCell>
                      <TableCell>₹{deposit.amount}</TableCell>
                      <TableCell>
                         <Typography variant="body2">
                          {moment(deposit.createdAt).format('MMM DD, YYYY')}
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
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
             <CardContent><Typography variant="body2" color="text.secondary">No deposit data available.</Typography></CardContent>
          )}
        </CardContent>
      </SectionCard>

      {/* Recent Withdrawal Requests Section */}
      <SectionCard>
        <CardContent sx={{ p: 0 }}>
             <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
              <Typography variant="h5" fontWeight="600" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WithdrawalsIcon color="error" />
                Recent Withdrawal Requests ({filteredWithdrawals.length})
              </Typography>
            </Box>
          {filteredWithdrawals.length > 0 ? (
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>Request Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: '#f8f9fa' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                   {/* Sort withdrawals by date descending */}
                  {filteredWithdrawals.sort((a, b) => moment(b.requestDate).valueOf() - moment(a.requestDate).valueOf()).map((request) => (
                    <TableRow key={request._id} hover>
                      <TableCell>{request.customerId ? `${request.customerId.name} (${request.customerId.accountNumber})` : 'N/A'}</TableCell>
                      <TableCell>₹{request.amount}</TableCell>
                       <TableCell>
                         <Typography variant="body2">
                          {moment(request.requestDate).format('MMM DD, YYYY')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {moment(request.requestDate).fromNow()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                         <StatusChip
                          label={request.status}
                          status={request.status}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
             <CardContent><Typography variant="body2" color="text.secondary">No withdrawal request data available.</Typography></CardContent>
          )}
        </CardContent>
      </SectionCard>

    </Container>
  );
};

export default ReportsPage;