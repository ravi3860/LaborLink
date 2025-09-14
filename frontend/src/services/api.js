import axios from 'axios';

//base URL for the API
const BASE_URL = 'http://localhost:2000/api/laborlink';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

// 🟢 Public routes
export const registerCustomer = async (customerData) => {
  return await axios.post(`${BASE_URL}/register/customer`, customerData);
};

export const registerLabor = async (laborData) => {
  return await axios.post(`${BASE_URL}/register/labor`, laborData);
};

export const loginUser = async (credentials) => {
  return await axios.post(`${BASE_URL}/login`, credentials);
};

export const verifyCode = async (data) => {
  return await axios.post(`${BASE_URL}/verify-code`, data);
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

// ✅ Get bookings for a labor (uses /bookings/labor/:id)
export const getBookingsForLabor = async (laborId) => {
  const token = localStorage.getItem('token');
  return await axios.get(`${BASE_URL}/bookings/labor/${laborId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// ✅ Update booking status (uses PATCH /bookings/:id/status)
export const updateBookingStatus = async (bookingId, status, declineReason = '') => {
  const token = localStorage.getItem('token');
  return await axios.patch(
    `${BASE_URL}/bookings/${bookingId}/status`,
    { status, declineReason },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

// Toggle 2-step verification (enable/disable)
export const toggleTwoStepVerification = async (customerId, enable) => {
  const token = localStorage.getItem('token');
  return await axios.put(
    `${BASE_URL}/customer/two-step`,
    { customerId, enable },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
};

// --- NEW: Admin functions ---
export const getAllBookings = async () => {
  return await axios.get(`${BASE_URL}/bookings`, getAuthHeader());
};

export const getAllCustomers = async () => {
  return await axios.get(`${BASE_URL}/customers`, getAuthHeader());
};

export const getAllLabors = async () => {
  return await axios.get(`${BASE_URL}/labors`, getAuthHeader());
};

export const deleteBooking = async (bookingId) => {
  return await axios.delete(`${BASE_URL}/bookings/${bookingId}`, getAuthHeader());
};

export const updateBookingStatusAsAdmin = async (bookingId, status, declineReason = '') => {
  return await axios.patch(
    `${BASE_URL}/admin/bookings/${bookingId}/status`,
    { status, declineReason },
    getAuthHeader()
  );
};

// Generic delete user function for admin
export const deleteUser = async (userId, type) => {
  if (type === 'customer') return await deleteCustomer(userId);
  if (type === 'labor') return await deleteLabor(userId);
};