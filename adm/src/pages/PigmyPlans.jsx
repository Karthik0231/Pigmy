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
  Box,
  Typography,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel
} from '@mui/material';
import { tableCellClasses } from '@mui/material/TableCell';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { AdminContext } from '../Context/Context';

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

export default function PigmyPlans() {
  const { pigmyPlans, viewPigmyPlans, addPigmyPlan, updatePigmyPlan, deletePigmyPlan } = useContext(AdminContext);

  // State management
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form data state
  const [formData, setFormData] = useState({
    plan_name: '',
    deposit_frequency: 'daily', // Default frequency
    deposit_amount: '',
    duration_months: '',
    interest_rate: '',
    maturity_amount: '',
    is_active: true
  });

  useEffect(() => {
    viewPigmyPlans();
  }, []); // Fetch plans on component mount

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      plan_name: '',
      deposit_frequency: 'daily',
      deposit_amount: '',
      duration_months: '',
      interest_rate: '',
      maturity_amount: '',
      is_active: true
    });
    setError('');
    setSuccess('');
  };

  // Handle Add Plan
  const handleAddPlan = async () => {
    setLoading(true);
    setError('');

    try {
      // Form validation
      if (!formData.plan_name || !formData.deposit_frequency || !formData.deposit_amount || !formData.duration_months || !formData.interest_rate || !formData.maturity_amount) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Convert numeric fields to numbers
      const dataToSend = {
        ...formData,
        deposit_amount: parseFloat(formData.deposit_amount),
        duration_months: parseInt(formData.duration_months, 10),
        interest_rate: parseFloat(formData.interest_rate),
        maturity_amount: parseFloat(formData.maturity_amount),
      };

      const result = await addPigmyPlan(dataToSend);

      if (result.success) {
        setSuccess('Pigmy Plan added successfully!');
        setOpenAddModal(false);
        resetForm();
      } else {
        setError(result.message || 'Failed to add Pigmy Plan');
      }
    } catch (err) {
      setError('Failed to add Pigmy Plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Edit Plan
  const handleEditPlan = async () => {
    setLoading(true);
    setError('');

    try {
       // Form validation
       if (!formData.plan_name || !formData.deposit_frequency || !formData.deposit_amount || !formData.duration_months || !formData.interest_rate || !formData.maturity_amount) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Convert numeric fields to numbers
      const dataToSend = {
        ...formData,
        deposit_amount: parseFloat(formData.deposit_amount),
        duration_months: parseInt(formData.duration_months, 10),
        interest_rate: parseFloat(formData.interest_rate),
        maturity_amount: parseFloat(formData.maturity_amount),
      };


      const result = await updatePigmyPlan(selectedPlan._id, dataToSend);

      if (result.success) {
        setSuccess('Pigmy Plan updated successfully!');
        setOpenEditModal(false);
        resetForm();
        setSelectedPlan(null);
      } else {
        setError(result.message || 'Failed to update Pigmy Plan');
      }
    } catch (err) {
      setError('Failed to update Pigmy Plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete Plan
  const handleDeletePlan = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await deletePigmyPlan(selectedPlan._id);

      if (result.success) {
        setSuccess('Pigmy Plan deleted successfully!');
        setOpenDeleteModal(false);
        setSelectedPlan(null);
      } else {
        setError(result.message || 'Failed to delete Pigmy Plan');
      }
    } catch (err) {
      setError('Failed to delete Pigmy Plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Open Edit Modal
  const openEditDialog = (plan) => {
    setSelectedPlan(plan);
    setFormData({
      plan_name: plan.plan_name || '',
      deposit_frequency: plan.deposit_frequency || 'daily',
      deposit_amount: plan.deposit_amount || '',
      duration_months: plan.duration_months || '',
      interest_rate: plan.interest_rate || '',
      maturity_amount: plan.maturity_amount || '',
      is_active: plan.is_active !== undefined ? plan.is_active : true
    });
    setOpenEditModal(true);
  };

  // Open Delete Modal
  const openDeleteDialog = (plan) => {
    setSelectedPlan(plan);
    setOpenDeleteModal(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <HeaderContainer>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Pigmy Plans Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddCircleOutlineIcon />}
          onClick={() => setOpenAddModal(true)}
          size="large"
        >
          Add New Plan
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
        <Table sx={{ minWidth: 800 }} aria-label="pigmy plans table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Plan Name</StyledTableCell>
              <StyledTableCell>Frequency</StyledTableCell>
              <StyledTableCell align="right">Deposit Amount</StyledTableCell>
              <StyledTableCell align="right">Duration (Months)</StyledTableCell>
              <StyledTableCell align="right">Interest Rate (%)</StyledTableCell>
              <StyledTableCell align="right">Maturity Amount</StyledTableCell>
              <StyledTableCell>Active</StyledTableCell>
              <StyledTableCell align="center">Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pigmyPlans && pigmyPlans.length > 0 ? (
              pigmyPlans.map((plan) => (
                <StyledTableRow key={plan._id}>
                  <StyledTableCell component="th" scope="row">
                    <Typography variant="body1" fontWeight="medium">
                      {plan.plan_name}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell>{plan.deposit_frequency}</StyledTableCell>
                  <StyledTableCell align="right">{plan.deposit_amount.toFixed(2)}</StyledTableCell>
                  <StyledTableCell align="right">{plan.duration_months}</StyledTableCell>
                  <StyledTableCell align="right">{plan.interest_rate.toFixed(2)}</StyledTableCell>
                  <StyledTableCell align="right">{plan.maturity_amount.toFixed(2)}</StyledTableCell>
                  <StyledTableCell>
                    <Chip
                      label={plan.is_active ? 'Yes' : 'No'}
                      color={plan.is_active ? 'success' : 'error'}
                      size="small"
                    />
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <IconButton
                        color="primary"
                        onClick={() => openEditDialog(plan)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => openDeleteDialog(plan)}
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
                    No Pigmy Plans found
                  </Typography>
                </StyledTableCell>
              </StyledTableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Plan Modal */}
      <Dialog open={openAddModal} onClose={() => { setOpenAddModal(false); resetForm(); }} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Pigmy Plan</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              fullWidth
              label="Plan Name"
              name="plan_name"
              value={formData.plan_name}
              onChange={handleInputChange}
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Deposit Frequency</InputLabel>
              <Select
                name="deposit_frequency"
                value={formData.deposit_frequency}
                onChange={handleInputChange}
                label="Deposit Frequency"
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Deposit Amount"
              name="deposit_amount"
              type="number"
              value={formData.deposit_amount}
              onChange={handleInputChange}
              required
              inputProps={{ min: 1 }}
            />
            <TextField
              fullWidth
              label="Duration (Months)"
              name="duration_months"
              type="number"
              value={formData.duration_months}
              onChange={handleInputChange}
              required
              inputProps={{ min: 1 }}
            />
            <TextField
              fullWidth
              label="Interest Rate (%)"
              name="interest_rate"
              type="number"
              value={formData.interest_rate}
              onChange={handleInputChange}
              required
              inputProps={{ min: 0, step: 0.01 }}
            />
             <TextField
              fullWidth
              label="Maturity Amount"
              name="maturity_amount"
              type="number"
              value={formData.maturity_amount}
              onChange={handleInputChange}
              required
              inputProps={{ min: 1 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  name="is_active"
                  color="primary"
                />
              }
              label="Is Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenAddModal(false); resetForm(); }}>Cancel</Button>
          <Button
            onClick={handleAddPlan}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Add Plan'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Plan Modal */}
      <Dialog open={openEditModal} onClose={() => { setOpenEditModal(false); resetForm(); setSelectedPlan(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Pigmy Plan</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
             <TextField
              fullWidth
              label="Plan Name"
              name="plan_name"
              value={formData.plan_name}
              onChange={handleInputChange}
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Deposit Frequency</InputLabel>
              <Select
                name="deposit_frequency"
                value={formData.deposit_frequency}
                onChange={handleInputChange}
                label="Deposit Frequency"
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Deposit Amount"
              name="deposit_amount"
              type="number"
              value={formData.deposit_amount}
              onChange={handleInputChange}
              required
              inputProps={{ min: 1 }}
            />
            <TextField
              fullWidth
              label="Duration (Months)"
              name="duration_months"
              type="number"
              value={formData.duration_months}
              onChange={handleInputChange}
              required
              inputProps={{ min: 1 }}
            />
            <TextField
              fullWidth
              label="Interest Rate (%)"
              name="interest_rate"
              type="number"
              value={formData.interest_rate}
              onChange={handleInputChange}
              required
              inputProps={{ min: 0, step: 0.01 }}
            />
             <TextField
              fullWidth
              label="Maturity Amount"
              name="maturity_amount"
              type="number"
              value={formData.maturity_amount}
              onChange={handleInputChange}
              required
              inputProps={{ min: 1 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  name="is_active"
                  color="primary"
                />
              }
              label="Is Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenEditModal(false); resetForm(); setSelectedPlan(null); }}>Cancel</Button>
          <Button
            onClick={handleEditPlan}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Update Plan'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Plan Modal */}
      <Dialog open={openDeleteModal} onClose={() => { setOpenDeleteModal(false); setSelectedPlan(null); }}>
        <DialogTitle>Delete Pigmy Plan</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the plan "{selectedPlan?.plan_name}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenDeleteModal(false); setSelectedPlan(null); }}>Cancel</Button>
          <Button
            onClick={handleDeletePlan}
            variant="contained"
            color="error"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}