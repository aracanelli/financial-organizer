import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Transactions from '../pages/Transactions';
import { AuthContext } from '../contexts/AuthContext';

// Mock axios
jest.mock('axios');

// Mock data
const mockCards = [
  { id: 1, card_type: 'VISA', last_four: '1234', expiry_date: '12/25' },
  { id: 2, card_type: 'MASTERCARD', last_four: '5678', expiry_date: '06/24' },
];

const mockTransactions = [];

const mockUser = {
  id: 1,
  full_name: 'Test User',
  email: 'test@example.com'
};

describe('Transactions Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Mock successful GET responses
    axios.get.mockImplementation((url) => {
      if (url === '/api/transactions/') {
        return Promise.resolve({ data: mockTransactions });
      } else if (url === '/api/cards/') {
        return Promise.resolve({ data: mockCards });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });
  });
  
  const renderWithContext = (ui) => {
    return render(
      <AuthContext.Provider value={{ currentUser: mockUser }}>
        <BrowserRouter>
          {ui}
        </BrowserRouter>
      </AuthContext.Provider>
    );
  };
  
  test('renders the Transactions page with "Add Transaction" button', async () => {
    renderWithContext(<Transactions />);
    
    // Wait for initial data fetch to complete
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/transactions/');
      expect(axios.get).toHaveBeenCalledWith('/api/cards/');
    });
    
    // Check if main elements are rendered
    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.getByText('Add Transaction')).toBeInTheDocument();
  });
  
  test('opens dialog when Add Transaction button is clicked', async () => {
    renderWithContext(<Transactions />);
    
    // Wait for initial data fetch to complete
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/transactions/');
      expect(axios.get).toHaveBeenCalledWith('/api/cards/');
    });
    
    // Click the Add Transaction button
    fireEvent.click(screen.getByText('Add Transaction'));
    
    // Check if dialog is opened with form fields
    expect(screen.getByText('Add New Transaction')).toBeInTheDocument();
    expect(screen.getByLabelText('Amount')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Merchant Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Transaction Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Transaction Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Card')).toBeInTheDocument();
  });
  
  test('validates form when submitting', async () => {
    renderWithContext(<Transactions />);
    
    // Wait for initial data fetch to complete
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/transactions/');
      expect(axios.get).toHaveBeenCalledWith('/api/cards/');
    });
    
    // Click the Add Transaction button to open dialog
    fireEvent.click(screen.getByText('Add Transaction'));
    
    // Submit without filling required fields
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    
    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText('Please fill all required fields')).toBeInTheDocument();
    });
  });
  
  test('successfully adds a new transaction', async () => {
    // Mock successful POST response for adding a transaction
    axios.post.mockResolvedValue({ 
      data: {
        id: 1,
        amount: 50.25,
        description: 'Grocery shopping',
        transaction_type: 'PURCHASE',
        category: 'GROCERIES',
        merchant_name: 'Supermarket',
        date: '2023-04-01',
        card_id: 1
      }
    });
    
    renderWithContext(<Transactions />);
    
    // Wait for initial data fetch to complete
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/transactions/');
      expect(axios.get).toHaveBeenCalledWith('/api/cards/');
    });
    
    // Click the Add Transaction button to open dialog
    fireEvent.click(screen.getByText('Add Transaction'));
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText('Amount'), {
      target: { value: '50.25' }
    });
    
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Grocery shopping' }
    });
    
    fireEvent.change(screen.getByLabelText('Merchant Name'), {
      target: { value: 'Supermarket' }
    });
    
    // Transaction Type and Category should already have default values
    
    // Select first card
    fireEvent.change(screen.getByLabelText('Card'), {
      target: { value: '1' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    
    // Check if POST request was made with correct data
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/transactions/', {
        amount: 50.25,
        description: 'Grocery shopping',
        transaction_type: 'PURCHASE',
        category: 'GROCERIES',
        merchant_name: 'Supermarket',
        date: expect.any(String), // Today's date in ISO format
        card_id: '1'
      });
    });
    
    // Check for success message and fetch updated list
    await waitFor(() => {
      expect(screen.getByText('Transaction added successfully')).toBeInTheDocument();
      // Verify transactions are fetched again after adding
      expect(axios.get).toHaveBeenCalledWith('/api/transactions/');
      expect(axios.get).toHaveBeenCalledTimes(3); // Initial transactions + cards + refresh after adding
    });
  });
  
  test('handles API error when adding transaction', async () => {
    // Mock API error
    axios.post.mockRejectedValue(new Error('API Error'));
    
    renderWithContext(<Transactions />);
    
    // Wait for initial data fetch to complete
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/transactions/');
      expect(axios.get).toHaveBeenCalledWith('/api/cards/');
    });
    
    // Click the Add Transaction button to open dialog
    fireEvent.click(screen.getByText('Add Transaction'));
    
    // Fill in the form with minimum required fields
    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '50.25' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Test Transaction' } });
    fireEvent.change(screen.getByLabelText('Merchant Name'), { target: { value: 'Test Merchant' } });
    fireEvent.change(screen.getByLabelText('Card'), { target: { value: '1' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText('Failed to add transaction')).toBeInTheDocument();
    });
  });
}); 