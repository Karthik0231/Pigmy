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
  Container,
  Chip,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  TextField,
  InputAdornment,
  TablePagination,
  Collapse,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Avatar,
  Badge,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { tableCellClasses } from '@mui/material/TableCell';
import {
  Feedback as FeedbackIcon,
  Person as PersonIcon,
  BusinessCenter as CollectorIcon,
  Subject as SubjectIcon,
  Message as MessageIcon,
  Star as StarIcon,
  AccessTime as TimeIcon,
  Update as UpdateIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Note as NoteIcon,
  Add as AddIcon,
  Send as SendIcon,
  History as HistoryIcon,
  AdminPanelSettings as AdminIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Star as PriorityIcon,
  Label as LabelIcon,
} from '@mui/icons-material';
import { AdminContext } from '../Context/Context';
import moment from 'moment';
import Swal from 'sweetalert2';

// Styled Components
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

const HeaderContainer = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: theme.spacing(4),
  marginBottom: theme.spacing(3),
  borderRadius: '20px',
  boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)',
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    right: '-50%',
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
    transform: 'rotate(45deg)',
  }
}));

const FilterContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: '16px',
  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
}));

const StatusChip = styled(Chip)(({ status, theme }) => {
  let backgroundColor, color, borderColor;

  switch (status) {
    case 'resolved':
      backgroundColor = '#e8f5e8';
      color = '#2e7d32';
      borderColor = '#4caf50';
      break;
    case 'closed':
      backgroundColor = '#f5f5f5';
      color = '#424242';
      borderColor = '#9e9e9e';
      break;
    case 'in_progress':
      backgroundColor = '#e3f2fd';
      color = '#1565c0';
      borderColor = '#2196f3';
      break;
    case 'new':
    default:
      backgroundColor = '#fff3e0';
      color = '#ef6c00';
      borderColor = '#ff9800';
  }

  return {
    backgroundColor,
    color,
    borderColor,
    border: `1px solid ${borderColor}`,
    fontWeight: 600,
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  };
});

const NotesDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '16px',
    minWidth: '600px',
    maxWidth: '800px',
  },
}));

const NoteCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: '12px',
  border: '1px solid rgba(0,0,0,0.08)',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    transform: 'translateY(-2px)',
    transition: 'all 0.2s ease-in-out',
  },
}));

