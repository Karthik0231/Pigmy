import React, { useContext, useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  Grid,
  Card,
  CardContent,
  InputAdornment,
  Fade,
  Slide,
  useTheme,
  alpha
} from '@mui/material';
import { UserContext } from '../Context/Context';
import moment from 'moment';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import HistoryIcon from '@mui/icons-material/History';
import SendIcon from '@mui/icons-material/Send';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

export default function WithdrawalRequestPage() {
  const theme = useTheme();
  const { user, loading, error, createWithdrawalRequest, getWithdrawalHistory, withdrawalHistory } = useContext(UserContext);

  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [requirements, setRequirements] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [requestSuccess, setRequestSuccess] = useState('');

useEffect(() => {
  if (user && !loading) {
    getWithdrawalHistory();
    console.log(user);
  }
}, [user, loading, getWithdrawalHistory]);

  const handleRequestWithdrawal = async () => {
    setRequestLoading(true);
    setRequestError('');
    setRequestSuccess('');

    const amount =withdrawalAmount;

    if (isNaN(amount) || amount <= 0) {
      setRequestError('Please enter a valid positive amount.');
      setRequestLoading(false);
      return;
    }

    if (!user || amount > user.balance) {
      setRequestError('Requested amount exceeds your current balance.');
      setRequestLoading(false);
      return;
    }

    const result = await createWithdrawalRequest(amount, requirements);

    if (result.success) {
      setRequestSuccess(result.message);
      setWithdrawalAmount('');
      setRequirements('');
      // Refresh user data to show updated history
      getWithdrawalHistory();
    } else {
      setRequestError(result.message);
    }

    setRequestLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const formatAmount = (amount) => {
    if (typeof amount === 'number' && !isNaN(amount)) {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
    return '₹0';
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`
        }}
      >
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <CircularProgress size={50} sx={{ mb: 2 }} />
          <Typography variant="h6" color="textSecondary">Loading user data...</Typography>
        </Paper>
      </Box>
    );
  }

  if (error || !user) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${theme.palette.error.light} 0%, ${theme.palette.error.main} 100%)`
        }}
      >
        <Container maxWidth="sm">
          <Alert severity="error" sx={{ borderRadius: 2, fontSize: '1.1rem' }}>
            {error || "Could not load user data. Please try logging in again."}
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.secondary.light, 0.1)} 100%)`,
        py: 4
      }}
    >
      <Container maxWidth="lg" sx={{ height: '100%' }}>
        <Fade in timeout={800}>
          <Box>
            {/* Header Section */}
            <Paper 
              elevation={4} 
              sx={{ 
                p: 4, 
                mb: 4, 
                borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: 'white'
              }}
            >
              <Grid container alignItems="center" spacing={2}>
                <Grid item>
                  <AccountBalanceWalletIcon sx={{ fontSize: 48 }} />
                </Grid>
                <Grid item xs>
                  <Typography variant="h3" fontWeight="bold" gutterBottom>
                    Withdrawal Center
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Manage your withdrawals and track your financial activities
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            <Grid container spacing={4}>
              {/* Balance Cards */}
              <Grid item xs={12}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Slide direction="right" in timeout={600}>
                      <Card 
                        elevation={3} 
                        sx={{ 
                          borderRadius: 3,
                          background: `linear-gradient(135deg, ${theme.palette.success.light} 0%, ${theme.palette.success.main} 100%)`,
                          color: 'white'
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box display="flex" alignItems="center" gap={2}>
                            <AccountBalanceIcon sx={{ fontSize: 40 }} />
                            <Box>
                              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                                Available Balance
                              </Typography>
                              <Typography variant="h4" fontWeight="bold">
                                {formatAmount(user.balance)}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Slide>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Slide direction="left" in timeout={800}>
                      <Card 
                        elevation={3} 
                        sx={{ 
                          borderRadius: 3,
                          background: `linear-gradient(135deg, ${theme.palette.info.light} 0%, ${theme.palette.info.main} 100%)`,
                          color: 'white'
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box display="flex" alignItems="center" gap={2}>
                            <TrendingUpIcon sx={{ fontSize: 40 }} />
                            <Box>
                              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                                Total Requests
                              </Typography>
                              <Typography variant="h4" fontWeight="bold">
                                {user.withdrawalRequests?.length || 0}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Slide>
                  </Grid>
                </Grid>
              </Grid>

              {/* Withdrawal Request Form */}
              <Grid item xs={12} md={5}>
                <Fade in timeout={1000}>
                  <Paper elevation={4} sx={{ p: 4, borderRadius: 3, height: 'fit-content' }}>
                    <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                      <SendIcon color="primary" />
                      New Withdrawal Request
                    </Typography>

                    {requestError && (
                      <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                        {requestError}
                      </Alert>
                    )}
                    
                    {requestSuccess && (
                      <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                        {requestSuccess}
                      </Alert>
                    )}

                    <Box component="form" noValidate>
                      <TextField
                        fullWidth
                        label="Withdrawal Amount"
                        type="number"
                        value={withdrawalAmount}
                        onChange={(e) => setWithdrawalAmount(e.target.value)}
                        placeholder="Enter amount"
                        variant="outlined"
                        sx={{ mb: 3 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CurrencyRupeeIcon />
                            </InputAdornment>
                          ),
                        }}
                        helperText={`Maximum available: ${formatAmount(user.balance)}`}
                        inputProps={{
                          min: 1,
                          max: user.balance,
                          step: 1
                        }}
                      />

                      <TextField
                        fullWidth
                        label="Special Requirements"
                        value={requirements}
                        onChange={(e) => setRequirements(e.target.value)}
                        placeholder="Optional: Preferred method, timing, etc."
                        variant="outlined"
                        multiline
                        rows={4}
                        sx={{ mb: 3 }}
                      />

                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={handleRequestWithdrawal}
                        disabled={
                          requestLoading || 
                          isNaN(parseFloat(withdrawalAmount)) || 
                          parseFloat(withdrawalAmount) <= 0 || 
                          parseFloat(withdrawalAmount) > user.balance
                        }
                        startIcon={requestLoading ? <CircularProgress size={20} /> : <SendIcon />}
                        sx={{ 
                          py: 1.5,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontSize: '1.1rem'
                        }}
                      >
                        {requestLoading ? 'Processing Request...' : 'Submit Withdrawal Request'}
                      </Button>
                    </Box>
                  </Paper>
                </Fade>
              </Grid>

              {/* Withdrawal History */}
              <Grid item xs={12} md={7}>
                <Fade in timeout={1200}>
                  <Paper elevation={4} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                    <Box sx={{ p: 3, background: alpha(theme.palette.primary.main, 0.05) }}>
                      <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <HistoryIcon color="primary" />
                        Withdrawal History
                      </Typography>
                    </Box>

                    {user.withdrawalRequests && user.withdrawalRequests.length > 0 ? (
                      <TableContainer sx={{ maxHeight: 500 }}>
                        <Table stickyHeader>
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 'bold', background: alpha(theme.palette.primary.main, 0.1) }}>
                                Date & Time
                              </TableCell>
                              <TableCell sx={{ fontWeight: 'bold', background: alpha(theme.palette.primary.main, 0.1) }}>
                                Amount
                              </TableCell>
                              <TableCell sx={{ fontWeight: 'bold', background: alpha(theme.palette.primary.main, 0.1) }}>
                                Handled By
                              </TableCell>
                              <TableCell sx={{ fontWeight: 'bold', background: alpha(theme.palette.primary.main, 0.1) }}>
                                Status
                              </TableCell>
                              <TableCell sx={{ fontWeight: 'bold', background: alpha(theme.palette.primary.main, 0.1) }}>
                                Remarks
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {withdrawalHistory.map((request, index) => (
                              <TableRow 
                                key={index} 
                                hover 
                                sx={{ 
                                  '&:hover': { 
                                    backgroundColor: alpha(theme.palette.primary.main, 0.02) 
                                  } 
                                }}
                              >
                                <TableCell>
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                    <Box>
                                      <Typography variant="body2" fontWeight="medium">
                                        {moment(request.date).format('DD MMM YYYY')}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {moment(request.date).format('hh:mm A')}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body1" fontWeight="bold" color="primary">
                                    {formatAmount(request.amount)}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" color="text.secondary">
                                    {request.handledBy ? request.handledBy.name : 'Pending'}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={request.status ? request.status.charAt(0).toUpperCase() + request.status.slice(1) : 'Pending'}
                                    color={getStatusColor(request.status)}
                                    size="small"
                                    sx={{ fontWeight: 'medium' }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" color="text.secondary">
                                    {request.remarks || 'No remarks'}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 8 }}>
                        <HistoryIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No Withdrawal History
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Your withdrawal requests will appear here once you submit them.
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Fade>
              </Grid>
            </Grid>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}