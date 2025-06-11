import React, { useContext, useEffect } from 'react';
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
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
} from '@mui/icons-material';
import { AdminContext } from '../Context/Context';
import moment from 'moment';

const HeaderContainer = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
}));

const SectionCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  marginBottom: theme.spacing(3),
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
}));

const ReportsPage = () => {
  const { reportData, reportLoading, reportError, fetchComprehensiveReport } = useContext(AdminContext);

  useEffect(() => {
    // Fetch report data when the component mounts
    fetchComprehensiveReport();
  }, []); // Empty dependency array means this runs once on mount

  if (reportLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 3, textAlign: 'center' }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
          Generating report...
        </Typography>
      </Container>
    );
  }

  if (reportError) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Alert severity="error">
          <Typography variant="h6">Error Loading Report</Typography>
          {reportError}
        </Alert>
      </Container>
    );
  }

  if (!reportData) {
     return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
         <Alert severity="info">
          <Typography variant="h6">No Report Data Available</Typography>
          Could not load report data.
        </Alert>
      </Container>
    );
  }

  const { customers, collectors, pigmyPlans, deposits, withdrawalRequests, feedbackList } = reportData;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <HeaderContainer>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ReportIcon sx={{ fontSize: 56, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" fontWeight="700" color="primary.main">
              Comprehensive Report
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Overview of all system data
            </Typography>
          </Box>
        </Box>
      </HeaderContainer>

      {/* Summary Cards (Optional - can add counts here) */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
              <SectionCard>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CustomersIcon color="primary" sx={{ fontSize: 40 }} />
                      <Box>
                          <Typography variant="h6" color="text.secondary">Customers</Typography>
                          <Typography variant="h4" fontWeight="bold">{customers.length}</Typography>
                      </Box>
                  </CardContent>
              </SectionCard>
          </Grid>
           <Grid item xs={12} sm={6} md={3}>
              <SectionCard>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CollectorsIcon color="secondary" sx={{ fontSize: 40 }} />
                      <Box>
                          <Typography variant="h6" color="text.secondary">Collectors</Typography>
                          <Typography variant="h4" fontWeight="bold">{collectors.length}</Typography>
                      </Box>
                  </CardContent>
              </SectionCard>
          </Grid>
           <Grid item xs={12} sm={6} md={3}>
              <SectionCard>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <DepositsIcon color="success" sx={{ fontSize: 40 }} />
                      <Box>
                          <Typography variant="h6" color="text.secondary">Deposits</Typography>
                          <Typography variant="h4" fontWeight="bold">{deposits.length}</Typography>
                      </Box>
                  </CardContent>
              </SectionCard>
          </Grid>
           <Grid item xs={12} sm={6} md={3}>
              <SectionCard>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <WithdrawalsIcon color="error" sx={{ fontSize: 40 }} />
                      <Box>
                          <Typography variant="h6" color="text.secondary">Withdrawals</Typography>
                          <Typography variant="h4" fontWeight="bold">{withdrawalRequests.length}</Typography>
                      </Box>
                  </CardContent>
              </SectionCard>
          </Grid>
      </Grid>


      {/* Customers Section */}
      <SectionCard>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <CustomersIcon color="primary" />
            <Typography variant="h5" fontWeight="600">Customers ({customers.length})</Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          {customers.length > 0 ? (
            <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 400 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Account Number</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Pigmy Plan</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Joined</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer._id}>
                      <TableCell>{customer.name}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.accountNumber}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>{customer.packageId ? customer.packageId.plan_name : 'N/A'}</TableCell>
                      <TableCell>{customer.status}</TableCell>
                      <TableCell>{moment(customer.createdAt).format('YYYY-MM-DD')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="text.secondary">No customer data available.</Typography>
          )}
        </CardContent>
      </SectionCard>

      {/* Collectors Section */}
      <SectionCard>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <CollectorsIcon color="secondary" />
            <Typography variant="h5" fontWeight="600">Collectors ({collectors.length})</Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
           {collectors.length > 0 ? (
            <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 400 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created At</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {collectors.map((collector) => (
                    <TableRow key={collector._id}>
                      <TableCell>{collector.name}</TableCell>
                      <TableCell>{collector.email}</TableCell>
                      <TableCell>{collector.phone}</TableCell>
                      <TableCell>{collector.status}</TableCell>
                      <TableCell>{moment(collector.createdAt).format('YYYY-MM-DD')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="text.secondary">No collector data available.</Typography>
          )}
        </CardContent>
      </SectionCard>

       {/* Pigmy Plans Section */}
      <SectionCard>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <PigmyIcon color="info" />
            <Typography variant="h5" fontWeight="600">Pigmy Plans ({pigmyPlans.length})</Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
           {pigmyPlans.length > 0 ? (
            <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 400 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Plan Name</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Amount Per frequency</TableCell>
                    <TableCell>Maturity Amount</TableCell>
                    <TableCell>Created At</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pigmyPlans.map((plan) => (
                    <TableRow key={plan._id}>
                      <TableCell>{plan.plan_name}</TableCell>
                      <TableCell>{plan.deposit_frequency}</TableCell>
                      <TableCell>₹{plan.deposit_amount} / {plan.deposit_frequency}</TableCell>
                      <TableCell>₹{plan.maturity_amount}</TableCell>
                      <TableCell>{moment(plan.createdAt).format('YYYY-MM-DD')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="text.secondary">No pigmy plan data available.</Typography>
          )}
        </CardContent>
      </SectionCard>

      {/* Deposits Section */}
      <SectionCard>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <DepositsIcon color="success" />
            <Typography variant="h5" fontWeight="600">Deposits ({deposits.length})</Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
           {deposits.length > 0 ? (
            <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 400 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Customer</TableCell>
                    <TableCell>Collector</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {deposits.map((deposit) => (
                    <TableRow key={deposit._id}>
                      <TableCell>{deposit.customerId ? `${deposit.customerId.name} (${deposit.customerId.accountNumber})` : 'N/A'}</TableCell>
                      <TableCell>{deposit.collectorId ? deposit.collectorId.name : 'N/A'}</TableCell>
                      <TableCell>₹{deposit.amount}</TableCell>
                      <TableCell>{moment(deposit.createdAt).format('YYYY-MM-DD HH:mm')}</TableCell>
                      <TableCell>{deposit.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="text.secondary">No deposit data available.</Typography>
          )}
        </CardContent>
      </SectionCard>

      {/* Withdrawal Requests Section */}
      <SectionCard>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <WithdrawalsIcon color="error" />
            <Typography variant="h5" fontWeight="600">Withdrawal Requests ({withdrawalRequests.length})</Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
           {withdrawalRequests.length > 0 ? (
            <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 400 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Customer</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Request Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Reason</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {withdrawalRequests.map((request) => (
                    <TableRow key={request._id}>
                      <TableCell>{request.customerId ? `${request.customerId.name} (${request.customerId.accountNumber})` : 'N/A'}</TableCell>
                      <TableCell>₹{request.amount}</TableCell>
                      <TableCell>{moment(request.date).format('YYYY-MM-DD HH:mm')}</TableCell>
                      <TableCell>{request.status}</TableCell>
                      <TableCell>{request.rejectionReason || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="text.secondary">No withdrawal request data available.</Typography>
          )}
        </CardContent>
      </SectionCard>

      {/* Feedback Section */}
      <SectionCard>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FeedbackIcon color="warning" />
            <Typography variant="h5" fontWeight="600">Feedback ({feedbackList.length})</Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
           {feedbackList.length > 0 ? (
            <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 400 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Source</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Rating</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {feedbackList.map((feedback) => (
                    <TableRow key={feedback._id}>
                      <TableCell>{feedback.source} ({feedback.sourceId?.name || 'N/A'})</TableCell>
                      <TableCell>{feedback.subject}</TableCell>
                      <TableCell>{feedback.type}</TableCell>
                      <TableCell>{feedback.rating || 'N/A'}</TableCell>
                      <TableCell>{feedback.status}</TableCell>
                      <TableCell>{moment(feedback.createdAt).format('YYYY-MM-DD HH:mm')}</TableCell>
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

    </Container>
  );
};

export default ReportsPage;