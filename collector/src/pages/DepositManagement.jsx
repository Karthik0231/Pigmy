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
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Chip,
  Container,
  Divider,
  useTheme,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Grid,
  Badge,
  Stack,
  Avatar,
  InputAdornment,
  Fab,
  Zoom,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { tableCellClasses } from '@mui/material/TableCell';
import {
  CheckCircleOutline as ApproveIcon,
  CancelOutlined as RejectIcon,
  DeleteOutline as DeleteIcon,
  VisibilityOutlined as ViewIcon,
  History as HistoryIcon,
  MonetizationOn as MonetizationOnIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  AccountBalance as AccountIcon,
  InfoOutlined as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  AccountCircle as AccountCircleIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { CollectorContext } from '../Context/Context';
import moment from 'moment';

// Enhanced styled components
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    color: theme.palette.common.white,
    fontWeight: 'bold',
    fontSize: '0.95rem',
    padding: '16px 12px',
    textShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    padding: '12px',
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
    transform: 'translateY(-1px)',
    transition: 'all 0.2s ease-in-out',
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const CustomerCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease-in-out',
  width: '100%',
  '&:hover': {
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
    transform: 'translateY(-2px)',
  },
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 12,
  background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
  color: 'white',
  textAlign: 'center',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
  borderRadius: 16,
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  border: `1px solid ${theme.palette.divider}`,
}));

