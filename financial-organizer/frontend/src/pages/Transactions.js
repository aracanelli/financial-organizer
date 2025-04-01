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
    merchant_name: '',
    transaction_type: 'purchase',
    category: 'other',
    date: new Date().toISOString().split('T')[0],
    card_id: ''
  });

  const TRANSACTION_TYPES = [
    { value: 'purchase', label: 'Purchase' },
    { value: 'payment', label: 'Payment' },
    { value: 'refund', label: 'Refund' }
  ];

  const CATEGORIES = [
    { value: 'groceries', label: 'Groceries' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    fetchTransactions();
    fetchCards();
    
    // Clean and reset form data
    resetFormData();
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
      
      // Add debugging
      console.log('Opening dialog to edit transaction:', transaction);
      
      // Make sure transaction_type and category are always lowercase
      setFormData({
        amount: transaction.amount,
        description: transaction.description,
        transaction_type: String(transaction.transaction_type).toLowerCase(),
        category: String(transaction.category).toLowerCase(),
        merchant_name: transaction.merchant_name,
        date: transactionDate,
        card_id: transaction.card_id
      });
      setSelectedTransaction(transaction);
    } else {
      // Reset form for adding new transaction
      // Ensure card_id is set to a number if cards are available
      const defaultCardId = cards.length > 0 ? cards[0].id : '';
      
      // Add debugging
      console.log('Opening dialog to add new transaction, using default card_id:', defaultCardId);
      
      setFormData({
        amount: '',
        description: '',
        transaction_type: 'purchase', // Ensure lowercase
        category: 'other', // Ensure lowercase
        merchant_name: '',
        date: new Date().toISOString().split('T')[0],
        card_id: defaultCardId
      });
    }
    
    setDialogMode(mode);
    setOpenDialog(true);
    
    // Debug form state after setting
    setTimeout(() => {
      console.log('Form state after dialog open:', formData);
    }, 100);
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
    } 
    // Special handling for transaction_type and category to ensure lowercase
    else if (name === 'transaction_type' || name === 'category') {
      setFormData({
        ...formData,
        [name]: String(value).toLowerCase()
      });
      console.log(`Set ${name} to lowercase: ${String(value).toLowerCase()}`);
    }
    else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Debug the change
    console.log(`Form field ${name} changed to:`, value);
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

      // Generate date with specific time
      const currentDate = new Date(formData.date);
      currentDate.setHours(0, 0, 0, 0);

      // Format the payload with the proper date format - FORCE lowercase values
      const payload = {
        amount: parseFloat(formData.amount),
        description: formData.description,
        merchant_name: formData.merchant_name,
        transaction_type: String(formData.transaction_type).toLowerCase(), 
        category: String(formData.category).toLowerCase(),
        card_id: parseInt(formData.card_id, 10), 
        date: currentDate.toISOString(),
        plaid_transaction_id: dialogMode === 'add' ? `manual-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` : formData.plaid_transaction_id || null
      };

      console.log('⭐ DEBUG - Sending transaction payload:', JSON.stringify(payload, null, 2));

      let response;
      if (dialogMode === 'add') {
        try {
          response = await axios.post('/api/transactions/', payload);
          console.log('✅ Server response:', response.data);
          setSnackbar({
            open: true,
            message: 'Transaction added successfully',
            severity: 'success'
          });
        } catch (postError) {
          console.error('❌ POST error:', postError);
          console.error('❌ Response data:', postError.response?.data);
          console.error('❌ Response status:', postError.response?.status);
          throw postError; // Re-throw to be caught by the outer catch
        }
      } else {
        try {
          response = await axios.put(`/api/transactions/${selectedTransaction.id}`, payload);
          console.log('✅ Server response:', response.data);
          setSnackbar({
            open: true,
            message: 'Transaction updated successfully',
            severity: 'success'
          });
        } catch (putError) {
          console.error('❌ PUT error:', putError);
          console.error('❌ Response data:', putError.response?.data);
          console.error('❌ Response status:', putError.response?.status);
          throw putError; // Re-throw to be caught by the outer catch
        }
      }

      handleCloseDialog();
      fetchTransactions();
    } catch (err) {
      console.error('❌ Error saving transaction:', err);
      console.error('❌ Error response data:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      
      // Display more detailed error messages from the API if available
      let errorMessage = 'Unknown error occurred';
      
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (typeof err.response?.data === 'string') {
        errorMessage = err.response.data;
      } else if (err.message) {
        errorMessage = err.message;
      } else {
        errorMessage = `Failed to ${dialogMode === 'add' ? 'add' : 'update'} transaction`;
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  // Function to test transaction creation with minimal data
  const testTransactionCreation = async () => {
    try {
      console.log('🧪 RUNNING TEST: Creating test transaction with minimal data');
      
      // Get first card ID if available
      const cardId = cards.length > 0 ? cards[0].id : null;
      
      if (!cardId) {
        console.error('❌ TEST FAILED: No cards available for testing');
        setSnackbar({
          open: true,
          message: 'Test failed: No cards available for testing. Please add a card first.',
          severity: 'error'
        });
        return;
      }
      
      // Create a minimal test transaction with LOWERCASE types
      const testPayload = {
        amount: 10.99,
        description: 'Test Transaction',
        merchant_name: 'Test Store',
        transaction_type: 'purchase', // Ensure lowercase
        category: 'other', // Ensure lowercase
        card_id: parseInt(cardId, 10), // Ensure it's a number
        date: new Date().toISOString(),
        plaid_transaction_id: `test-${Date.now()}` // Ensure unique
      };
      
      console.log('🧪 TEST PAYLOAD:', JSON.stringify(testPayload, null, 2));
      
      try {
        const response = await axios.post('/api/transactions/', testPayload);
        console.log('✅ TEST SUCCESSFUL:', response.data);
        
        setSnackbar({
          open: true,
          message: 'Test transaction created successfully!',
          severity: 'success'
        });
        
        // Refresh transactions list
        fetchTransactions();
        
      } catch (error) {
        console.error('❌ TEST FAILED:', error);
        console.error('❌ TEST ERROR RESPONSE:', error.response?.data);
        console.error('❌ TEST ERROR STATUS:', error.response?.status);
        
        let errorMessage = 'Test transaction creation failed';
        
        // Extract validation errors if any
        if (error.response?.data?.detail && Array.isArray(error.response.data.detail)) {
          errorMessage = 'Validation errors:';
          error.response.data.detail.forEach(err => {
            const fieldName = err.loc.slice(1).join('.');
            errorMessage += `\n- ${fieldName}: ${err.msg}`;
            console.error(`❌ VALIDATION ERROR: ${fieldName}: ${err.msg}`);
          });
        } else if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error'
        });
      }
    } catch (err) {
      console.error('❌ TEST EXECUTION FAILED:', err);
      setSnackbar({
        open: true,
        message: 'Test execution failed with unexpected error',
        severity: 'error'
      });
    }
  };
  
  // Function to create a very minimal transaction
  const testVeryMinimalTransaction = async () => {
    try {
      console.log('🧪 RUNNING MINIMAL TEST: Creating absolutely minimal transaction');
      
      // Get first card ID if available
      const cardId = cards.length > 0 ? cards[0].id : null;
      
      if (!cardId) {
        console.error('❌ MINIMAL TEST FAILED: No cards available for testing');
        return;
      }
      
      // Create the most minimal transaction possible with LOWERCASE types
      const minimalPayload = {
        amount: 5.99,
        description: 'Minimal Test',
        merchant_name: 'Test Merchant',
        transaction_type: 'purchase', // Ensure lowercase
        category: 'other', // Ensure lowercase
        card_id: parseInt(cardId, 10), // Ensure it's a number
        date: new Date().toISOString(),
        plaid_transaction_id: `minimal-${Date.now()}`
      };
      
      console.log('🧪 MINIMAL PAYLOAD:', JSON.stringify(minimalPayload, null, 2));
      
      const response = await axios.post('/api/transactions/', minimalPayload);
      console.log('✅ MINIMAL TEST SUCCESSFUL:', response.data);
      
      fetchTransactions(); // Refresh the list
      
      setSnackbar({
        open: true,
        message: 'Minimal test transaction created successfully!',
        severity: 'success'
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ MINIMAL TEST FAILED:', error);
      console.error('❌ MINIMAL TEST ERROR DETAILS:', error.response?.data);
      
      let errorMessage = 'Minimal test failed';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
      
      throw error;
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

  // Return a color based on transaction type (if this function exists in this file)
  const getTransactionTypeColor = (type) => {
    switch (type) {
      case 'purchase':
        return 'error';  // red
      case 'refund':
        return 'success';  // green
      case 'payment':
        return 'warning';  // orange
      default:
        return 'default';
    }
  };

  // Return a color based on category (if this function exists in this file)
  const getCategoryColor = (category) => {
    switch (category) {
      case 'groceries':
        return 'primary';
      case 'utilities':
        return 'secondary';
      case 'entertainment':
        return 'info';
      case 'transportation':
        return 'warning';
      case 'shopping':
        return 'error';
      default:
        return 'default';
    }
  };

  // Function to reset form data to default values with proper lowercase types
  const resetFormData = () => {
    setFormData({
      amount: '',
      description: '',
      merchant_name: '',
      transaction_type: 'purchase', // Lowercase value
      category: 'other', // Lowercase value
      date: new Date().toISOString().split('T')[0],
      card_id: ''
    });
    console.log('Form data reset to defaults with lowercase values');
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          Transactions
        </Typography>
        <Box>
          <Button
            variant="outlined"
            color="secondary"
            onClick={testTransactionCreation}
            sx={{ mr: 2 }}
          >
            Test API
          </Button>
          <Button
            variant="outlined"
            color="warning"
            onClick={testVeryMinimalTransaction}
            sx={{ mr: 2 }}
          >
            Minimal Test
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('add')}
          >
            Add Transaction
          </Button>
        </Box>
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
                    color: getTransactionTypeColor(transaction.transaction_type)
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
              {TRANSACTION_TYPES.map((option) => (
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
              {CATEGORIES.map((option) => (
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
          <Button 
            onClick={() => console.log("Form data before submit:", JSON.stringify(formData, null, 2))} 
            color="info"
          >
            Debug
          </Button>
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