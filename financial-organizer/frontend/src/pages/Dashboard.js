import React, { useState, useEffect, useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { VisibilityOutlined as ViewIcon } from '@mui/icons-material';
import { IconButton } from '@mui/material';

const Dashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState({
    transactionCount: 0,
    cardCount: 0,
    totalSpent: 0,
    totalIncome: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch transactions
        const transactionsResponse = await axios.get('/api/transactions/');
        const transactions = transactionsResponse.data;
        
        // Fetch cards
        const cardsResponse = await axios.get('/api/cards/');
        const cards = cardsResponse.data;
        
        // Calculate statistics
        const totalSpent = transactions
          .filter(t => t.transaction_type === 'PURCHASE')
          .reduce((sum, t) => sum + t.amount, 0);
          
        const totalIncome = transactions
          .filter(t => t.transaction_type === 'PAYMENT' || t.transaction_type === 'REFUND')
          .reduce((sum, t) => sum + t.amount, 0);
          
        setStatistics({
          transactionCount: transactions.length,
          cardCount: cards.length,
          totalSpent,
          totalIncome,
        });
        
        // Sort transactions by date (most recent first) and take the most recent 5
        const sortedTransactions = [...transactions].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        
        setRecentTransactions(sortedTransactions.slice(0, 5));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, mt: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome, {currentUser?.full_name || 'User'}
      </Typography>
      
      <Typography variant="h6" component="h2" sx={{ mt: 3, mb: 2 }}>
        Financial Overview
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                {statistics.transactionCount}
              </Typography>
              <Typography color="text.secondary">
                Transactions
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" component={RouterLink} to="/transactions">
                View All
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                {statistics.cardCount}
              </Typography>
              <Typography color="text.secondary">
                Cards
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" component={RouterLink} to="/cards">
                Manage Cards
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div" sx={{ color: 'error.main' }}>
                ${statistics.totalSpent.toFixed(2)}
              </Typography>
              <Typography color="text.secondary">
                Total Spent
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div" sx={{ color: 'success.main' }}>
                ${statistics.totalIncome.toFixed(2)}
              </Typography>
              <Typography color="text.secondary">
                Total Income
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Typography variant="h6" component="h2" sx={{ mt: 4, mb: 2 }}>
        Recent Transactions
      </Typography>
      
      {recentTransactions.length === 0 ? (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="body1">
              No transactions yet. Start by adding a card or creating a transaction.
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small" component={RouterLink} to="/cards">
              Add Card
            </Button>
            <Button size="small" component={RouterLink} to="/transactions">
              Add Transaction
            </Button>
          </CardActions>
        </Card>
      ) : (
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{formatDate(transaction.date)}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell>{transaction.transaction_type}</TableCell>
                  <TableCell align="right" sx={{ 
                    color: transaction.transaction_type === 'REFUND' || transaction.transaction_type === 'PAYMENT' 
                      ? 'success.main' 
                      : 'error.main'
                  }}>
                    ${transaction.amount.toFixed(2)}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton 
                      size="small" 
                      component={RouterLink}
                      to={`/transactions/${transaction.id}`}
                    >
                      <ViewIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Box sx={{ textAlign: 'right', p: 1 }}>
            <Button size="small" component={RouterLink} to="/transactions">
              View All Transactions
            </Button>
          </Box>
        </TableContainer>
      )}
    </Box>
  );
};

export default Dashboard; 