import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  CardMedia,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Receipt as ReceiptIcon,
  UploadFile as UploadFileIcon
} from '@mui/icons-material';

const TransactionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchTransactionDetails();
  }, [id]);

  const fetchTransactionDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching transaction details for ID:', id);
      const response = await axios.get(`/api/transactions/${id}`);
      console.log('Transaction details response:', response.data);
      setTransaction(response.data);
      
      // Fetch card details if card_id exists
      if (response.data.card_id) {
        const cardResponse = await axios.get(`/api/cards/${response.data.card_id}`);
        setCard(cardResponse.data);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching transaction details:', err);
      console.error('Error response data:', err.response?.data);
      console.error('Error status:', err.response?.status);
      setError('Failed to load transaction details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await axios.delete(`/api/transactions/${id}`);
        navigate('/transactions', { replace: true });
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

  const handleReceiptDialogOpen = () => {
    setReceiptDialogOpen(true);
  };

  const handleReceiptDialogClose = () => {
    setReceiptDialogOpen(false);
    setSelectedFile(null);
  };

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUploadReceipt = async () => {
    if (!selectedFile) {
      setSnackbar({
        open: true,
        message: 'Please select a file to upload',
        severity: 'error'
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('transaction_id', id);

    try {
      setUploading(true);
      await axios.post('/api/receipts/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSnackbar({
        open: true,
        message: 'Receipt uploaded successfully',
        severity: 'success'
      });
      
      handleReceiptDialogClose();
      fetchTransactionDetails();
    } catch (err) {
      console.error('Error uploading receipt:', err);
      setSnackbar({
        open: true,
        message: 'Failed to upload receipt',
        severity: 'error'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Return a color based on transaction type
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

  // Return a color based on category
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          component={Link}
          to="/transactions"
          sx={{ mt: 2 }}
        >
          Back to Transactions
        </Button>
      </Box>
    );
  }

  if (!transaction) {
    return (
      <Box sx={{ mt: 3 }}>
        <Alert severity="info">Transaction not found</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          component={Link}
          to="/transactions"
          sx={{ mt: 2 }}
        >
          Back to Transactions
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          component={Link} 
          to="/transactions"
        >
          Back to Transactions
        </Button>
        <Box>
          <Button
            startIcon={<EditIcon />}
            onClick={() => navigate('/transactions', { state: { editId: id } })}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button
            startIcon={<DeleteIcon />}
            color="error"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Box>
      </Box>

      <Typography variant="h4" component="h1" gutterBottom>
        Transaction Details
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {transaction.description}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {transaction.merchant_name}
              </Typography>

              <Box sx={{ my: 2 }}>
                <Typography variant="h4" component="p" sx={{ 
                  color: transaction.transaction_type === 'refund' ? 'green' : 
                         transaction.transaction_type === 'payment' ? 'orange' : 'inherit'
                }}>
                  ${transaction.amount.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(transaction.date)}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Type
                  </Typography>
                  <Chip 
                    label={transaction.transaction_type} 
                    color={getTransactionTypeColor(transaction.transaction_type)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Category
                  </Typography>
                  <Chip 
                    label={transaction.category} 
                    color={getCategoryColor(transaction.category)}
                    size="small"
                  />
                </Grid>
              </Grid>

              {card && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" gutterBottom>
                    Payment Method
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1">
                      {card.card_type} ending in {card.last_four}
                    </Typography>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Receipt
                </Typography>
                <IconButton 
                  color="primary" 
                  onClick={handleReceiptDialogOpen}
                  title="Upload receipt"
                >
                  <UploadFileIcon />
                </IconButton>
              </Box>

              {transaction.receipt_path ? (
                <Paper elevation={0} sx={{ p: 1, bgcolor: 'grey.100' }}>
                  <CardMedia
                    component="img"
                    image={`/api/uploads/${transaction.receipt_path}`}
                    alt="Receipt"
                    sx={{ 
                      height: 200, 
                      objectFit: 'contain',
                      bgcolor: 'white'
                    }}
                  />
                </Paper>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  p: 3,
                  bgcolor: 'grey.100',
                  borderRadius: 1
                }}>
                  <ReceiptIcon sx={{ fontSize: 48, color: 'grey.500', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary" align="center">
                    No receipt attached
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    startIcon={<UploadFileIcon />}
                    onClick={handleReceiptDialogOpen}
                    sx={{ mt: 2 }}
                  >
                    Upload Receipt
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>

          {transaction.ocr_data && Object.keys(transaction.ocr_data).length > 0 && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Receipt Data
                </Typography>
                <Box component="pre" sx={{ 
                  whiteSpace: 'pre-wrap', 
                  bgcolor: 'grey.100', 
                  p: 1, 
                  borderRadius: 1,
                  fontSize: '0.875rem'
                }}>
                  {JSON.stringify(transaction.ocr_data, null, 2)}
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Receipt Upload Dialog */}
      <Dialog open={receiptDialogOpen} onClose={handleReceiptDialogClose}>
        <DialogTitle>Upload Receipt</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Upload a receipt image for this transaction.
            Supported formats: JPG, PNG, PDF
          </Typography>
          <Button
            variant="contained"
            component="label"
            startIcon={<UploadFileIcon />}
            disabled={uploading}
          >
            Select File
            <input
              type="file"
              hidden
              accept="image/jpeg,image/png,application/pdf"
              onChange={handleFileSelect}
            />
          </Button>
          {selectedFile && (
            <Typography variant="body2" sx={{ mt: 2 }}>
              Selected: {selectedFile.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleReceiptDialogClose} disabled={uploading}>
            Cancel
          </Button>
          <Button 
            onClick={handleUploadReceipt} 
            variant="contained" 
            color="primary"
            disabled={!selectedFile || uploading}
          >
            {uploading ? <CircularProgress size={24} /> : 'Upload'}
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

export default TransactionDetail; 