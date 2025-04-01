import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Cards from '../pages/Cards';

// Mock axios
jest.mock('axios');

describe('Cards Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Mock successful GET response for fetching cards
    axios.get.mockResolvedValue({ data: [] });
  });
  
  test('renders the Cards page with "Add Card" button', async () => {
    render(
      <BrowserRouter>
        <Cards />
      </BrowserRouter>
    );
    
    // Wait for initial data fetch to complete
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/cards/');
    });
    
    // Check if main elements are rendered
    expect(screen.getByText('Cards & Accounts')).toBeInTheDocument();
    expect(screen.getByText('Add Card')).toBeInTheDocument();
    expect(screen.getByText('No cards or accounts added yet')).toBeInTheDocument();
  });
  
  test('opens dialog when Add Card button is clicked', async () => {
    render(
      <BrowserRouter>
        <Cards />
      </BrowserRouter>
    );
    
    // Wait for initial data fetch to complete
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/cards/');
    });
    
    // Click the Add Card button
    fireEvent.click(screen.getByText('Add Card'));
    
    // Check if dialog is opened
    expect(screen.getByText('Add New Card')).toBeInTheDocument();
    expect(screen.getByLabelText('Card Number')).toBeInTheDocument();
    expect(screen.getByLabelText('Card Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Expiry Date')).toBeInTheDocument();
  });
  
  test('validates form when submitting', async () => {
    render(
      <BrowserRouter>
        <Cards />
      </BrowserRouter>
    );
    
    // Wait for initial data fetch to complete
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/cards/');
    });
    
    // Click the Add Card button to open dialog
    fireEvent.click(screen.getByText('Add Card'));
    
    // Submit without filling required fields
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    
    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText('Card number is required')).toBeInTheDocument();
    });
  });
  
  test('successfully adds a new card', async () => {
    // Mock successful POST response for adding a card
    axios.post.mockResolvedValue({ 
      data: {
        id: 1,
        card_number: '************1234',
        card_type: 'VISA',
        last_four: '1234',
        expiry_date: '12/25'
      }
    });
    
    render(
      <BrowserRouter>
        <Cards />
      </BrowserRouter>
    );
    
    // Wait for initial data fetch to complete
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/cards/');
    });
    
    // Click the Add Card button to open dialog
    fireEvent.click(screen.getByText('Add Card'));
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText('Card Number'), {
      target: { value: '4111111111111234' }
    });
    
    fireEvent.change(screen.getByLabelText('Expiry Date'), {
      target: { value: '12/25' }
    });
    
    // Card type should already be set to default 'VISA'
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    
    // Check if POST request was made with correct data
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/cards/', {
        card_number: '4111111111111234',
        card_type: 'VISA',
        last_four: '1234',
        expiry_date: '12/25',
        plaid_item_id: ''
      });
    });
    
    // Check for success message and fetch updated list
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(2); // Initial load + refresh after adding
      expect(screen.getByText('Card added successfully')).toBeInTheDocument();
    });
  });
}); 