export default function DepositManagement() {
  const {
    deposits,
    loading,
    error,
    success,
    fetchAssignedCustomerDeposits,
    approveDeposit,
    rejectDeposit,
    deleteDeposit,
    clearMessages,
  } = useContext(CollectorContext);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [openRejectModal, setOpenRejectModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCustomer, setExpandedCustomer] = useState(null);

  useEffect(() => {
    fetchAssignedCustomerDeposits();
    return () => {
      clearMessages();
    };
  }, []);

  // Group deposits by customer
  const groupedDeposits = deposits.reduce((acc, deposit) => {
    const customerId = deposit.customerId?._id || 'unknown';
    const customerName = deposit.customerId?.name || 'Unknown Customer';
    const accountNumber = deposit.customerId?.accountNumber || 'N/A';
    
    if (!acc[customerId]) {
      acc[customerId] = {
        customer: { name: customerName, accountNumber },
        deposits: [],
        totalAmount: 0,
        pendingCount: 0,
        approvedCount: 0,
        rejectedCount: 0,
      };
    }
    
    acc[customerId].deposits.push(deposit);

    // {{ edit_1 }}
    // Only add to totalAmount if the deposit is approved
    if (deposit.status === 'approved') {
      acc[customerId].totalAmount += deposit.amount;
    }
    
    switch (deposit.status) {
      case 'pending':
        acc[customerId].pendingCount++;
        break;
      case 'approved':
        acc[customerId].approvedCount++;
        break;
      case 'rejected':
        acc[customerId].rejectedCount++;
        break;
    }
    
    return acc;
  }, {});

  const filteredCustomers = Object.entries(groupedDeposits).filter(([_, customerData]) =>
    customerData.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customerData.customer.accountNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApproveClick = async (deposit) => {
    setActionLoading(true);
    const result = await approveDeposit(deposit._id);
    setActionLoading(false);
  };

  const handleRejectClick = (deposit) => {
    setSelectedDeposit(deposit);
    setOpenRejectModal(true);
  };  

  const handleConfirmReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Rejection reason cannot be empty.');
      return;
    }
    setActionLoading(true);
    const result = await rejectDeposit(selectedDeposit._id, rejectionReason);
    if (result.success) {
      setOpenRejectModal(false);
      setRejectionReason('');
      setSelectedDeposit(null);
    }
    setActionLoading(false);
  };

  const handleDeleteClick = (deposit) => {
    setSelectedDeposit(deposit);
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setActionLoading(true);
    const result = await deleteDeposit(selectedDeposit._id);
    if (result.success) {
      setOpenDeleteModal(false);
      setSelectedDeposit(null);
    }
    setActionLoading(false);
  };

  const getStatusChipColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
      default:
        return 'warning';
    }
  };

  const getCustomerStats = () => {
    const totalCustomers = Object.keys(groupedDeposits).length;
    const totalDeposits = deposits.length;
    // {{ edit_2 }}
    // This calculation for totalAmount across ALL customers is already correct
    // as it filters by status === 'approved'
    const totalAmount = deposits
    .filter(deposit => deposit.status === 'approved')
    .reduce((sum, deposit) => sum + deposit.amount, 0);
      const pendingDeposits = deposits.filter(d => d.status === 'pending').length;

    return { totalCustomers, totalDeposits, totalAmount, pendingDeposits };
  };

  const stats = getCustomerStats();

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: 'grey.50', p: 2 }}>
      {/* Header Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          borderRadius: 3,
          width: '100%',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
            <AssignmentIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Customer Deposit Management
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              Manage deposits for your assigned customers
            </Typography>
          </Box>
        </Stack>

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6} sm={3}>
            <StatsCard elevation={0} sx={{ bgcolor: 'rgba(255,255,255,0.15)',width:'170px' }}>
              <PersonIcon sx={{ fontSize: 24, mb: 1 }} />
              <Typography variant="h6" fontWeight="bold">{stats.totalCustomers}</Typography>
              <Typography variant="caption">Customers</Typography>
            </StatsCard>
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatsCard elevation={0} sx={{ bgcolor: 'rgba(255,255,255,0.15)' ,width:'170px' }}>
              <HistoryIcon sx={{ fontSize: 24, mb: 1 }} />
              <Typography variant="h6" fontWeight="bold">{stats.totalDeposits}</Typography>
              <Typography variant="caption">Total Deposits</Typography>
            </StatsCard>
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatsCard elevation={0} sx={{ bgcolor: 'rgba(255,255,255,0.15)',width:'170px' }}>
              <MonetizationOnIcon sx={{ fontSize: 24, mb: 1 }} />
              <Typography variant="h6" fontWeight="bold">₹{stats.totalAmount.toLocaleString()}</Typography>
              <Typography variant="caption">Total Amount</Typography>
            </StatsCard>
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatsCard elevation={0} sx={{ bgcolor: 'rgba(255,255,255,0.15)' ,width:'170px' }}>
              <TrendingUpIcon sx={{ fontSize: 24, mb: 1 }} />
              <Typography variant="h6" fontWeight="bold">{stats.pendingDeposits}</Typography>
              <Typography variant="caption">Pending</Typography>
            </StatsCard>
          </Grid>
        </Grid>
      </Paper>

      {/* Search Section */}
      <SearchContainer sx={{ width: '100%' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search customers by name or account number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: 'white',
            }
          }}
        />
      </SearchContainer>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress size={40} />
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}

      {!loading && deposits.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No deposit records found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No deposits found for your assigned customers.
          </Typography>
        </Paper>
      )}

      {!loading && filteredCustomers.length > 0 && (
        <Box>
          {filteredCustomers.map(([customerId, customerData]) => (
            <CustomerCard key={customerId} elevation={2}>
              <Accordion 
                expanded={expandedCustomer === customerId}
                onChange={() => setExpandedCustomer(expandedCustomer === customerId ? null : customerId)}
                sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}
              >
                <AccordionSummary 
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ 
                    px: 3, 
                    py: 2,
                    '&:hover': { bgcolor: 'action.hover' },
                    borderRadius: '16px 16px 0 0',
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      <PersonIcon />
                    </Avatar>
                    
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight="bold">
                        {customerData.customer.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Account: {customerData.customer.accountNumber}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <Badge badgeContent={customerData.pendingCount} color="warning">
                        <Chip 
                          label={`${customerData.deposits.length} Deposits`}
                          variant="outlined"
                          size="small"
                        />
                      </Badge>
                      <Chip 
                        label={`₹${customerData.totalAmount.toLocaleString()}`}
                        color="primary"
                        size="small"
                      />
                    </Stack>
                  </Stack>
                </AccordionSummary>

                <AccordionDetails sx={{ px: 0, py: 0 }}>
                  <TableContainer sx={{ width: '100%' }}>
                    <Table sx={{ width: '100%' }}>
                      <TableHead>
                        <TableRow>
                          <StyledTableCell>Plan</StyledTableCell>
                          <StyledTableCell align="right">Amount</StyledTableCell>
                          <StyledTableCell>Method</StyledTableCell>
                          <StyledTableCell>Date</StyledTableCell>
                          <StyledTableCell>Status</StyledTableCell>
                          <StyledTableCell>Reference ID</StyledTableCell>
                          <StyledTableCell align="center">Actions</StyledTableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {customerData.deposits.map((deposit) => (
                          <StyledTableRow key={deposit._id}>
                            <StyledTableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {deposit.planId?.plan_name || 'N/A'}
                              </Typography>
                            </StyledTableCell>
                            <StyledTableCell align="right">
                              <Typography variant="body2" fontWeight="bold" color="primary">
                                ₹{deposit.amount.toFixed(2)}
                              </Typography>
                            </StyledTableCell>
                            <StyledTableCell>
                              <Chip
                                label={deposit.paymentMethod === 'in_hand' ? 'In Hand' : 'Online'}
                                variant="outlined"
                                size="small"
                                color={deposit.paymentMethod === 'in_hand' ? 'secondary' : 'info'}
                              />
                            </StyledTableCell>
                            <StyledTableCell>
                              <Stack>
                                <Typography variant="body2">
                                  {moment(deposit.depositDate).format('DD/MM/YYYY')}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {moment(deposit.depositDate).format('HH:mm')}
                                </Typography>
                              </Stack>
                            </StyledTableCell>
                            <StyledTableCell>
                              <Chip
                                label={deposit.status.toUpperCase()}
                                color={getStatusChipColor(deposit.status)}
                                size="small"
                                sx={{ fontWeight: 'bold' }}
                              />
                            </StyledTableCell>
                            <StyledTableCell>
                              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                {deposit.referenceId || 'N/A'}
                              </Typography>
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              <Stack direction="row" spacing={0.5} justifyContent="center">
                                {deposit.status === 'pending' && deposit.paymentMethod === 'in_hand' && (
                                  <Tooltip title="Approve Deposit">
                                    <IconButton
                                      color="success"
                                      onClick={() => handleApproveClick(deposit)}
                                      disabled={actionLoading}
                                      size="small"
                                    >
                                      <ApproveIcon />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                
{deposit.status === 'pending' && deposit.paymentMethod === 'in_hand' && (
  <Tooltip title="Reject Deposit">
    <IconButton
      color="error"
      onClick={() => handleRejectClick(deposit)}
      disabled={actionLoading}
      size="small"
    >
      <RejectIcon />
    </IconButton>
  </Tooltip>
)}


                                <Tooltip title="Delete Deposit">
                                  <IconButton
                                    color="default"
                                    onClick={() => handleDeleteClick(deposit)}
                                    disabled={actionLoading}
                                    size="small"
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </StyledTableCell>
                          </StyledTableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            </CustomerCard>
          ))}
        </Box>
      )}

      {/* Reject Deposit Modal */}
      <Dialog 
        open={openRejectModal} 
        onClose={() => setOpenRejectModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <RejectIcon color="error" />
            <Typography variant="h6">Reject Deposit</Typography>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Typography color="text.secondary" gutterBottom>
            Are you sure you want to reject this deposit?
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for Rejection"
            type="text"
            fullWidth
            variant="outlined"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            required
            error={!rejectionReason.trim() && actionLoading}
            helperText={!rejectionReason.trim() && actionLoading ? "Reason is required" : ""}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={() => setOpenRejectModal(false)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmReject}
            color="error"
            variant="contained"
            disabled={actionLoading || !rejectionReason.trim()}
            sx={{ borderRadius: 2 }}
          >
            {actionLoading ? <CircularProgress size={20} /> : 'Confirm Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Deposit Modal */}
      <Dialog 
        open={openDeleteModal} 
        onClose={() => setOpenDeleteModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <DeleteIcon color="error" />
            <Typography variant="h6">Delete Deposit</Typography>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
            This action cannot be undone!
          </Alert>
          <Typography color="text.secondary">
            Are you sure you want to delete this deposit? If the deposit was approved, 
            the customer's balance will be adjusted accordingly.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={() => setOpenDeleteModal(false)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={actionLoading}
            sx={{ borderRadius: 2 }}
          >
            {actionLoading ? <CircularProgress size={20} /> : 'Confirm Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button for refresh */}
      <Zoom in={!loading}>
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 24, right: 24 }}
          onClick={fetchAssignedCustomerDeposits}
        >
          <HistoryIcon />
        </Fab>
      </Zoom>
    </Box>
  );
}