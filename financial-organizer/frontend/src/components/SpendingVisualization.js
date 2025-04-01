import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress
} from '@mui/material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import api from '../api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

const SpendingVisualization = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month'); // month, quarter, year
  const [chartType, setChartType] = useState('category'); // category, time
  
  useEffect(() => {
    fetchTransactions();
  }, [timeRange]);
  
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/transactions/');
      // Filter transactions based on time range
      const filtered = filterTransactionsByTimeRange(response.data, timeRange);
      setTransactions(filtered);
      setError(null);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transaction data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const filterTransactionsByTimeRange = (data, range) => {
    const now = new Date();
    let cutoffDate;
    
    switch (range) {
      case 'month':
        cutoffDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'quarter':
        cutoffDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case 'year':
        cutoffDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        cutoffDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    }
    
    return data.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= cutoffDate && transaction.transaction_type.toLowerCase() === 'purchase';
    });
  };
  
  const getCategoryData = () => {
    const categories = {};
    
    transactions.forEach(transaction => {
      const category = transaction.category || 'Uncategorized';
      if (!categories[category]) {
        categories[category] = 0;
      }
      categories[category] += transaction.amount;
    });
    
    return Object.keys(categories).map(category => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: categories[category]
    }));
  };
  
  const getMonthlyData = () => {
    const months = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const monthName = date.toLocaleString('default', { month: 'short' });
      
      if (!months[monthKey]) {
        months[monthKey] = {
          name: monthName,
          amount: 0
        };
      }
      
      months[monthKey].amount += transaction.amount;
    });
    
    return Object.values(months).sort((a, b) => {
      const monthOrder = { 'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6, 
                          'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12 };
      return monthOrder[a.name] - monthOrder[b.name];
    });
  };
  
  const renderCategoryChart = () => {
    const data = getCategoryData();
    
    return (
      <Box height={400}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    );
  };
  
  const renderMonthlyChart = () => {
    const data = getMonthlyData();
    
    return (
      <Box height={400}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `$${value}`} />
            <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']} />
            <Legend />
            <Bar dataKey="amount" name="Spending" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" align="center">
            No transaction data available for the selected time period.
          </Typography>
          <Typography variant="body2" align="center" color="textSecondary">
            Add some transactions to see your spending visualization.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          Spending Visualization
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel id="time-range-label">Time Range</InputLabel>
              <Select
                labelId="time-range-label"
                value={timeRange}
                label="Time Range"
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <MenuItem value="month">Last Month</MenuItem>
                <MenuItem value="quarter">Last Quarter</MenuItem>
                <MenuItem value="year">Last Year</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel id="chart-type-label">View By</InputLabel>
              <Select
                labelId="chart-type-label"
                value={chartType}
                label="View By"
                onChange={(e) => setChartType(e.target.value)}
              >
                <MenuItem value="category">Category</MenuItem>
                <MenuItem value="time">Monthly</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        {chartType === 'category' ? renderCategoryChart() : renderMonthlyChart()}
        
        <Box mt={2}>
          <Typography variant="body2" color="textSecondary">
            Total Spending: ${transactions.reduce((total, tx) => total + tx.amount, 0).toFixed(2)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SpendingVisualization; 