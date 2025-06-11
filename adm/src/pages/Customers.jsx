import React, { useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { styled } from '@mui/material/styles';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
  Avatar,
  Grid,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Divider,
  TablePagination,
  InputAdornment,
  Collapse,
  Skeleton
} from '@mui/material';
import { tableCellClasses } from '@mui/material/TableCell';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { AdminContext } from '../Context/Context';
import moment from 'moment';
import { config } from '../Config/Config';

// Move styled components outside of the main component to prevent re-creation
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: '#1976d2',
    color: theme.palette.common.white,
    fontWeight: 'bold',
    fontSize: '0.95rem',
    padding: '12px 8px',
    [theme.breakpoints.up('md')]: {
      padding: '12px 16px',
    },
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: '0.875rem',
    padding: '8px',
    [theme.breakpoints.up('md')]: {
      padding: '12px 16px',
    },
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const HeaderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  flexWrap: 'wrap',
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
}));

const SearchFilterContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
  flexWrap: 'wrap',
  alignItems: 'center',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
}));

const FileUploadButton = styled('label')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius * 2,
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  minHeight: '60px',
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    borderColor: theme.palette.primary.dark,
  },
}));

const ResponsiveDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    margin: theme.spacing(1),
    width: '100%',
    maxWidth: '900px',
    [theme.breakpoints.down('sm')]: {
      margin: theme.spacing(0.5),
      maxHeight: '95vh',
      width: 'calc(100% - 16px)',
    },
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    minHeight: '56px',
  },
  '& .MuiInputLabel-root': {
    fontSize: '1rem',
  },
  '& .MuiInputBase-input': {
    fontSize: '0.95rem',
    padding: '16.5px 14px',
  },
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiInputLabel-root': {
    fontSize: '1rem',
  },
  '& .MuiSelect-select': {
    minHeight: '20px',
    fontSize: '0.95rem',
    padding: '16.5px 14px',
  },
  '& .MuiMenuItem-root': {
    fontSize: '0.9rem',
    padding: theme.spacing(1.5, 2),
    whiteSpace: 'normal',
    wordWrap: 'break-word',
  },
}));

// Skeleton loader for table rows
const TableRowSkeleton = ({ columns }) => (
  <StyledTableRow>
    {Array.from({ length: columns }).map((_, index) => (
      <StyledTableCell key={index}>
        <Skeleton variant="text" width="100%" height={20} />
      </StyledTableCell>
    ))}
  </StyledTableRow>
);

