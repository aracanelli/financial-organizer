import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  FormHelperText,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';

const validationSchema = yup.object({
  amount: yup
    .number()
    .positive('Amount must be positive')
    .required('Amount is required'),
  transaction_type: yup
    .string()
    .required('Transaction type is required'),
  category: yup
    .string()
    .required('Category is required'),
  description: yup
    .string(),
  frequency: yup
    .string()
    .required('Frequency is required'),
  start_date: yup
    .date()
    .required('Start date is required'),
  end_date: yup
    .date()
    .nullable()
    .min(
      yup.ref('start_date'),
      'End date must be after start date'
    ),
});

const TRANSACTION_TYPES = [
  'purchase',
  'deposit',
  'withdrawal',
  'transfer'
];

const CATEGORIES = [
  'groceries',
  'utilities',
  'entertainment',
  'dining',
  'transportation',
  'shopping',
  'housing',
  'healthcare',
  'education',
  'income',
  'other'
];

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' }
];

const RecurringTransactionForm = ({ open, handleClose, onSubmit, initialValues }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: initialValues || {
      amount: '',
      transaction_type: 'purchase',
      category: 'other',
      description: '',
      frequency: 'monthly',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
        handleClose();
      } catch (error) {
        console.error('Error submitting recurring transaction:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {initialValues ? 'Edit Recurring Transaction' : 'Create Recurring Transaction'}
      </DialogTitle>
      
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="amount"
                name="amount"
                label="Amount"
                type="number"
                inputProps={{ step: "0.01" }}
                value={formik.values.amount}
                onChange={formik.handleChange}
                error={formik.touched.amount && Boolean(formik.errors.amount)}
                helperText={formik.touched.amount && formik.errors.amount}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="transaction-type-label">Transaction Type</InputLabel>
                <Select
                  labelId="transaction-type-label"
                  id="transaction_type"
                  name="transaction_type"
                  value={formik.values.transaction_type}
                  onChange={formik.handleChange}
                  error={formik.touched.transaction_type && Boolean(formik.errors.transaction_type)}
                >
                  {TRANSACTION_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.transaction_type && formik.errors.transaction_type && (
                  <FormHelperText error>{formik.errors.transaction_type}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  id="category"
                  name="category"
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  error={formik.touched.category && Boolean(formik.errors.category)}
                >
                  {CATEGORIES.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.category && formik.errors.category && (
                  <FormHelperText error>{formik.errors.category}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="frequency-label">Frequency</InputLabel>
                <Select
                  labelId="frequency-label"
                  id="frequency"
                  name="frequency"
                  value={formik.values.frequency}
                  onChange={formik.handleChange}
                  error={formik.touched.frequency && Boolean(formik.errors.frequency)}
                >
                  {FREQUENCIES.map((freq) => (
                    <MenuItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.frequency && formik.errors.frequency && (
                  <FormHelperText error>{formik.errors.frequency}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description"
                value={formik.values.description}
                onChange={formik.handleChange}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="start_date"
                name="start_date"
                label="Start Date"
                type="date"
                value={formik.values.start_date}
                onChange={formik.handleChange}
                error={formik.touched.start_date && Boolean(formik.errors.start_date)}
                helperText={formik.touched.start_date && formik.errors.start_date}
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="end_date"
                name="end_date"
                label="End Date (Optional)"
                type="date"
                value={formik.values.end_date}
                onChange={formik.handleChange}
                error={formik.touched.end_date && Boolean(formik.errors.end_date)}
                helperText={
                  (formik.touched.end_date && formik.errors.end_date) || 
                  "Leave empty for no end date"
                }
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </Grid>
          
          <Box mt={2}>
            <Typography variant="body2" color="textSecondary">
              This will create a recurring transaction based on the frequency you select.
              Transactions will be generated automatically on their due dates.
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose} color="primary" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            color="primary" 
            variant="contained" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : (initialValues ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default RecurringTransactionForm; 