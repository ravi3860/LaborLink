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

// 🟡 Protected routes – requires JWT token
export const getCustomerDashboard = async () => {
  const token = localStorage.getItem('token');
  return await axios.get(`${BASE_URL}/customer/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateCustomer = async (customerData) => {
  const token = localStorage.getItem('token');
  return await axios.put(`${BASE_URL}/customers/update`, customerData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const deleteCustomer = async (customerId) => {
  const token = localStorage.getItem('token');
  return await axios.delete(`${BASE_URL}/customers/delete/${customerId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const getLaborDashboard = async () => {
  const token = localStorage.getItem('token');
  return await axios.get(`${BASE_URL}/labor/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const updateLabor = async (laborData) => {
  const token = localStorage.getItem('token');
  return await axios.put(`${BASE_URL}/labors/update`, laborData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const deleteLabor = async (laborId) => {
  const token = localStorage.getItem('token');
  return await axios.delete(`${BASE_URL}/labors/delete/${laborId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const getAdminDashboard = async () => {
  const token = localStorage.getItem('token');
  return await axios.get(`${BASE_URL}/admin/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};