// Memoized table row component
const CustomerTableRow = React.memo(({ customer, host, onEdit, onDelete }) => (
  <StyledTableRow>
    <StyledTableCell>
      <Avatar
        src={customer.profileImage ? `${host}/${customer.profileImage.replace(/\\/g, '/')}` : ''}
        alt={customer.name}
        sx={{ 
          width: 45, 
          height: 45,
          border: '2px solid',
          borderColor: 'primary.light'
        }}
      >
        {customer.name?.charAt(0)}
      </Avatar>
    </StyledTableCell>

    <StyledTableCell>
      <Box>
        <Typography variant="body1" fontWeight="600" sx={{ mb: 0.5 }}>
          {customer.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {customer.email}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {customer.phone}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Gender: {customer.gender}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          DOB: {customer.dob ? new Date(customer.dob).toLocaleDateString() : 'N/A'}
        </Typography>
      </Box>
    </StyledTableCell>

    <StyledTableCell>
      <Box>
        <Typography variant="body2" fontWeight="500">
          {customer.accountNumber}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {customer.accountType} account
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {customer.address}
        </Typography>
      </Box>
    </StyledTableCell>

    <StyledTableCell>
      <Box>
        <Typography variant="body2" fontWeight="500">
          {customer.packageId?.plan_name || 'N/A'}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          Collector: {customer.collectorId?.name || 'N/A'}
        </Typography>
      </Box>
    </StyledTableCell>

    <StyledTableCell>
      <Typography variant="body2">
        Start: {customer.startDate ? new Date(customer.startDate).toLocaleDateString() : 'N/A'}
      </Typography>
      <Typography variant="body2">
        Maturity: {customer.maturityDate ? new Date(customer.maturityDate).toLocaleDateString() : 'N/A'}
      </Typography>
    </StyledTableCell>

    <StyledTableCell>
      <Typography variant="body2">Balance: ₹{customer.balance || 0}</Typography>
      <Typography variant="caption" color="text.secondary">
        ₹{customer.packageId?.deposit_amount || 0} / {customer.packageId?.deposit_frequency || 'N/A'}
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block">
        Interest: {customer.packageId?.interest_rate || 0}%
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block">
        Maturity Amt: ₹{customer.packageId?.maturity_amount || 0}
      </Typography>
    </StyledTableCell>

<StyledTableCell>
  <Typography variant="body2" fontWeight="bold" mb={1}>KYC Documents</Typography>

  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
    {/* Aadhar Image */}
    {customer.kycDocs?.aadhar && (
      <div style={{ textAlign: 'center' }}>
        <Typography variant="caption" display="block">Aadhar</Typography>
        <img
          src={`${host}/${customer.kycDocs.aadhar.replace(/\\/g, '/')}`}
          alt="Aadhar"
          style={{
            width: 60,
            height: 'auto',
            marginTop: 4,
            borderRadius: 4,
            cursor: 'pointer',
            transition: 'transform 0.3s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(2)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        />
      </div>
    )}

    {/* PAN Image */}
    {customer.kycDocs?.pan && (
      <div style={{ textAlign: 'center' }}>
        <Typography variant="caption" display="block">PAN</Typography>
        <img
          src={`${host}/${customer.kycDocs.pan.replace(/\\/g, '/')}`}
          alt="PAN"
          style={{
            width: 60,
            height: 'auto',
            marginTop: 4,
            borderRadius: 4,
            cursor: 'pointer',
            transition: 'transform 0.3s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(2)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        />
      </div>
    )}
  </div>
</StyledTableCell>




    <StyledTableCell>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Chip
          label={customer.status || 'N/A'}
          color={
            customer.status === 'active' ? 'success' :
            customer.status === 'inactive' ? 'default' : 'error'
          }
          size="small"
          sx={{ minWidth: 70 }}
        />
        <Chip
          label={customer.isClosed ? 'Closed' : 'Open'}
          color={customer.isClosed ? 'error' : 'success'}
          size="small"
          variant="outlined"
          sx={{ minWidth: 70 }}
        />
      </Box>
    </StyledTableCell>

    <StyledTableCell align="center">
      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
        <IconButton
          color="primary"
          onClick={() => onEdit(customer)}
          size="small"
          sx={{ 
            bgcolor: 'primary.light', 
            color: 'white',
            '&:hover': { bgcolor: 'primary.main' }
          }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton
          color="error"
          onClick={() => onDelete(customer)}
          size="small"
          sx={{ 
            bgcolor: 'error.light', 
            color: 'white',
            '&:hover': { bgcolor: 'error.main' }
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
    </StyledTableCell>
  </StyledTableRow>
));

// FileUploadField component moved outside to prevent re-creation
const FileUploadField = React.memo(({ label, fieldName, accept, icon, files, filePreviews, handleFileChange }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
      {label}
    </Typography>
    <FileUploadButton htmlFor={`${fieldName}-upload`}>
      <input
        id={`${fieldName}-upload`}
        type="file"
        accept={accept}
        onChange={(e) => handleFileChange(e, fieldName)}
        style={{ display: 'none' }}
      />
      {icon}
      <Typography variant="body2" sx={{ ml: 1, textAlign: 'center' }}>
        {files[fieldName] ? files[fieldName].name : `Choose ${label}`}
      </Typography>
    </FileUploadButton>
    {filePreviews[fieldName] && (
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
        <Avatar
          src={filePreviews[fieldName]}
          sx={{ width: 80, height: 80, border: '2px solid', borderColor: 'primary.main' }}
        />
      </Box>
    )}
  </Box>
));

export default function Customers() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    const {host}= config;
    
    const {
      customers,
      viewCustomers,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      collectors,
      pigmyPlans
    } = useContext(AdminContext);
  
    // State management
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    
    // Search and filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [accountTypeFilter, setAccountTypeFilter] = useState('all');
    const [collectorFilter, setCollectorFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    
    // Loading state for table
    const [tableLoading, setTableLoading] = useState(false);
  
    // Form data state
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: '',
      gender: 'Other',
      dob: '',
      address: '',
      accountNumber: '',
      accountType: 'daily',
      packageId: '',
      collectorId: '',
      isClosed: false,
      status: 'active',
      password: ''
    });

    // File state
    const [files, setFiles] = useState({
      profileImage: null,
      aadhar: null,
      pan: null
    });

    // File preview state
    const [filePreviews, setFilePreviews] = useState({
      profileImage: null,
      aadhar: null,
      pan: null
    });
  
    useEffect(() => {
      // viewCustomers is already called in Context on mount
    }, []);
    
    // Debounced search effect
    useEffect(() => {
      const timer = setTimeout(() => {
        setPage(0); // Reset to first page when search changes
      }, 300);
      
      return () => clearTimeout(timer);
    }, [searchTerm, statusFilter, accountTypeFilter, collectorFilter]);
    
    // Memoized filtered and paginated data
    const filteredAndPaginatedData = useMemo(() => {
      if (!customers) return { paginatedData: [], totalCount: 0 };
      
      let filtered = customers.filter(customer => {
        const matchesSearch = !searchTerm || 
          customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone?.includes(searchTerm) ||
          customer.accountNumber?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
        const matchesAccountType = accountTypeFilter === 'all' || customer.accountType === accountTypeFilter;
        const matchesCollector = collectorFilter === 'all' || customer.collectorId?._id === collectorFilter;
        
        return matchesSearch && matchesStatus && matchesAccountType && matchesCollector;
      });
      
      const totalCount = filtered.length;
      const startIndex = page * rowsPerPage;
      const paginatedData = filtered.slice(startIndex, startIndex + rowsPerPage);
      
      return { paginatedData, totalCount };
    }, [customers, searchTerm, statusFilter, accountTypeFilter, collectorFilter, page, rowsPerPage]);
  
    // Memoize the handleInputChange to prevent re-creation on every render
    const handleInputChange = useCallback((e) => {
      const { name, value, type, checked } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }, []);

    // Memoize handleFileChange to prevent re-creation
    const handleFileChange = useCallback((e, fieldName) => {
      const file = e.target.files[0];
      if (file) {
        setFiles(prev => ({
          ...prev,
          [fieldName]: file
        }));

        // Create preview for images
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setFilePreviews(prev => ({
              ...prev,
              [fieldName]: e.target.result
            }));
          };
          reader.readAsDataURL(file);
        }
      }
    }, []);
    
    // Handle pagination change
    const handleChangePage = useCallback((event, newPage) => {
      setPage(newPage);
    }, []);
    
    const handleChangeRowsPerPage = useCallback((event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    }, []);
    
    // Handle search input change
    const handleSearchChange = useCallback((event) => {
      setSearchTerm(event.target.value);
    }, []);
    
    // Clear search and filters
    const clearFilters = useCallback(() => {
      setSearchTerm('');
      setStatusFilter('all');
      setAccountTypeFilter('all');
      setCollectorFilter('all');
      setPage(0);
    }, []);
  
    // Reset form
    const resetForm = useCallback(() => {
      setFormData({
        name: '',
        email: '',
        phone: '',
        gender: 'Other',
        dob: '',
        address: '',
        accountNumber: '',
        accountType: 'daily',
        packageId: '',
        collectorId: '',
        isClosed: false,
        status: 'active',
        password: ''
      });
      setFiles({
        profileImage: null,
        aadhar: null,
        pan: null
      });
      setFilePreviews({
        profileImage: null,
        aadhar: null,
        pan: null
      });
      setError('');
      setSuccess('');
    }, []);
  
    // Handle Add Customer
    const handleAddCustomer = useCallback(async () => {
      setLoading(true);
      setError('');
  
      try {
        // Form validation
        if (!formData.name || !formData.phone || !formData.address ||!formData.email ||!formData.password || !formData.accountNumber || !formData.packageId || !formData.collectorId) {
          setError('Please fill in all required fields');
          setLoading(false);
          return;
        }
  
        const result = await addCustomer(formData, files);
  
        if (result.success) {
          setSuccess('Customer added successfully!');
          setOpenAddModal(false);
          resetForm();
        } else {
          setError(result.message || 'Failed to add Customer');
        }
      } catch (err) {
        setError('Failed to add Customer. Please try again.');
      } finally {
        setLoading(false);
      }
    }, [formData, files, addCustomer, resetForm]);
  
    // Handle Edit Customer
    const handleEditCustomer = useCallback(async () => {
      setLoading(true);
      setError('');
  
      try {
         // Form validation
         if (!formData.name || !formData.phone || !formData.address || !formData.accountNumber || !formData.packageId || !formData.collectorId) {
          setError('Please fill in all required fields');
          setLoading(false);
          return;
        }
  
        const result = await updateCustomer(selectedCustomer._id, formData, files);
  
        if (result.success) {
          setSuccess('Customer updated successfully!');
          setOpenEditModal(false);
          resetForm();
          setSelectedCustomer(null);
        } else {
          setError(result.message || 'Failed to update Customer');
        }
      } catch (err) {
        setError('Failed to update Customer. Please try again.');
      } finally {
        setLoading(false);
      }
    }, [formData, files, selectedCustomer, updateCustomer, resetForm]);
  
    // Handle Delete Customer
    const handleDeleteCustomer = useCallback(async () => {
      setLoading(true);
      setError('');
  
      try {
        const result = await deleteCustomer(selectedCustomer._id);
  
        if (result.success) {
          setSuccess('Customer deleted successfully!');
          setOpenDeleteModal(false);
          setSelectedCustomer(null);
        } else {
          setError(result.message || 'Failed to delete Customer');
        }
      } catch (err) {
        setError('Failed to delete Customer. Please try again.');
      } finally {
        setLoading(false);
      }
    }, [selectedCustomer, deleteCustomer]);
  
    // Open Add Modal
    const openAddDialog = useCallback(() => {
      resetForm();
      setOpenAddModal(true);
    }, [resetForm]);
  
    // Open Edit Modal
    const openEditDialog = useCallback((customer) => {
      setSelectedCustomer(customer);
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        gender: customer.gender || 'Other',
        dob: customer.dob ? moment(customer.dob).format('YYYY-MM-DD') : '',
        address: customer.address || '',
        accountNumber: customer.accountNumber || '',
        accountType: customer.accountType || 'daily',
        packageId: customer.packageId?._id || '',
        collectorId: customer.collectorId?._id || '',
        isClosed: customer.isClosed !== undefined ? customer.isClosed : false,
        status: customer.status || 'active'
      });
      // Reset file states for edit
      setFiles({
        profileImage: null,
        aadhar: null,
        pan: null
      });
      setFilePreviews({
        profileImage: customer.profileImage || null,
        aadhar: null,
        pan: null
      });
      setOpenEditModal(true);
    }, []);
  
    // Open Delete Modal
    const openDeleteDialog = useCallback((customer) => {
      setSelectedCustomer(customer);
      setOpenDeleteModal(true);
    }, []);

    // Memoize CustomerFormContent to prevent re-renders
    const CustomerFormContent = useMemo(() => (
      <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        
        {/* Personal Information Section */}
        <Card sx={{ mb: 3, elevation: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
              Personal Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <StyledFormControl fullWidth variant="outlined">
                  <InputLabel>Gender</InputLabel>
                  <Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    label="Gender"
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </StyledFormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  label="Date of Birth"
                  name="dob"
                  type="date"
                  value={formData.dob}
                  onChange={handleInputChange}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

{!selectedCustomer && (
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  label="password"
                  name="password"
                  type="text"
                  value={formData.password}
                  onChange={handleInputChange}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            )}
              
              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  label="Address"
                  name="address"
                  multiline
                  rows={3}
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        
        {/* Account Information Section */}
        <Card sx={{ mb: 3, elevation: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
              Account Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  label="Account Number"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <StyledFormControl fullWidth variant="outlined">
                  <InputLabel>Account Type</InputLabel>
                  <Select
                    name="accountType"
                    value={formData.accountType}
                    onChange={handleInputChange}
                    label="Account Type"
                  >
                    <MenuItem value="daily">Daily Collection</MenuItem>
                    <MenuItem value="weekly">Weekly Collection</MenuItem>
                    <MenuItem value="monthly">Monthly Collection</MenuItem>
                  </Select>
                </StyledFormControl>
              </Grid>
              
              <Grid item xs={12}>
                <StyledFormControl fullWidth variant="outlined">
                  <InputLabel>Pigmy Plan *</InputLabel>
                  <Select
                    name="packageId"
                    value={formData.packageId}
                    onChange={handleInputChange}
                    label="Pigmy Plan *"
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                        },
                      },
                    }}
                  >
                    {pigmyPlans?.map((plan) => (
                      <MenuItem key={plan._id} value={plan._id}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {plan.plan_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ₹{plan.deposit_amount} {plan.deposit_frequency} | {plan.interest_rate}% Interest
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </StyledFormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <StyledFormControl fullWidth variant="outlined">
                  <InputLabel>Assigned Collector *</InputLabel>
                  <Select
                    name="collectorId"
                    value={formData.collectorId}
                    onChange={handleInputChange}
                    label="Assigned Collector *"
                  >
                    {collectors?.map((collector) => (
                      <MenuItem key={collector._id} value={collector._id}>
                        {collector.name}
                      </MenuItem>
                    ))}
                  </Select>
                </StyledFormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <StyledFormControl fullWidth variant="outlined">
                  <InputLabel>Account Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    label="Account Status"
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="suspended">Suspended</MenuItem>
                  </Select>
                </StyledFormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isClosed}
                      onChange={handleInputChange}
                      name="isClosed"
                      color="error"
                    />
                  }
                  label="Mark Account as Closed"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        
        {/* Document Upload Section */}
        <Card sx={{ elevation: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
              Document Upload
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <FileUploadField
                  label="Profile Image"
                  fieldName="profileImage"
                  accept="image/*"
                  icon={<PhotoCameraIcon color="primary" />}
                  files={files}
                  filePreviews={filePreviews}
                  handleFileChange={handleFileChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FileUploadField
                  label="Aadhar Document"
                  fieldName="aadhar"
                  accept="image/*,.pdf"
                  icon={<AttachFileIcon color="primary" />}
                  files={files}
                  filePreviews={filePreviews}
                  handleFileChange={handleFileChange}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <FileUploadField
                  label="PAN Document"
                  fieldName="pan"
                  accept="image/*,.pdf"
                  icon={<AttachFileIcon color="primary" />}
                  files={files}
                  filePreviews={filePreviews}
                  handleFileChange={handleFileChange}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </DialogContent>
    ), [formData, handleInputChange, files, filePreviews, handleFileChange, error, success, pigmyPlans, collectors]);

    // Show loading skeleton while data is being fetched
    if (tableLoading) {
      return (
        <Box sx={{ p: 3 }}>
          <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" width="100%" height={400} />
        </Box>
      );
    }

    return (
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
        {/* Header */}
        <HeaderContainer>
          <Typography variant="h4" component="h1" sx={{ 
            fontWeight: 700, 
            color: 'primary.main',
            fontSize: { xs: '1.75rem', md: '2.25rem' }
          }}>
            Customer Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            onClick={openAddDialog}
            sx={{ 
              minWidth: { xs: '100%', sm: 'auto' },
              py: 1.5,
              px: 3,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            Add New Customer
          </Button>
        </HeaderContainer>

        {/* Search and Filter Controls */}
        <SearchFilterContainer>
          <StyledTextField
            placeholder="Search customers..."
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ 
              minWidth: { xs: '100%', sm: 300 },
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'background.paper'
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setSearchTerm('')}
                    size="small"
                    edge="end"
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            endIcon={showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={() => setShowFilters(!showFilters)}
            sx={{ 
              minWidth: { xs: '100%', sm: 'auto' },
              textTransform: 'none'
            }}
          >
            Filters
          </Button>
          
          {(searchTerm || statusFilter !== 'all' || accountTypeFilter !== 'all' || collectorFilter !== 'all') && (
            <Button
              variant="text"
              color="error"
              onClick={clearFilters}
              startIcon={<ClearIcon />}
              sx={{ textTransform: 'none' }}
            >
              Clear All
            </Button>
          )}
        </SearchFilterContainer>

        {/* Filter Controls */}
        <Collapse in={showFilters}>
          <Card sx={{ mb: 2, p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <StyledFormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="suspended">Suspended</MenuItem>
                  </Select>
                </StyledFormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <StyledFormControl fullWidth size="small">
                  <InputLabel>Account Type</InputLabel>
                  <Select
                    value={accountTypeFilter}
                    onChange={(e) => setAccountTypeFilter(e.target.value)}
                    label="Account Type"
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                  </Select>
                </StyledFormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <StyledFormControl fullWidth size="small">
                  <InputLabel>Collector</InputLabel>
                  <Select
                    value={collectorFilter}
                    onChange={(e) => setCollectorFilter(e.target.value)}
                    label="Collector"
                  >
                    <MenuItem value="all">All Collectors</MenuItem>
                    {collectors?.map((collector) => (
                      <MenuItem key={collector._id} value={collector._id}>
                        {collector.name}
                      </MenuItem>
                    ))}
                  </Select>
                </StyledFormControl>
              </Grid>
            </Grid>
          </Card>
        </Collapse>

        {/* Results Summary */}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredAndPaginatedData.paginatedData.length} of {filteredAndPaginatedData.totalCount} customers
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {searchTerm && (
              <Chip
                label={`Search: "${searchTerm}"`}
                onDelete={() => setSearchTerm('')}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {statusFilter !== 'all' && (
              <Chip
                label={`Status: ${statusFilter}`}
                onDelete={() => setStatusFilter('all')}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {accountTypeFilter !== 'all' && (
              <Chip
                label={`Type: ${accountTypeFilter}`}
                onDelete={() => setAccountTypeFilter('all')}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
        </Box>

        {/* Table */}
        <TableContainer 
          component={Paper} 
          sx={{ 
            borderRadius: 2, 
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <StyledTableCell>Photo</StyledTableCell>
                <StyledTableCell>Personal Info</StyledTableCell>
                <StyledTableCell>Account Details</StyledTableCell>
                <StyledTableCell>Plan & Collector</StyledTableCell>
                <StyledTableCell>Dates</StyledTableCell>
                <StyledTableCell>Financial Info</StyledTableCell>
                <StyledTableCell>Documents</StyledTableCell>
                <StyledTableCell>Status</StyledTableCell>
                <StyledTableCell align="center">Actions</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                // Show skeleton rows while loading
                Array.from({ length: rowsPerPage }).map((_, index) => (
                  <TableRowSkeleton key={index} columns={8} />
                ))
              ) : filteredAndPaginatedData.paginatedData.length === 0 ? (
                <StyledTableRow>
                  <StyledTableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No customers found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {searchTerm || statusFilter !== 'all' || accountTypeFilter !== 'all' || collectorFilter !== 'all'
                        ? "Try adjusting your search criteria or filters"
                        : "Add your first customer to get started"}
                    </Typography>
                  </StyledTableCell>
                </StyledTableRow>
              ) : (
                filteredAndPaginatedData.paginatedData.map((customer) => (
                  <CustomerTableRow
                    key={customer._id}
                    customer={customer}
                    host={host}
                    onEdit={openEditDialog}
                    onDelete={openDeleteDialog}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {filteredAndPaginatedData.totalCount > 0 && (
          <TablePagination
            component="div"
            count={filteredAndPaginatedData.totalCount}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 25, 50, 100]}
            sx={{
              borderTop: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper'
            }}
          />
        )}

        {/* Add Customer Dialog */}
        <ResponsiveDialog
          open={openAddModal}
          onClose={() => {
            setOpenAddModal(false);
            resetForm();
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ 
            fontSize: '1.5rem', 
            fontWeight: 700, 
            color: 'primary.main',
            borderBottom: '1px solid',
            borderColor: 'divider',
            pb: 2
          }}>
            Add New Customer
          </DialogTitle>
          
          {CustomerFormContent}
          
          <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button
              onClick={() => {
                setOpenAddModal(false);
                resetForm();
              }}
              sx={{ textTransform: 'none', px: 3 }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddCustomer}
              variant="contained"
              disabled={loading}
              sx={{ 
                textTransform: 'none', 
                px: 3,
                minWidth: 120
              }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Add Customer'}
            </Button>
          </DialogActions>
        </ResponsiveDialog>

        {/* Edit Customer Dialog */}
        <ResponsiveDialog
          open={openEditModal}
          onClose={() => {
            setOpenEditModal(false);
            resetForm();
            setSelectedCustomer(null);
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ 
            fontSize: '1.5rem', 
            fontWeight: 700, 
            color: 'primary.main',
            borderBottom: '1px solid',
            borderColor: 'divider',
            pb: 2
          }}>
            Edit Customer - {selectedCustomer?.name}
          </DialogTitle>
          
          {CustomerFormContent}
          
          <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button
              onClick={() => {
                setOpenEditModal(false);
                resetForm();
                setSelectedCustomer(null);
              }}
              sx={{ textTransform: 'none', px: 3 }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditCustomer}
              variant="contained"
              disabled={loading}
              sx={{ 
                textTransform: 'none', 
                px: 3,
                minWidth: 120
              }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Update Customer'}
            </Button>
          </DialogActions>
        </ResponsiveDialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={openDeleteModal}
          onClose={() => {
            setOpenDeleteModal(false);
            setSelectedCustomer(null);
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ color: 'error.main', fontWeight: 600 }}>
            Confirm Delete
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              Are you sure you want to delete the customer <strong>{selectedCustomer?.name}</strong>?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This action cannot be undone. All associated data will be permanently removed.
            </Typography>
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
              onClick={() => {
                setOpenDeleteModal(false);
                setSelectedCustomer(null);
              }}
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteCustomer}
              variant="contained"
              color="error"
              disabled={loading}
              sx={{ 
                textTransform: 'none',
                minWidth: 100
              }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success/Error Snackbar could be added here if needed */}
      </Box>
    );
}
