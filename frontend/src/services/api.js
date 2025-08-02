import axios from 'axios';

// ✅ Add this line at the top
const BASE_URL = 'http://localhost:2000/api/laborlink';

export const registerCustomer = async (customerData) => {
  return await axios.post(`${BASE_URL}/register/customer`, customerData);
};

export const registerLabor = async (laborData) => {
  return await axios.post(`${BASE_URL}/register/labor`, laborData);
};

export const loginUser = async (credentials) => {
  return await axios.post(`${BASE_URL}/login`, credentials);
};