const FeedbackManagement = () => {
  const {
    feedbackList,
    feedbackLoading,
    feedbackError,
    fetchFeedback,
    updateFeedbackStatusAdmin,
  } = useContext(AdminContext);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [expandedFeedbackId, setExpandedFeedbackId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Notes Dialog States
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleRowClick = (feedbackId) => {
    setExpandedFeedbackId(expandedFeedbackId === feedbackId ? null : feedbackId);
  };

  const handleOpenNotesDialog = (feedback) => {
    setSelectedFeedback(feedback);
    setSelectedStatus(feedback.status);
    setNotesDialogOpen(true);
    setTabValue(0);
  };

  const handleCloseNotesDialog = () => {
    setNotesDialogOpen(false);
    setSelectedFeedback(null);
    setNewNote('');
    setSelectedStatus('');
    setTabValue(0);
  };

  const handleStatusChange = (feedbackId, newStatus) => {
    Swal.fire({
      title: 'Confirm Status Update',
      text: `Are you sure you want to change the status to "${newStatus.replace('_', ' ')}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Update'
    }).then((result) => {
      if (result.isConfirmed) {
        updateFeedbackStatusAdmin(feedbackId, newStatus);
      }
    });
  };

  const handleSendNoteWithStatus = async () => {
    if (!newNote.trim()) {
      Swal.fire('Error', 'Please enter a note', 'error');
      return;
    }

    try {
      await updateFeedbackStatusAdmin(selectedFeedback._id, selectedStatus, newNote);
      handleCloseNotesDialog();
    } catch (error) {
      console.error('Error sending note:', error);
    }
  };

  const handleQuickStatusUpdate = (feedback, newStatus) => {
    setSelectedFeedback(feedback);
    setSelectedStatus(newStatus);
    setNotesDialogOpen(true);
    setTabValue(0);
  };

  const filteredFeedback = React.useMemo(() => {
    return feedbackList.filter(feedback => {
      const matchesSearch = feedback.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            feedback.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (feedback.sourceId?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (feedback.sourceId?.email?.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || feedback.status === statusFilter;
      const matchesSource = sourceFilter === 'all' || feedback.source === sourceFilter;

      return matchesSearch && matchesStatus && matchesSource;
    });
  }, [feedbackList, searchTerm, statusFilter, sourceFilter]);

  const paginatedFeedback = filteredFeedback.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getSourceDetails = (feedback) => {
      if (!feedback.sourceId) return 'N/A';
      if (feedback.source === 'Customer') {
          return `${feedback.sourceId.name} (${feedback.sourceId.email}) - (${feedback.sourceId.phone})`;
      } else if (feedback.source === 'Collector') {
          return `${feedback.sourceId.name} (${feedback.sourceId.email}) - (${feedback.sourceId.phone})`;
      }
      return 'Unknown Source';
  };

  const getPriorityColor = (rating) => {
    if (rating <= 2) return 'error';
    if (rating <= 3) return 'warning';
    return 'success';
  };

  const getNotesCount = (feedback) => {
    return feedback.notes ? feedback.notes.length : 0;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Enhanced Header Section */}
      <HeaderContainer>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, position: 'relative', zIndex: 1 }}>
          <Avatar sx={{ 
            bgcolor: 'rgba(255,255,255,0.2)', 
            width: 80, 
            height: 80,
            border: '3px solid rgba(255,255,255,0.3)'
          }}>
            <FeedbackIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight="800" sx={{ 
              background: 'linear-gradient(45deg, #ffffff 30%, #f0f0f0 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}>
              Feedback Management
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
              Comprehensive feedback tracking and resolution system
            </Typography>
            {/* <Box sx={{ display: 'flex', gap: 3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold">{feedbackList.length}</Typography>
                <Typography variant="caption">Total Feedback</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold">
                  {feedbackList.filter(f => f.status === 'new').length}
                </Typography>
                <Typography variant="caption">New</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold">
                  {feedbackList.filter(f => f.status === 'resolved').length}
                </Typography>
                <Typography variant="caption">Resolved</Typography>
              </Box>
            </Box> */}
          </Box>
        </Box>
      </HeaderContainer>

      {/* Enhanced Filters Section */}
      <FilterContainer elevation={0}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* <SearchIcon color="primary" />
          Search & Filter Options */}
        </Typography>
        <Grid container spacing={3} alignItems="center">
          {/* <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by subject, content, name, or email..."
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
                  '&:hover': {
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  }
                } 
              }}
            />
          </Grid> */}
          <Grid item xs={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{ borderRadius: '12px', backgroundColor: 'white' }}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="new">New</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {/* <Grid item xs={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Source</InputLabel>
              <Select
                value={sourceFilter}
                label="Source"
                onChange={(e) => setSourceFilter(e.target.value)}
                sx={{ borderRadius: '12px', backgroundColor: 'white' }}
              >
                <MenuItem value="all">All Sources</MenuItem>
                <MenuItem value="Customer">Customer</MenuItem>
                <MenuItem value="collector">Collector</MenuItem>
              </Select>
            </FormControl>
          </Grid> */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Showing {filteredFeedback.length} of {feedbackList.length} feedback entries
              </Typography>
              <Button
                variant="outlined"
                startIcon={<UpdateIcon />}
                onClick={() => fetchFeedback()}
                sx={{ borderRadius: '12px' }}
              >
                Refresh
              </Button>
            </Box>
          </Grid>
        </Grid>
      </FilterContainer>

      {/* Loading State */}
      {feedbackLoading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
          <CircularProgress size={80} thickness={4} sx={{ mb: 3 }} />
          <Typography variant="h6" sx={{ color: 'text.secondary' }}>
            Loading feedback data...
          </Typography>
        </Box>
      )}

      {/* Error State */}
      {feedbackError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', py: 2 }}>
          <Typography variant="h6">Error Loading Feedback</Typography>
          <Typography variant="body2">{feedbackError}</Typography>
        </Alert>
      )}

      {/* No Data State */}
      {!feedbackLoading && !feedbackError && feedbackList.length === 0 && (
        <Paper sx={{ p: 8, textAlign: 'center', borderRadius: '16px', background: 'linear-gradient(145deg, #f8f9fa, #e9ecef)' }}>
          <FeedbackIcon sx={{ fontSize: 120, color: 'text.disabled', mb: 3 }} />
          <Typography variant="h4" color="text.secondary" gutterBottom fontWeight="600">
            No Feedback Available
          </Typography>
          <Typography variant="body1" color="text.disabled" sx={{ mb: 3 }}>
            There are no feedback entries to display at the moment.
          </Typography>
          <Button variant="contained" startIcon={<UpdateIcon />} onClick={() => fetchFeedback()}>
            Refresh Data
          </Button>
        </Paper>
      )}

      {/* Enhanced Feedback Table */}
      {!feedbackLoading && filteredFeedback.length > 0 && (
        <Paper
          elevation={8}
          sx={{
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
            border: '1px solid rgba(0,0,0,0.05)',
            background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
          }}
        >
          <TableContainer sx={{ maxHeight: '70vh' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <StyledTableCell width="4%"></StyledTableCell>
                  <StyledTableCell width="15%">Source</StyledTableCell>
                  <StyledTableCell width="18%">Subject</StyledTableCell>
                  <StyledTableCell width="8%">Type</StyledTableCell>
                  <StyledTableCell width="8%">Rating</StyledTableCell>
                  <StyledTableCell width="10%">Status</StyledTableCell>
                  <StyledTableCell width="12%">Date</StyledTableCell>
                  <StyledTableCell width="17%">Actions</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedFeedback.map((feedback) => (
                  <React.Fragment key={feedback._id}>
                    <StyledTableRow onClick={() => handleRowClick(feedback._id)}>
                      <TableCell>
                        <IconButton size="small" sx={{ 
                          bgcolor: expandedFeedbackId === feedback._id ? 'primary.main' : 'transparent',
                          color: expandedFeedbackId === feedback._id ? 'white' : 'inherit',
                          '&:hover': { bgcolor: 'primary.light', color: 'white' }
                        }}>
                          {expandedFeedbackId === feedback._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ 
                            width: 32, 
                            height: 32, 
                            bgcolor: feedback.source === 'Customer' ? 'primary.light' : 'secondary.light'
                          }}>
                            {feedback.source === 'Customer' ? <PersonIcon fontSize="small" /> : <CollectorIcon fontSize="small" />}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="600">{feedback.source}</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                              {getSourceDetails(feedback)}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <SubjectIcon fontSize="small" color="action" />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {feedback.subject}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={feedback.type}
                          size="small"
                          color={feedback.type === 'Complaint' ? 'error' : 'info'}
                          sx={{ 
                            fontWeight: 600, 
                            textTransform: 'uppercase', 
                            fontSize: '0.7rem',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PriorityIcon 
                            fontSize="small" 
                            color={getPriorityColor(feedback.rating)} 
                          />
                          <Typography variant="body2" fontWeight="600">
                            {feedback.rating || 'N/A'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <StatusChip 
                          status={feedback.status} 
                          label={feedback.status.replace('_', ' ')} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <TimeIcon fontSize="small" color="action" />
                          <Box>
                            <Typography variant="body2" fontWeight="500">
                              {moment(feedback.createdAt).format('MMM DD')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {moment(feedback.createdAt).format('HH:mm')}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <FormControl variant="outlined" size="small" sx={{ minWidth: 100 }}>
                            {feedback.status!=='closed' && feedback.status!=='resolved' ?
                            <Select
                              value={feedback.status}
                              onChange={(e) => handleQuickStatusUpdate(feedback, e.target.value)}
                              displayEmpty
                              sx={{ 
                                fontSize: '0.75rem',
                                '& .MuiSelect-select': { py: 0.5 }
                              }}
                            >
                              <MenuItem value="new">New</MenuItem>
                              <MenuItem value="in_progress">In Progress</MenuItem>
                              <MenuItem value="resolved">Resolved</MenuItem>
                              <MenuItem value="closed">Closed</MenuItem>
                            </Select>
                            : 
                            <StatusChip 
                          status={feedback.status} 
                          label={feedback.status.replace('_', ' ')} 
                          size="small" 
                        />
                            }
                          </FormControl>
                        </Box>
                      </TableCell>
                    </StyledTableRow>
                    
                    {/* Expanded Row Content */}
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
                        <Collapse in={expandedFeedbackId === feedback._id} timeout="auto" unmountOnExit>
                          <Box sx={{ margin: 2 }}>
                            <Card sx={{ borderRadius: '12px', border: '2px dashed #e0e0e0' }}>
                              <CardContent>
                                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                                  <MessageIcon /> Full Feedback Content
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                                  {feedback.content}
                                </Typography>
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Box sx={{ display: 'flex', gap: 3 }}>
                                    <Typography variant="caption" color="text.disabled">
                                      <strong>Created:</strong> {moment(feedback.createdAt).format('YYYY-MM-DD HH:mm')}
                                    </Typography>
                                    <Typography variant="caption" color="text.disabled">
                                      <strong>Last Updated:</strong> {moment(feedback.updatedAt).format('YYYY-MM-DD HH:mm')}
                                    </Typography>
                                  </Box>
                                  {feedback.status!=='closed' && feedback.status!=='resolved' ?
                                  <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<NoteIcon />}
                                    onClick={() => handleOpenNotesDialog(feedback)}
                                    sx={{ borderRadius: '8px' }}
                                  >
                                    Manage
                                  </Button>
                                  : null}
                                </Box>
                              </CardContent>
                            </Card>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredFeedback.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ 
              borderTop: '1px solid rgba(224, 224, 224, 0.5)',
              bgcolor: 'rgba(248, 250, 252, 0.5)'
            }}
          />
        </Paper>
      )}

      {/* Enhanced Notes Dialog */}
      <NotesDialog
        open={notesDialogOpen}
        onClose={handleCloseNotesDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2 
        }}>
          <NoteIcon />
          <Box>
            <Typography variant="h6">Feedback Management</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {selectedFeedback?.subject}
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Add Note & Update Status" icon={<AddIcon />} />
            {/* <Tab label="View Notes History" icon={<HistoryIcon />} />
            <Tab label="Feedback Details" icon={<ViewIcon />} /> */}
          </Tabs>

          {/* Tab 1: Add Note & Update Status */}
          {tabValue === 0 && (
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Update Status</InputLabel>
                    <Select
                      value={selectedStatus}
                      label="Update Status"
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      <MenuItem value="new">🆕 New</MenuItem>
                      <MenuItem value="in_progress">⏳ In Progress</MenuItem>
                      <MenuItem value="resolved">✅ Resolved</MenuItem>
                      <MenuItem value="closed">🔒 Closed</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
<Typography variant="body2" color="text.secondary">
                    Current Status: <StatusChip status={selectedFeedback?.status} label={selectedFeedback?.status?.replace('_', ' ')} size="small" />
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    variant="outlined"
                    label="Add Administrative Note"
                    placeholder="Enter your note or response to this feedback..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AdminIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Tab 2: Notes History */}
          {tabValue === 1 && (
            <Box sx={{ p: 3 }}>
              {selectedFeedback?.notes && selectedFeedback.notes.length > 0 ? (
                <List>
                  {selectedFeedback.notes.map((note, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.light' }}>
                          <AdminIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle2" fontWeight="600">
                              Administrative Note #{index + 1}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {moment(note.createdAt).format('MMM DD, YYYY HH:mm')}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.primary">
                              {note.content}
                            </Typography>
                            {note.statusChange && (
                              <Chip
                                label={`Status changed to: ${note.statusChange.replace('_', ' ')}`}
                                size="small"
                                color="primary"
                                sx={{ mt: 1 }}
                              />
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <NoteIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No Notes Yet
                  </Typography>
                  <Typography variant="body2" color="text.disabled">
                    Add the first administrative note for this feedback.
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Tab 3: Feedback Details */}
          {tabValue === 2 && selectedFeedback && (
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Source Information
                    </Typography>
                    <Typography variant="body1" fontWeight="600">
                      {selectedFeedback.source}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {getSourceDetails(selectedFeedback)}
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Feedback Type & Priority
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Chip label={selectedFeedback.type} size="small" color="primary" />
                      <Chip label={`Priority: ${selectedFeedback.rating || 'N/A'}`} size="small" color="secondary" />
                    </Box>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Subject
                    </Typography>
                    <Typography variant="h6" fontWeight="600">
                      {selectedFeedback.subject}
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Full Content
                    </Typography>
                    <Typography variant="body1">
                      {selectedFeedback.content}
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Created Date
                    </Typography>
                    <Typography variant="body1">
                      {moment(selectedFeedback.createdAt).format('MMMM DD, YYYY [at] HH:mm')}
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Last Updated
                    </Typography>
                    <Typography variant="body1">
                      {moment(selectedFeedback.updatedAt).format('MMMM DD, YYYY [at] HH:mm')}
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, bgcolor: 'grey.50' }}>
          {tabValue === 0 && (
            <>
              <Button
                onClick={handleCloseNotesDialog}
                startIcon={<CancelIcon />}
                sx={{ borderRadius: '8px' }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendNoteWithStatus}
                variant="contained"
                startIcon={<SendIcon />}
                disabled={!newNote.trim() || !selectedStatus}
                sx={{ borderRadius: '8px' }}
              >
                Update Status & Add Note
              </Button>
            </>
          )}
          {(tabValue === 1 || tabValue === 2) && (
            <Button
              onClick={handleCloseNotesDialog}
              variant="outlined"
              sx={{ borderRadius: '8px' }}
            >
              Close
            </Button>
          )}
        </DialogActions>
      </NotesDialog>
    </Container>
  );
};

export default FeedbackManagement;