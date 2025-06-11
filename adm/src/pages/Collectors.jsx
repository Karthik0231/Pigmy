import React, { useContext, useEffect, useState } from 'react';
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
  Avatar,
  Box,
  Typography,
  IconButton,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import { tableCellClasses } from '@mui/material/TableCell';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { AdminContext } from '../Context/Context';
import {config} from '../Config/Config';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: '#1976d2',
    color: theme.palette.common.white,
    fontWeight: 'bold',
    fontSize: '1rem',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    padding: '16px',
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
}));

export default function Collectors() {
  const { viewCollectors, collectors, addCollector, updateCollector, deleteCollector } = useContext(AdminContext);
  
  // State management
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedCollector, setSelectedCollector] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const {host} = config;
  
  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    status: 'active',
    image: null
  });

  useEffect(() => {
    viewCollectors();
  }, []); // Remove collectors dependency to avoid infinite loop

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file input
  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      image: e.target.files[0]
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      status: 'active',
      image: null
    });
    setError('');
    setSuccess('');
  };

  // Handle Add Collector
  const handleAddCollector = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Form validation
      if (!formData.name || !formData.email || !formData.phone || !formData.password) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('status', formData.status);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const result = await addCollector(formDataToSend);
      
      if (result.success) {
        setSuccess('Collector added successfully!');
        setOpenAddModal(false);
        resetForm();
      } else {
        setError(result.message || 'Failed to add collector');
      }
    } catch (err) {
      setError('Failed to add collector. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Edit Collector
  const handleEditCollector = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Form validation
      if (!formData.name || !formData.email || !formData.phone) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('status', formData.status);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const result = await updateCollector(selectedCollector._id, formDataToSend);
      
      if (result.success) {
        setSuccess('Collector updated successfully!');
        setOpenEditModal(false);
        resetForm();
        setSelectedCollector(null);
      } else {
        setError(result.message || 'Failed to update collector');
      }
    } catch (err) {
      setError('Failed to update collector. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete Collector
  const handleDeleteCollector = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await deleteCollector(selectedCollector._id);
      
      if (result.success) {
        setSuccess('Collector deleted successfully!');
        setOpenDeleteModal(false);
        setSelectedCollector(null);
      } else {
        setError(result.message || 'Failed to delete collector');
      }
    } catch (err) {
      setError('Failed to delete collector. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Open Edit Modal
  const openEditDialog = (collector) => {
    setSelectedCollector(collector);
    setFormData({
      name: collector.name || '',
      email: collector.email || '',
      phone: collector.phone || '',
      password: '',
      status: collector.status || 'active',
      image: null
    });
    setOpenEditModal(true);
  };

  // Open Delete Modal
  const openDeleteDialog = (collector) => {
    setSelectedCollector(collector);
    setOpenDeleteModal(true);
  };

  // Get status chip color
  const getStatusColor = (status) => {
    return status === 'active' ? 'success' : 'error';
  };

  // Get image URL
  const getImageUrl = (imageName) => {
    if (!imageName) return null;
    return `${host}${imageName}`;
  };

  console.log(collectors);

  return (
    <Box sx={{ p: 3,width: '100%'}}>
      {/* Header */}
      <HeaderContainer>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Collectors Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => setOpenAddModal(true)}
          size="large"
        >
          Add New Collector
        </Button>
      </HeaderContainer>

      {/* Success/Error Messages */}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Table */}
      <TableContainer component={Paper} elevation={3}>
        <Table sx={{ minWidth: 800 }} aria-label="collectors table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Profile</StyledTableCell>
              <StyledTableCell>Name</StyledTableCell>
              <StyledTableCell>Email</StyledTableCell>
              <StyledTableCell>Phone</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell>Joined</StyledTableCell>
              <StyledTableCell align="center">Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {collectors && collectors.length > 0 ? (
              collectors.map((collector) => (
                <StyledTableRow key={collector._id}>
                  <StyledTableCell>
                    <Avatar
                      src={`${host}/uploads/admin/${collector.image.replace(/\\/g, '/')}`}
                      alt={collector.name}
                      sx={{ width: 40, height: 40 }}
                    >
                      {collector.name ? collector.name.charAt(0).toUpperCase() : 'C'}
                    </Avatar>
                  </StyledTableCell>
                  <StyledTableCell component="th" scope="row">
                    <Typography variant="body1" fontWeight="medium">
                      {collector.name}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell>{collector.email}</StyledTableCell>
                  <StyledTableCell>{collector.phone}</StyledTableCell>
                  <StyledTableCell>
                    <Chip
                      label={collector.status}
                      color={getStatusColor(collector.status)}
                      size="small"
                    />
                  </StyledTableCell>
                  {/* <StyledTableCell>
                    {collector.assignedCustomers ? collector.assignedCustomers.length : 0}
                  </StyledTableCell> */}
                  <StyledTableCell>
                    {collector.createdAt ? new Date(collector.createdAt).toLocaleDateString() : 'N/A'}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <IconButton
                        color="primary"
                        onClick={() => openEditDialog(collector)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => openDeleteDialog(collector)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </StyledTableCell>
                </StyledTableRow>
              ))
            ) : (
              <StyledTableRow>
                <StyledTableCell colSpan={8} align="center">
                  <Typography variant="body1" color="textSecondary">
                    No collectors found
                  </Typography>
                </StyledTableCell>
              </StyledTableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Collector Modal */}
      <Dialog open={openAddModal} onClose={() => setOpenAddModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Collector</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                label="Status"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              type="file"
              label="Profile Image"
              InputLabelProps={{ shrink: true }}
              onChange={handleFileChange}
              inputProps={{ accept: 'image/*' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenAddModal(false); resetForm(); }}>Cancel</Button>
          <Button
            onClick={handleAddCollector}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Add Collector'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Collector Modal */}
      <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Collector</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                label="Status"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              type="file"
              label="Profile Image"
              InputLabelProps={{ shrink: true }}
              onChange={handleFileChange}
              inputProps={{ accept: 'image/*' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenEditModal(false); resetForm(); setSelectedCollector(null); }}>Cancel</Button>
          <Button
            onClick={handleEditCollector}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Update Collector'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete collector "{selectedCollector?.name}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenDeleteModal(false); setSelectedCollector(null); }}>Cancel</Button>
          <Button
            onClick={handleDeleteCollector}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}