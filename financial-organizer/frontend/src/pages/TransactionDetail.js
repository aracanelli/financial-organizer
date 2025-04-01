import React from 'react';
import { useParams } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

const TransactionDetail = () => {
  const { id } = useParams();
  
  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Transaction Details
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Transaction {id} details - Placeholder for transaction details page
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TransactionDetail; 