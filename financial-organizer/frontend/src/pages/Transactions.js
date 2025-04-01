import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';

const Transactions = () => {
  const { currentUser } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [cards, setCards] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    transaction_type: 'PURCHASE',
    category: 'GROCERIES',
    merchant_name: '',
    date: new Date().toISOString().split('T')[0], // Use ISO format date string
    card_id: ''
  });

  const transactionTypes = [
    { value: 'PURCHASE', label: 'Purchase' },
    { value: 'PAYMENT', label: 'Payment' },
    { value: 'REFUND', label: 'Refund' }
  ];

  const categories = [
    { value: 'GROCERIES', label: 'Groceries' },
    { value: 'UTILITIES', label: 'Utilities' },
    { value: 'ENTERTAINMENT', label: 'Entertainment' },
    { value: 'TRANSPORTATION', label: 'Transportation' },
    { value: 'SHOPPING', label: 'Shopping' },
    { value: 'OTHER', label: 'Other' }
  ];

  useEffect(() => {
    fetchTransactions();
    fetchCards();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/transactions/');
      setTransactions(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCards = async () => {
    try {
      const response = await axios.get('/api/cards/');
      setCards(response.data);
    } catch (err) {
      console.error('Error fetching cards:', err);
    }
  };

  const handleOpenDialog = (mode, transaction = null) => {
    if (mode === 'edit' && transaction) {
      // Format the date to YYYY-MM-DD for the date input
      const transactionDate = new Date(transaction.date).toISOString().split('T')[0];
      
      setFormData({
        amount: transaction.amount,
        description: transaction.description,
        transaction_type: transaction.transaction_type,
        category: transaction.category,
        merchant_name: transaction.merchant_name,
        date: transactionDate,
        card_id: transaction.card_id
      });
      setSelectedTransaction(transaction);
    } else {
      // Reset form for adding new transaction
      // Ensure card_id is set to a number if cards are available
      const defaultCardId = cards.length > 0 ? cards[0].id : '';
      
      setFormData({
        amount: '',
        description: '',
        transaction_type: 'PURCHASE',
        category: 'GROCERIES',
        merchant_name: '',
        date: new Date().toISOString().split('T')[0],
        card_id: defaultCardId
      });
    }
    
    setDialogMode(mode);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle special case for card_id to ensure it's a number
    if (name === 'card_id') {
      setFormData({
        ...formData,
        [name]: value === '' ? '' : Number(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate form
      if (!formData.amount || !formData.description || !formData.merchant_name || !formData.card_id) {
        setSnackbar({
          open: true,
          message: 'Please fill all required fields',
          severity: 'error'
        });
        return;
      }

      // Format the payload with the proper date format
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        // Add datetime component to date string for proper ISO format
        date: new Date(formData.date + 'T00:00:00').toISOString()
      };

      console.log('Sending transaction payload:', payload);

      if (dialogMode === 'add') {
        await axios.post('/api/transactions/', payload);
        setSnackbar({
          open: true,
          message: 'Transaction added successfully',
          severity: 'success'
        });
      } else {
        await axios.put(`/api/transactions/${selectedTransaction.id}`, payload);
        setSnackbar({
          open: true,
          message: 'Transaction updated successfully',
          severity: 'success'
        });
      }

      handleCloseDialog();
      fetchTransactions();
    } catch (err) {
      console.error('Error saving transaction:', err);
      // Display more detailed error messages from the API if available
      const errorMessage = err.response?.data?.detail || `Failed to ${dialogMode === 'add' ? 'add' : 'update'} transaction`;
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await axios.delete(`/api/transactions/${id}`);
        setSnackbar({
          open: true,
          message: 'Transaction deleted successfully',
          severity: 'success'
        });
        fetchTransactions();
      } catch (err) {
        console.error('Error deleting transaction:', err);
        setSnackbar({
          open: true,
          message: 'Failed to delete transaction',
          severity: 'error'
        });
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          Transactions
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('add')}
        >
          Add Transaction
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      ) : transactions.length === 0 ? (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="body1" align="center">
              No transactions found. Add your first transaction!
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Merchant</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{formatDate(transaction.date)}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>{transaction.merchant_name}</TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell>{transaction.transaction_type}</TableCell>
                  <TableCell align="right" sx={{ 
                    color: transaction.transaction_type === 'REFUND' ? 'green' : 
                           transaction.transaction_type === 'PAYMENT' ? 'orange' : 'inherit'
                  }}>
                    ${transaction.amount.toFixed(2)}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton 
                      size="small" 
                      component={Link} 
                      to={`/transactions/${transaction.id}`}
                      title="View details"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleOpenDialog('edit', transaction)}
                      title="Edit"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDelete(transaction.id)}
                      title="Delete"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Transaction Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New Transaction' : 'Edit Transaction'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleInputChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Merchant Name"
              name="merchant_name"
              value={formData.merchant_name}
              onChange={handleInputChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              select
              label="Transaction Type"
              name="transaction_type"
              value={formData.transaction_type}
              onChange={handleInputChange}
            >
              {transactionTypes.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              margin="normal"
              required
              fullWidth
              select
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
            >
              {categories.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Transaction Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleInputChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              select
              label="Card"
              name="card_id"
              value={formData.card_id}
              onChange={handleInputChange}
            >
              {cards.map((card) => (
                <MenuItem key={card.id} value={card.id}>
                  {card.card_type} (...{card.last_four})
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {dialogMode === 'add' ? 'Add' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Transactions; 