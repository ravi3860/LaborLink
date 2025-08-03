import React, { useEffect, useState } from 'react';
import { getCustomerDashboard, updateCustomer, deleteCustomer } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import './CustomerDashboard.css';
import Swal from 'sweetalert2';

const CustomerDashboard = () => {
  const [customerData, setCustomerData] = useState(null);
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await getCustomerDashboard();
        setCustomerData(response.data.customer);
        setFormData(response.data.customer); // Make editable copy
      } catch (err) {
        console.error('Failed to fetch dashboard:', err);
        navigate('/login');
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  const handleChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await updateCustomer(formData);
      Swal.fire('Details updated successfully!');
      setCustomerData(response.data.updatedCustomer);
    } catch (err) {
      console.error('Update failed:', err);
      Swal.fire('Failed to update details');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete your account?')) {
      try {
        await deleteCustomer(customerData._id);
        Swal.fire('Account deleted successfully');
        handleLogout();
      } catch (err) {
        console.error('Delete failed:', err);
        Swal.fire('Failed to delete account');
      }
    }
  };

  if (!customerData) return <p className="loading-text">Loading dashboard...</p>;

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2 className="sidebar-title">Customer Panel</h2>
        <ul className="sidebar-nav">
          <li className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>👤 Profile</li>
          <li className={activeTab === 'bookings' ? 'active' : ''} onClick={() => setActiveTab('bookings')}>📆 Bookings</li>
          <li className={activeTab === 'subscriptions' ? 'active' : ''} onClick={() => setActiveTab('subscriptions')}>💳 Subscriptions</li>
          <li onClick={handleLogout}>🚪 Logout</li>
        </ul>
      </aside>

      <main className="content">
        {activeTab === 'profile' && (
          <div className="card">
            <h3>My Profile</h3>
            <form className="form" onSubmit={handleUpdate}>
              <label>Name:
                <input type="text" name="name" value={formData.name || ''} onChange={handleChange} />
              </label>
              <label>Username:
                <input type="text" name="username" value={formData.username || ''} onChange={handleChange} />
              </label>
              <label>Email:
                <input type="email" name="email" value={formData.email || ''} onChange={handleChange} />
              </label>
              <label>Address:
                <input type="text" name="address" value={formData.address || ''} onChange={handleChange} />
              </label>
              <label>Phone:
                <input type="text" name="phone" value={formData.phone || ''} onChange={handleChange} />
              </label>

              <div className="button-group">
                <button type="submit" className="btn purple">Update</button>
                <button type="button" className="btn danger" onClick={handleDelete}>Delete Account</button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="card">
            <h3>Your Bookings</h3>
            <p>No bookings found yet.</p>
          </div>
        )}

        {activeTab === 'subscriptions' && (
          <div className="card">
            <h3>Your Subscriptions</h3>
            <p>No subscriptions found yet.</p>
          </div>
        )}
      </main>
    </div>
  );
};


export default CustomerDashboard;
