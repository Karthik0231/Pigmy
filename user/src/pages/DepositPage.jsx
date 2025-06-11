import React, { useContext, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Stack,
  IconButton,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Payment as PaymentIcon,
  History as HistoryIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  QrCode as QrCodeIcon,
  MonetizationOn as MonetizationOnIcon,
  CalendarToday as CalendarIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
  ClearAll as ClearAllIcon,
} from '@mui/icons-material';
import { UserContext } from '../Context/Context';
import moment from 'moment';
import qr from '../assets/qr.png';

// Placeholder QR Code image
const QR_CODE_IMAGE_URL = '/path/to/your/qr_code.png';

export default function DepositPage() {
  const { 
    user, 
    fetchUserDetails, 
    recordDeposit, 
    getDepositHistory, 
    loading, 
    error, 
    success, 
    clearMessages 
  } = useContext(UserContext);

  const [depositHistory, setDepositHistory] = useState([]);
  const [depositSummary, setDepositSummary] = useState({});
  const [isOnlineModalOpen, setIsOnlineModalOpen] = useState(false);
  const [isClearDuesModalOpen, setIsClearDuesModalOpen] = useState(false);
  const [referenceId, setReferenceId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositError, setDepositError] = useState('');
  const [depositSuccess, setDepositSuccess] = useState('');
  const [clearDuesAmount, setClearDuesAmount] = useState('');
  const [clearDuesLoading, setClearDuesLoading] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [depositType, setDepositType] = useState('regular'); // 'regular' or 'dues'

  useEffect(() => {
    fetchUserDetails();
    fetchDepositHistory();

    return () => {
      clearMessages();
    };
  }, []);

  const fetchDepositHistory = async () => {
    try {
      const history = await getDepositHistory();
      if (history && history.success) {
        setDepositHistory(history.deposits || []);
        setDepositSummary(history.summary || {});
      }
    } catch (error) {
      console.error("Error fetching deposit history:", error);
    }
  };

  // Helper function to refresh all data
  const refreshAllData = async () => {
    await fetchUserDetails();
    await fetchDepositHistory();
  };

  // Fix the handleRegularDeposit function to work for regular deposits only
  const handleRegularDeposit = async () => {
    setDepositLoading(true);
    setDepositError('');
    setDepositSuccess('');

    if (!paymentMethod) {
      setDepositError('Please select a payment method.');
      setDepositLoading(false);
      return;
    }

    if (paymentMethod === 'online' && !referenceId) {
      setDepositError('Please enter the Reference ID for online payment.');
      setDepositLoading(false);
      return;
    }

    try {
      // For regular deposits, don't pass any custom amount
      const result = await recordDeposit(paymentMethod, referenceId);

      if (result.success) {
        setDepositSuccess(result.message);
        if (result.note) {
          setDepositSuccess(`${result.message} Note: ${result.note}`);
        }
        setIsOnlineModalOpen(false);
        setReferenceId('');
        setPaymentMethod('');
        
        // Refresh all data to ensure UI is updated
        await refreshAllData();
      } else {
        setDepositError(result.message || 'Failed to record deposit.');
      }
    } catch (err) {
      console.error("Deposit failed:", err);
      setDepositError('An error occurred while recording the deposit.');
    } finally {
      setDepositLoading(false);
    }
  };

  // Separate function for clearing dues
  const handleClearDues = async () => {
    setClearDuesLoading(true);
    setDepositError('');
    setDepositSuccess('');

    if (!clearDuesAmount || clearDuesAmount <= 0) {
      setDepositError('Please enter a valid amount for clearing dues.');
      setClearDuesLoading(false);
      return;
    }

    if (!paymentMethod) {
      setDepositError('Please select a payment method.');
      setClearDuesLoading(false);
      return;
    }

    if (paymentMethod === 'online' && !referenceId) {
      setDepositError('Please enter the Reference ID for online payment.');
      setClearDuesLoading(false);
      return;
    }

    try {
      // For dues clearing, pass the clearDuesAmount
      const result = await recordDeposit(paymentMethod, referenceId, clearDuesAmount);

      if (result.success) {
        setDepositSuccess(`Successfully cleared dues of ₹${clearDuesAmount}. ${result.message}`);
        setIsClearDuesModalOpen(false);
        setClearDuesAmount('');
        setReferenceId('');
        setPaymentMethod('');

        // Refresh all data to ensure UI is updated
        await refreshAllData();
      } else {
        setDepositError(result.message || 'Failed to clear dues.');
      }
    } catch (err) {
      console.error("Clear dues failed:", err);
      setDepositError('An error occurred while clearing dues.');
    } finally {
      setClearDuesLoading(false);
    }
  };

  const isDepositDue = () => {
    if (!user || !user.packageId) return false;

    const plan = user.packageId;
    const lastDepositDate = user.lastDepositDate ? new Date(user.lastDepositDate) : null;
    const now = new Date();

    if (!lastDepositDate) {
      return true;
    }

    if (plan.deposit_frequency === 'daily') {
      return lastDepositDate.toDateString() !== now.toDateString();
    } else if (plan.deposit_frequency === 'weekly') {
      const startOfWeekLastDeposit = new Date(lastDepositDate);
      startOfWeekLastDeposit.setDate(lastDepositDate.getDate() - lastDepositDate.getDay());
      startOfWeekLastDeposit.setHours(0, 0, 0, 0);

      const startOfWeekNow = new Date(now);
      startOfWeekNow.setDate(now.getDate() - now.getDay());
      startOfWeekNow.setHours(0, 0, 0, 0);

      return startOfWeekLastDeposit.getTime() !== startOfWeekNow.getTime();
    }
    return false;
  };


  // Calculate progress percentage
  const getProgressPercentage = () => {
    if (!user || !user.packageId) return 0;
    const plan = user.packageId;
    const startDate = new Date(user.startDate);
    const maturityDate = new Date(user.maturityDate);
    const now = new Date();
    
    const totalDuration = maturityDate - startDate;
    const elapsed = now - startDate;
    
    return Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
  };

  // Calculate days remaining
  const getDaysRemaining = () => {
    if (!user || !user.maturityDate) return 0;
    const maturityDate = new Date(user.maturityDate);
    const now = new Date();
    const diffTime = maturityDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(diffDays, 0);
  };

  // Fixed: Calculate expected vs actual deposits with correct date calculation
  const getDepositStats = () => {
    if (!user || !user.packageId) return { 
      expected: 0, 
      actual: 0, 
      percentage: 0, 
      daysFromStart: 0,
      missedDeposits: 0,
      totalDuesAmount: 0
    };
    
    const plan = user.packageId;
    const startDate = new Date(user.startDate);
    const now = new Date();
    
    // Calculate days from start date (inclusive of start date)
    const timeDiff = now.getTime() - startDate.getTime();
    const daysFromStart = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1; // +1 to include start date
    
    let expectedDeposits = 0;
    if (plan.deposit_frequency === 'daily') {
      expectedDeposits = daysFromStart;
    } else if (plan.deposit_frequency === 'weekly') {
      // Calculate complete weeks from start date
      const weeksFromStart = Math.floor(daysFromStart / 7);
      expectedDeposits = weeksFromStart + 1; // +1 for the first week
    }
    
    // Use fresh data from depositSummary
    const actualDeposits = Math.floor(user.balance / plan.deposit_amount);
    const missedDeposits = Math.max(expectedDeposits - actualDeposits, 0);
    const totalDuesAmount = missedDeposits * plan.deposit_amount;
    const percentage = expectedDeposits > 0 ? (actualDeposits / expectedDeposits) * 100 : 0;
    
    return { 
      expected: expectedDeposits, 
      actual: actualDeposits, 
      percentage,
      daysFromStart,
      missedDeposits,
      totalDuesAmount
    };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon fontSize="small" />;
      case 'pending':
        return <PendingIcon fontSize="small" />;
      case 'rejected':
        return <CancelIcon fontSize="small" />;
      default:
        return <InfoIcon fontSize="small" />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary">
            Loading your Pigmy Plan details...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6">Error Loading Data</Typography>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 6, textAlign: 'center' }}>
          <AccountBalanceIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Welcome to Pigmy Banking
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Please log in to view your pigmy plan details and manage your deposits.
          </Typography>
        </Paper>
      </Container>
    );
  }

  const plan = user.packageId;

  if (!plan) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 6, textAlign: 'center' }}>
          <MonetizationOnIcon sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No Pigmy Plan Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            You don't have an active pigmy plan assigned to your account.
          </Typography>
          <Button variant="contained" color="primary">
            Contact Support
          </Button>
        </Paper>
      </Container>
    );
  }

  const depositIsDue = isDepositDue();
  const progressPercentage = getProgressPercentage();
  const daysRemaining = getDaysRemaining();
  const depositStats = getDepositStats();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header Section */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white' }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            <AccountBalanceIcon sx={{ fontSize: 50 }} />
          </Grid>
          <Grid item xs>
            <Typography variant="h4" gutterBottom>
              Pigmy Banking Dashboard
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              {user.name} • Account: {user.accountNumber}
            </Typography>
          </Grid>
          <Grid item>
            <Chip 
              label={user.isClosed ? 'Account Closed' : 'Active Account'} 
              color={user.isClosed ? 'error' : 'success'}
              variant="filled"
              sx={{ color: 'white', fontWeight: 'bold' }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Quick Stats Cards */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ height: '100%',width:"250px",border:"2px solid rgb(90, 116, 142)" }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <MonetizationOnIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" color="success.main" gutterBottom>
                ₹{user.balance?.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Current Balance
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ height: '100%',width:"250px",border:"2px solid rgb(90, 116, 142)" }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" color="primary.main" gutterBottom>
                ₹{plan.maturity_amount?.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Maturity Amount
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ height: '100%',width:"250px",border:"2px solid rgb(90, 116, 142)" }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <CalendarIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" color="warning.main" gutterBottom>
                {daysRemaining}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Days Remaining
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ height: '100%',width:"250px",border:"2px solid rgb(90, 116, 142)" }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <AssessmentIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" color="info.main" gutterBottom>
                {depositStats.percentage.toFixed(0)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Deposit Progress
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dues Alert Section - Only show if there are actually missed deposits */}
      {depositStats.missedDeposits > 0 && (
        <Alert severity="warning" sx={{ mb: 4 }} icon={false}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon /> Outstanding Dues
              </Typography>
              <Typography variant="body1">
                You have {depositStats.missedDeposits} missed deposits totaling ₹{depositStats.totalDuesAmount.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Days from start: {depositStats.daysFromStart} | Expected deposits: {depositStats.expected} | Completed: {depositStats.actual}
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="warning"
              startIcon={<ClearAllIcon />}
              onClick={() => setIsClearDuesModalOpen(true)}
              sx={{ minWidth: 150,
                marginLeft: '500px'
               }}
            >
              Clear Dues
            </Button>
          </Box>
        </Alert>
      )}

      {/* Success Message for Cleared Dues */}
      {depositStats.missedDeposits === 0 && depositStats.actual > 0 && (
        <Alert severity="success" sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon />
            <Typography variant="h6" fontWeight="bold">
              All Dues Cleared!
            </Typography>
          </Box>
          <Typography variant="body1">
            Great job! You're up to date with all your deposits. 
            Expected: {depositStats.expected} | Completed: {depositStats.actual}
          </Typography>
        </Alert>
      )}

      {/* Plan Progress Section */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScheduleIcon /> Plan Progress
        </Typography>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Overall Progress</Typography>
            <Typography variant="body2">{progressPercentage.toFixed(1)}%</Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={progressPercentage} 
            sx={{ height: 10, borderRadius: 5 }}
          />
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Expected vs Actual Deposits</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Deposit Compliance</Typography>
              <Typography variant="body2">{depositStats.percentage.toFixed(1)}%</Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={Math.min(depositStats.percentage, 100)} 
              color={depositStats.percentage >= 90 ? 'success' : depositStats.percentage >= 70 ? 'warning' : 'error'}
              sx={{ height: 8, borderRadius: 4, mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary">
              Expected: {depositStats.expected} | Actual: {depositStats.actual} | Missed: {depositStats.missedDeposits}

            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Key Dates</Typography>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Plan Started:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {moment(user.startDate).format('DD MMM YYYY')}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Maturity Date:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {user.maturityDate ? moment(user.maturityDate).format('DD MMM YYYY') : 'N/A'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Last Deposit:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {user.lastDepositDate ? moment(user.lastDepositDate).format('DD MMM YYYY') : 'No deposits yet'}
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Plan Details and Account Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PaymentIcon /> Plan Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Plan Name</Typography>
                  <Typography variant="body1" fontWeight="bold">{plan.plan_name}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Deposit Amount</Typography>
                  <Typography variant="body1" fontWeight="bold">₹{plan.deposit_amount}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Frequency</Typography>
                  <Typography variant="body1" fontWeight="bold" sx={{ textTransform: 'capitalize' }}>
                    {plan.deposit_frequency}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Duration</Typography>
                  <Typography variant="body1" fontWeight="bold">{plan.duration_months} months</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Interest Rate</Typography>
                  <Typography variant="body1" fontWeight="bold" color="success.main">
                    {plan.interest_rate}% per annum
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Total Return</Typography>
                  <Typography variant="body1" fontWeight="bold" color="primary.main">
                    ₹{(plan.maturity_amount - (plan.deposit_amount * plan.duration_months * (plan.deposit_frequency === 'daily' ? 30 : plan.deposit_frequency === 'weekly' ? 4 : 1))).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssessmentIcon /> Deposit Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2">Total Deposits</Typography>
                    <Chip label={depositSummary.total || 0} color="primary" />
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Badge badgeContent={depositSummary.approved || 0} color="success">
                      <CheckCircleIcon color="success" sx={{ fontSize: 30 }} />
                    </Badge>
                    <Typography variant="body2" sx={{ mt: 1 }}>Approved</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Badge badgeContent={depositSummary.pending || 0} color="warning">
                      <PendingIcon color="warning" sx={{ fontSize: 30 }} />
                    </Badge>
                    <Typography variant="body2" sx={{ mt: 1 }}>Pending</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Badge badgeContent={depositSummary.rejected || 0} color="error">
                      <CancelIcon color="error" sx={{ fontSize: 30 }} />
                    </Badge>
                    <Typography variant="body2" sx={{ mt: 1 }}>Rejected</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Deposit Action Section */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PaymentIcon /> Make a Deposit
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {depositError && <Alert severity="error" sx={{ mb: 2 }}>{depositError}</Alert>}
        {depositSuccess && <Alert severity="success" sx={{ mb: 2 }}>{depositSuccess}</Alert>}

        {depositIsDue ? (
          <Box>
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body1" fontWeight="bold">
                Deposit Due: ₹{plan.deposit_amount} for the current {plan.deposit_frequency} period
              </Typography>
              <Typography variant="body2">
                Complete your deposit to maintain your pigmy plan schedule.
              </Typography>
            </Alert>

            <FormControl fullWidth sx={{ mb: 3, maxWidth: 400 }}>
              <InputLabel>Select Payment Method</InputLabel>
              <Select
                value={paymentMethod}
                label="Select Payment Method"
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <MenuItem value="">Choose Method</MenuItem>
                <MenuItem value="in_hand">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MonetizationOnIcon fontSize="small" />
                    In-Hand Payment (Requires Approval)
                  </Box>
                </MenuItem>
                <MenuItem value="online">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <QrCodeIcon fontSize="small" />
                    Online Payment (Instant)
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2 }}>
              {paymentMethod === 'online' && (
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<QrCodeIcon />}
                  onClick={() => setIsOnlineModalOpen(true)}
                  disabled={depositLoading}
                >
                  Pay Online (₹{plan.deposit_amount})
                </Button>
              )}

              {paymentMethod === 'in_hand' && (
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  startIcon={<MonetizationOnIcon />}
                  onClick={handleRegularDeposit}
                  disabled={depositLoading}
                >
                  {depositLoading ? <CircularProgress size={24} /> : 'Submit for Approval'}
                </Button>
              )}
            </Box>
          </Box>
        ) : (
          <Alert severity="success" icon={<CheckCircleIcon />}>
            <Typography variant="body1" fontWeight="bold">
              Deposit Complete
            </Typography>
            <Typography variant="body2">
              Your deposit for the current {plan.deposit_frequency} period has been successfully made. 
              Next deposit will be due on your next {plan.deposit_frequency} cycle.
            </Typography>
          </Alert>
        )}
      </Paper>

      {/* Enhanced Deposit History */}
      <Paper elevation={3} sx={{ p: 4 }}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <HistoryIcon /> Deposit History
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {depositHistory.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'grey.50' }}>
                      <TableCell><strong>Date & Time</strong></TableCell>
                      <TableCell><strong>Amount</strong></TableCell>
                      <TableCell><strong>Method</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Reference ID</strong></TableCell>
                      <TableCell><strong>Approved By</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                        {depositHistory.map((deposit, index) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {moment(deposit.created_at).format('DD MMM YYYY')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {moment(deposit.created_at).format('hh:mm A')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1" fontWeight="bold" color="primary.main">
                            ₹{deposit.amount?.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
<Chip
                                label={deposit.paymentMethod === 'in_hand' ? 'In Hand' : 'Online'}
                                variant="outlined"
                                size="small"
                                color={deposit.paymentMethod === 'in_hand' ? 'secondary' : 'info'}
                              />
                        </TableCell>
<TableCell>
  <div>
    <Chip 
      icon={getStatusIcon(deposit.status)}
      label={deposit.status?.charAt(0).toUpperCase() + deposit.status?.slice(1)}
      color={getStatusColor(deposit.status)}
      size="small"
    />
    
    {deposit.status === 'rejected' && deposit.rejectedReason && (
      <Typography
        variant="caption"
        color="error"
        sx={{ mt: 0.5, display: 'block' }}
      >
        Reason: {deposit.rejectedReason}
      </Typography>
    )}
  </div>
</TableCell>

                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {deposit.referenceId || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {deposit.collectorId.name || 'Pending'}
                          </Typography>
                          {deposit.approvedAt && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              {moment(deposit.approvedAt).format('DD MMM YYYY, hh:mm A')}
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <HistoryIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No Deposit History
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Start making deposits to see your transaction history here.
                </Typography>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      </Paper>

      {/* Online Payment Modal */}
      <Dialog open={isOnlineModalOpen} onClose={() => setIsOnlineModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center' }}>
          <QrCodeIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
          <Typography variant="h5">Online Payment</Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h4" color="primary.main" gutterBottom>
              ₹{plan.deposit_amount}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Scan the QR code below to make payment
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <img 
              src={qr} 
              alt="QR Code for Payment" 
              style={{ 
                width: '200px', 
                height: '200px', 
                border: '2px solid #e0e0e0',
                borderRadius: '8px'
              }} 
            />
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              After completing the payment, please enter the transaction reference ID below for verification.
            </Typography>
          </Alert>

          <TextField
            fullWidth
            label="Transaction Reference ID"
            value={referenceId}
            onChange={(e) => setReferenceId(e.target.value)}
            placeholder="Enter the reference ID from your payment app"
            variant="outlined"
            required
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
          <Button onClick={() => setIsOnlineModalOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleRegularDeposit}
            variant="contained"
            color="primary"
            disabled={depositLoading || !referenceId}
            startIcon={depositLoading ? <CircularProgress size={20} /> : <PaymentIcon />}
          >
            {depositLoading ? 'Processing...' : 'Confirm Payment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clear Dues Modal */}
      <Dialog open={isClearDuesModalOpen} onClose={() => setIsClearDuesModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center' }}>
          <ClearAllIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
          <Typography variant="h5">Clear Outstanding Dues</Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body1" fontWeight="bold">
                Outstanding Amount: ₹{depositStats.totalDuesAmount.toLocaleString()}
              </Typography>
              <Typography variant="body2">
                You have {depositStats.missedDeposits} missed deposits of ₹{plan.deposit_amount} each.
              </Typography>
            </Alert>

            <TextField
              fullWidth
              label="Amount to Clear"
              type="number"
              value={clearDuesAmount}
              onChange={(e) => setClearDuesAmount(e.target.value)}
              placeholder={`Enter amount (Max: ₹${depositStats.totalDuesAmount})`}
              variant="outlined"
              sx={{ mb: 3 }}
              inputProps={{ 
                min: 1, 
                max: depositStats.totalDuesAmount,
                step: plan.deposit_amount 
              }}
              helperText="Enter the amount you want to clear from your outstanding dues."
            />

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={paymentMethod}
                label="Payment Method"
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <MenuItem value="">Choose Method</MenuItem>
                <MenuItem value="in_hand">In-Hand Payment</MenuItem>
                <MenuItem value="online">Online Payment</MenuItem>
              </Select>
            </FormControl>

            {paymentMethod === 'online' && (
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <img 
                  src={qr} 
                  alt="QR Code for Payment" 
                  style={{ 
                    width: '150px', 
                    height: '150px', 
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    marginBottom: '16px'
                  }} 
                />
                <TextField
                  fullWidth
                  label="Transaction Reference ID"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  placeholder="Enter reference ID after payment"
                  variant="outlined"
                  helperText="Enter the reference ID from your payment app (12 characters)"
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
          <Button onClick={() => setIsClearDuesModalOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleClearDues}
            variant="contained"
            color="warning"
disabled={
  clearDuesLoading ||
  !clearDuesAmount ||
  clearDuesAmount < 1 ||
  clearDuesAmount > depositStats.totalDuesAmount ||
  !paymentMethod ||
  (paymentMethod === 'online' && (!referenceId || referenceId.length !== 12))
}
            startIcon={clearDuesLoading ? <CircularProgress size={20} /> : <ClearAllIcon />}
          >
            {clearDuesLoading ? 'Processing...' : 'Clear Dues'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}