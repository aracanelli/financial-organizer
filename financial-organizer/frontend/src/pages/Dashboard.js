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

  useEffect(() => {
    // In a real app, we would fetch data from the API
    // For now, we'll simulate loading data
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simulated data for now
        setTimeout(() => {
          setStatistics({
            transactionCount: 12,
            cardCount: 2,
            totalSpent: 1245.67,
            totalIncome: 3000,
          });
          setLoading(false);
        }, 1000);
        
        /* Real API call would look like this:
        const response = await axios.get('/api/dashboard/stats');
        setStatistics(response.data);
        */
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

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
              <Typography variant="h5" component="div">
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
              <Typography variant="h5" component="div">
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
    </Box>
  );
};

export default Dashboard; 