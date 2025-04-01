import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as ProcessIcon,
} from '@mui/icons-material';
import api from '../api';
import RecurringTransactionForm from '../components/RecurringTransactionForm';

const formatDate = (dateString) => {
  if (!dateString) return 'None';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const getFrequencyLabel = (frequency) => {
  switch (frequency) {
    case 'daily': return 'Daily';
    case 'weekly': return 'Weekly';
    case 'biweekly': return 'Bi-weekly';
    case 'monthly': return 'Monthly';
    case 'quarterly': return 'Quarterly';
    case 'yearly': return 'Yearly';
    default: return frequency;
  }
};

const getStatusColor = (nextDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextDateObj = new Date(nextDate);
  nextDateObj.setHours(0, 0, 0, 0);
  
  // If next date is today or in the past, it's due
  if (nextDateObj <= today) {
    return 'error';
  }
  
  // If next date is within the next 7 days
  const sevenDaysFromNow = new Date(today);
  sevenDaysFromNow.setDate(today.getDate() + 7);
  if (nextDateObj <= sevenDaysFromNow) {
    return 'warning';
  }
  
  return 'success';
};

const RecurringTransactions = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingTransaction, setDeletingTransaction] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecurringTransactions();
  }, []);

  const fetchRecurringTransactions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/recurring-transactions/');
      setTransactions(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching recurring transactions:', err);
      setError('Failed to load recurring transactions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormOpen = () => {
    setEditingTransaction(null);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingTransaction(null);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction({
      ...transaction,
      start_date: new Date(transaction.start_date).toISOString().split('T')[0],
      end_date: transaction.end_date ? new Date(transaction.end_date).toISOString().split('T')[0] : '',
    });
    setFormOpen(true);
  };

  const handleDeleteClick = (transaction) => {
    setDeletingTransaction(transaction);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeletingTransaction(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/recurring-transactions/${deletingTransaction.id}`);
      setDeleteDialogOpen(false);
      setDeletingTransaction(null);
      fetchRecurringTransactions();
    } catch (error) {
      console.error('Error deleting recurring transaction:', error);
    }
  };

  const handleProcessTransaction = async (transaction) => {
    try {
      await api.post(`/recurring-transactions/${transaction.id}/process`);
      fetchRecurringTransactions();
    } catch (error) {
      console.error('Error processing recurring transaction:', error);
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingTransaction) {
        await api.put(`/recurring-transactions/${editingTransaction.id}`, values);
      } else {
        await api.post('/recurring-transactions/', values);
      }
      fetchRecurringTransactions();
    } catch (error) {
      console.error('Error saving recurring transaction:', error);
      throw error;
    }
  };

  if (loading && transactions.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error" variant="h6" gutterBottom>
          {error}
        </Typography>
        <Button variant="contained" onClick={fetchRecurringTransactions}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Recurring Transactions
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleFormOpen}
        >
          New Recurring Transaction
        </Button>
      </Box>

      {transactions.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="h6" align="center" gutterBottom>
              No recurring transactions found
            </Typography>
            <Typography variant="body2" align="center" color="textSecondary">
              Create your first recurring transaction to automate your regular financial activities.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Frequency</TableCell>
                <TableCell>Next Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.description || '(No description)'}</TableCell>
                  <TableCell align="right">${transaction.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    {transaction.transaction_type.charAt(0).toUpperCase() + transaction.transaction_type.slice(1)}
                  </TableCell>
                  <TableCell>
                    {transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}
                  </TableCell>
                  <TableCell>{getFrequencyLabel(transaction.frequency)}</TableCell>
                  <TableCell>
                    <Chip
                      label={formatDate(transaction.next_date)}
                      color={getStatusColor(transaction.next_date)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(transaction.end_date)}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEditTransaction(transaction)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Process Now">
                      <IconButton
                        size="small"
                        color="secondary"
                        onClick={() => handleProcessTransaction(transaction)}
                      >
                        <ProcessIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(transaction)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <RecurringTransactionForm
        open={formOpen}
        handleClose={handleFormClose}
        onSubmit={handleSubmit}
        initialValues={editingTransaction}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Recurring Transaction</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this recurring transaction?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RecurringTransactions; 