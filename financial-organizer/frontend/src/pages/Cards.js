import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Typography,
  Box,
  Card as MuiCard,
  CardContent,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Stack,
  CircularProgress,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';

const CARD_TYPES = [
  'VISA',
  'MASTERCARD',
  'AMEX',
  'DISCOVER',
  'DEBIT',
  'CHECKING',
  'SAVINGS'
];

const Cards = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    card_number: '',
    card_type: 'VISA',
    last_four: '',
    expiry_date: '',
    plaid_item_id: ''
  });
  
  // Fetch cards on component mount
  useEffect(() => {
    fetchCards();
  }, []);
  
  const fetchCards = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/cards/');
      setCards(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching cards:', err);
      setError('Failed to load cards. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenDialog = (card = null) => {
    if (card) {
      // Edit existing card
      setEditingCard(card);
      setFormData({
        card_number: '************' + card.last_four, // Masked card number
        card_type: card.card_type,
        last_four: card.last_four,
        expiry_date: card.expiry_date,
        plaid_item_id: card.plaid_item_id || ''
      });
    } else {
      // Add new card
      setEditingCard(null);
      setFormData({
        card_number: '',
        card_type: 'VISA',
        last_four: '',
        expiry_date: '',
        plaid_item_id: ''
      });
    }
    setDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCard(null);
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-update last_four when card_number changes
    if (name === 'card_number' && value.length >= 4) {
      setFormData(prev => ({ ...prev, last_four: value.slice(-4) }));
    }
  };
  
  const validateForm = () => {
    // Simple validation
    if (!formData.card_number) {
      setSnackbar({
        open: true,
        message: 'Card number is required',
        severity: 'error'
      });
      return false;
    }
    if (!formData.card_type) {
      setSnackbar({
        open: true,
        message: 'Card type is required',
        severity: 'error'
      });
      return false;
    }
    if (!formData.expiry_date) {
      setSnackbar({
        open: true,
        message: 'Expiry date is required',
        severity: 'error'
      });
      return false;
    }
    
    // Validate expiry date format (MM/YY)
    const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!expiryRegex.test(formData.expiry_date)) {
      setSnackbar({
        open: true,
        message: 'Expiry date must be in MM/YY format',
        severity: 'error'
      });
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      // Prepare data for API
      const cardData = {
        ...formData,
        // Use the last 4 digits if editing an existing card
        card_number: editingCard ? 
          '************' + formData.last_four : 
          formData.card_number,
      };
      
      let response;
      if (editingCard) {
        // Update existing card
        response = await axios.put(`/api/cards/${editingCard.id}`, cardData);
        
        setSnackbar({
          open: true,
          message: 'Card updated successfully',
          severity: 'success'
        });
      } else {
        // Create new card
        response = await axios.post('/api/cards/', cardData);
        
        setSnackbar({
          open: true,
          message: 'Card added successfully',
          severity: 'success'
        });
      }
      
      // Refresh card list
      await fetchCards();
      handleCloseDialog();
      
    } catch (err) {
      console.error('Error saving card:', err);
      setSnackbar({
        open: true,
        message: `Failed to ${editingCard ? 'update' : 'add'} card: ${err.response?.data?.detail || err.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this card?')) {
      return;
    }
    
    try {
      setLoading(true);
      await axios.delete(`/api/cards/${id}`);
      
      setSnackbar({
        open: true,
        message: 'Card deleted successfully',
        severity: 'success'
      });
      
      // Refresh card list
      await fetchCards();
    } catch (err) {
      console.error('Error deleting card:', err);
      setSnackbar({
        open: true,
        message: `Failed to delete card: ${err.response?.data?.detail || err.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Helper to get icon based on card type
  const getCardIcon = (type) => {
    const isBank = ['CHECKING', 'SAVINGS'].includes(type);
    return isBank ? 
      <AccountBalanceIcon fontSize="large" color="primary" /> : 
      <CreditCardIcon fontSize="large" color="primary" />;
  };
  
  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Cards & Accounts
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog(null)}
        >
          Add Card
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading && cards.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : cards.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No cards or accounts added yet
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Add your first credit card or bank account to start tracking transactions
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog(null)}
          >
            Add Your First Card
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {cards.map((card) => (
            <Grid item xs={12} sm={6} md={4} key={card.id}>
              <MuiCard sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getCardIcon(card.card_type)}
                      <Box sx={{ ml: 2 }}>
                        <Typography variant="h6" component="div">
                          {card.card_type}
                        </Typography>
                        <Typography color="text.secondary">
                          •••• {card.last_four}
                        </Typography>
                        {card.expiry_date && (
                          <Typography variant="body2" color="text.secondary">
                            Expires: {card.expiry_date}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Box>
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenDialog(card)}
                        aria-label="edit card"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleDelete(card.id)}
                        aria-label="delete card"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </MuiCard>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Add/Edit Card Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCard ? 'Edit Card' : 'Add New Card'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Card Number"
              name="card_number"
              value={formData.card_number}
              onChange={handleChange}
              fullWidth
              required
              placeholder="•••• •••• •••• ••••"
              inputProps={{
                maxLength: 16
              }}
            />
            
            <FormControl fullWidth required>
              <InputLabel id="card-type-label">Card Type</InputLabel>
              <Select
                labelId="card-type-label"
                id="card-type"
                name="card_type"
                value={formData.card_type}
                onChange={handleChange}
                label="Card Type"
              >
                {CARD_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="Expiry Date"
              name="expiry_date"
              value={formData.expiry_date}
              onChange={handleChange}
              fullWidth
              required
              placeholder="MM/YY"
              inputProps={{
                maxLength: 5
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : (editingCard ? 'Update' : 'Add')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Cards; 