import axios from 'axios';

// Create axios instance with base URL for easier requests
const api = axios.create({
  baseURL: 'http://localhost:2000/api/laborlink',
});

// Register customer API call
export const registerCustomer = (customerData) => {
  return api.post('/register/customer', customerData);
};

// Register labor API call
export const registerLabor = (laborData) => {
  return api.post('/register/labor', laborData);
};