import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

const Cards = () => {
  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Cards & Accounts
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Cards page - Placeholder for card management
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Cards; 