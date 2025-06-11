import React, { useContext, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  TextField,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Card,
  CardContent,
  Grid,
  Avatar,
  Stack
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonIcon from '@mui/icons-material/Person';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import { CollectorContext } from '../Context/Context';
import moment from 'moment';
import Swal from 'sweetalert2';

export default function CollectorWithdrawalRequestsPage() {
  const {
    withdrawalRequests,
    loading,
    requestLoading,
    error,
    fetchAssignedCustomerWithdrawalRequests,
    approveWithdrawalRequest,
    rejectWithdrawalRequest,
    deleteWithdrawalRequest,
    clearMessages
  } = useContext(CollectorContext);

  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [expandedCustomers, setExpandedCustomers] = useState(new Set());

  useEffect(() => {
    fetchAssignedCustomerWithdrawalRequests();
  }, []);

  useEffect(() => {
    clearMessages();
    return () => clearMessages();
  }, [clearMessages]);

  // Group requests by customer
  const groupedRequests = React.useMemo(() => {
    if (!withdrawalRequests || withdrawalRequests.length === 0) return {};
    
    return withdrawalRequests.reduce((acc, request) => {
      const customerId = request.customerId?._id || 'unknown';
      if (!acc[customerId]) {
        acc[customerId] = {
          customer: request.customerId,
          requests: []
        };
      }
      acc[customerId].requests.push(request);
      return acc;
    }, {});
  }, [withdrawalRequests]);

  // Calculate statistics for each customer
  const getCustomerStats = (requests) => {
    const pending = requests.filter(r => r.status === 'pending').length;
    const approved = requests.filter(r => r.status === 'approved').length;
    const rejected = requests.filter(r => r.status === 'rejected').length;
    const totalAmount = requests.reduce((sum, r) => sum + r.amount, 0);
    
    return { pending, approved, rejected, totalAmount, total: requests.length };
  };

  const handleCustomerToggle = (customerId) => {
    const newExpanded = new Set(expandedCustomers);
    if (newExpanded.has(customerId)) {
      newExpanded.delete(customerId);
    } else {
      newExpanded.add(customerId);
    }
    setExpandedCustomers(newExpanded);
  };

  const handleApproveClick = async (requestId) => {
    Swal.fire({
      title: 'Approve Withdrawal?',
      html: `
        <div style="text-align: left; margin: 20px 0;">
          <p><strong>⚠️ Important:</strong> Please verify:</p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Customer identity and account details</li>
            <li>Sufficient account balance</li>
          </ul>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4caf50',
      cancelButtonColor: '#f44336',
      confirmButtonText: '✓ Yes, Approve',
      cancelButtonText: '✗ Cancel',
      reverseButtons: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        await approveWithdrawalRequest(requestId);
      }
    });
  };

  const handleRejectClick = (requestId) => {
    setCurrentRequestId(requestId);
    setRejectionReason('');
    setOpenRejectDialog(true);
  };

  const handleConfirmReject = async () => {
    await rejectWithdrawalRequest(currentRequestId, rejectionReason);
    setOpenRejectDialog(false);
    setCurrentRequestId(null);
    setRejectionReason('');
  };

  const handleDeleteClick = (requestId) => {
    setCurrentRequestId(requestId);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    await deleteWithdrawalRequest(currentRequestId);
    setOpenDeleteDialog(false);
    setCurrentRequestId(null);
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', minHeight: '100vh', p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mt: 8 }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" color="text.secondary">
            Loading withdrawal requests...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ width: '100%', minHeight: '100vh', p: 3 }}>
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: 2,
            '& .MuiAlert-icon': { fontSize: 28 }
          }}
        >
          <Typography variant="h6">Error Loading Requests</Typography>
          <Typography>{error}</Typography>
        </Alert>
      </Box>
    );
  }

  const totalCustomers = Object.keys(groupedRequests).length;
  const totalRequests = withdrawalRequests?.length || 0;
  const pendingRequests = withdrawalRequests?.filter(r => r.status === 'pending').length || 0;

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', p: 3 }}>
      {/* Header Section */}
      <Paper 
        elevation={4} 
        sx={{ 
          p: 3, 
          mb: 3,
          background: 'linear-gradient(135deg,rgb(4, 5, 5) 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 3
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
            <HistoryIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Withdrawal Requests Management
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              Manage customer withdrawal requests efficiently
            </Typography>
          </Box>
        </Stack>
        
        {/* Statistics Cards */}
        {/* <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
              <CardContent sx={{ textAlign: 'center', color: 'white' }}>
                <PersonIcon sx={{ fontSize: 40 }} />
                <Typography variant="h4" fontWeight="bold">{totalCustomers}</Typography>
                <Typography variant="body2">Total Customers</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
              <CardContent sx={{ textAlign: 'center', color: 'white' }}>
                <AccountBalanceWalletIcon sx={{ fontSize: 40}} />
                <Typography variant="h4" fontWeight="bold">{totalRequests}</Typography>
                <Typography variant="body2">Total Requests</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
              <CardContent sx={{ textAlign: 'center', color: 'white' }}>
                <PendingActionsIcon sx={{ fontSize: 40}} />
                <Typography variant="h4" fontWeight="bold">{pendingRequests}</Typography>
                <Typography variant="body2">Pending Actions</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid> */}
      </Paper>

      {/* Main Content */}
      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {totalCustomers > 0 ? (
          <Box sx={{ p: 3 }}>
            {Object.entries(groupedRequests).map(([customerId, { customer, requests }]) => {
              const stats = getCustomerStats(requests);
              const isExpanded = expandedCustomers.has(customerId);
              
              return (
                <Accordion 
                  key={customerId}
                  expanded={isExpanded}
                  onChange={() => handleCustomerToggle(customerId)}
                  sx={{ 
                    mb: 2, 
                    borderRadius: 2,
                    '&:before': { display: 'none' },
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  <AccordionSummary 
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ 
                      bgcolor: '#f8f9fa',
                      borderRadius: '8px 8px 0 0',
                      '&:hover': { bgcolor: '#e9ecef' }
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
                      <Avatar sx={{ bgcolor: '#667eea' }}>
                        <PersonIcon />
                      </Avatar>
                      
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" fontWeight="bold">
                          {customer?.name || 'Unknown Customer'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Account: {customer?.accountNumber || 'N/A'} • 
                          Balance: ₹{customer?.balance?.toLocaleString() || 'N/A'}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={1}>
                        <Badge badgeContent={stats.pending} color="warning">
                          <Chip 
                            label={`${stats.total} Request${stats.total !== 1 ? 's' : ''}`}
                            color="primary"
                            variant="outlined"
                            size="small"
                          />
                        </Badge>
                        <Chip 
                          label={`₹${stats.totalAmount.toLocaleString()}`}
                          color="secondary"
                          size="small"
                        />
                      </Stack>
                    </Stack>
                  </AccordionSummary>
                  
                  <AccordionDetails sx={{ p: 0 }}>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                            <TableCell><strong>Date & Time</strong></TableCell>
                            <TableCell><strong>Amount</strong></TableCell>
                            <TableCell><strong>Requirements</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell><strong>Handled By</strong></TableCell>
                            <TableCell><strong>Remarks</strong></TableCell>
                            <TableCell align="center"><strong>Actions</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {requests.map((request) => (
                            <TableRow 
                              key={request._id} 
                              hover
                              sx={{ 
                                '&:hover': { bgcolor: '#f8f9fa' },
                                borderLeft: request.status === 'pending' ? '4px solid #ff9800' : 
                                           request.status === 'approved' ? '4px solid #4caf50' : '4px solid #f44336'
                              }}
                            >
                              <TableCell>
                                <Typography variant="body2" fontWeight="medium">
                                  {moment(request.date).format('DD MMM YYYY')}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {moment(request.date).format('hh:mm A')}
                                </Typography>
                              </TableCell>
                              
                              <TableCell>
                                <Typography variant="body2" fontWeight="bold" color="primary">
                                  ₹{request.amount.toLocaleString()}
                                </Typography>
                              </TableCell>
                              
                              <TableCell>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    maxWidth: 200, 
                                    overflow: 'hidden', 
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {request.requirements || 'None specified'}
                                </Typography>
                              </TableCell>
                              
                              <TableCell>
                                <Chip
                                  label={request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                  color={
                                    request.status === 'approved' ? 'success' : 
                                    request.status === 'rejected' ? 'error' : 'warning'
                                  }
                                  size="small"
                                  sx={{ fontWeight: 'bold' }}
                                />
                              </TableCell>
                              
                              <TableCell>
                                <Typography variant="body2">
                                  {request.handledBy ? request.handledBy.name || 'N/A' : 'Pending'}
                                </Typography>
                              </TableCell>
                              
                              <TableCell>
                                <Typography 
                                  variant="body2"
                                  sx={{ 
                                    maxWidth: 150, 
                                    overflow: 'hidden', 
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {request.remarks || 'No remarks'}
                                </Typography>
                              </TableCell>
                              
                              <TableCell align="center">
                                <Stack direction="row" spacing={0.5} justifyContent="center">
                                  {request.status === 'pending' && (
                                    <>
                                      <Tooltip title="Approve Request" arrow>
                                        <span>
                                          <IconButton
                                            color="success"
                                            onClick={() => handleApproveClick(request._id)}
                                            disabled={requestLoading}
                                            size="small"
                                            sx={{ 
                                              '&:hover': { 
                                                bgcolor: 'success.light',
                                                transform: 'scale(1.1)'
                                              }
                                            }}
                                          >
                                            <CheckCircleIcon />
                                          </IconButton>
                                        </span>
                                      </Tooltip>
                                      
                                      <Tooltip title="Reject Request" arrow>
                                        <span>
                                          <IconButton
                                            color="error"
                                            onClick={() => handleRejectClick(request._id)}
                                            disabled={requestLoading}
                                            size="small"
                                            sx={{ 
                                              '&:hover': { 
                                                bgcolor: 'error.light',
                                                transform: 'scale(1.1)'
                                              }
                                            }}
                                          >
                                            <CancelIcon />
                                          </IconButton>
                                        </span>
                                      </Tooltip>
                                    </>
                                  )}
                                  
                                  <Tooltip title="Delete Request" arrow>
                                    <span>
                                      <IconButton
                                        color="default"
                                        onClick={() => handleDeleteClick(request._id)}
                                        disabled={requestLoading || request.status === 'approved'}
                                        size="small"
                                        sx={{ 
                                          '&:hover': { 
                                            bgcolor: 'grey.200',
                                            transform: 'scale(1.1)'
                                          }
                                        }}
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    </span>
                                  </Tooltip>
                                </Stack>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Avatar sx={{ mx: 'auto', mb: 3, width: 80, height: 80, bgcolor: 'grey.100' }}>
              <HistoryIcon sx={{ fontSize: 40, color: 'grey.400' }} />
            </Avatar>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              No Withdrawal Requests Found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              New requests will appear here when customers submit them.
            </Typography>
          </Box>
        )}

        {/* Reject Dialog */}
        <Dialog 
          open={openRejectDialog} 
          onClose={() => setOpenRejectDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <CancelIcon color="error" />
              <Typography variant="h6">Reject Withdrawal Request</Typography>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Please provide a clear reason for rejecting this withdrawal request. 
              This will help the customer understand the decision.
            </DialogContentText>
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
              placeholder="e.g., Insufficient balance, Missing documents, Invalid account details..."
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button 
              onClick={() => setOpenRejectDialog(false)} 
              color="inherit"
              variant="outlined"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmReject} 
              color="error" 
              variant="contained"
              disabled={requestLoading}
              startIcon={requestLoading ? <CircularProgress size={16} /> : <CancelIcon />}
            >
              {requestLoading ? 'Rejecting...' : 'Reject Request'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog 
          open={openDeleteDialog} 
          onClose={() => setOpenDeleteDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <DeleteIcon color="error" />
              <Typography variant="h6">Delete Withdrawal Request</Typography>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Warning:</strong> This action cannot be undone.
              </Typography>
            </Alert>
            <DialogContentText>
              Are you sure you want to permanently delete this withdrawal request? 
              Note that approved requests cannot be deleted to prevent balance inconsistencies.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button 
              onClick={() => setOpenDeleteDialog(false)} 
              color="inherit"
              variant="outlined"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmDelete} 
              color="error" 
              variant="contained"
              disabled={requestLoading}
              startIcon={requestLoading ? <CircularProgress size={16} /> : <DeleteIcon />}
            >
              {requestLoading ? 'Deleting...' : 'Delete Request'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
}