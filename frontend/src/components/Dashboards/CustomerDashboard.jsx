import React, { useEffect, useState } from 'react';
import { getCustomerDashboard, updateCustomer, deleteCustomer } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import './CustomerDashboard.css';

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
      alert('Details updated successfully!');
      setCustomerData(response.data.updatedCustomer);
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to update details');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete your account?')) {
      try {
        await deleteCustomer(customerData._id);
        alert('Account deleted successfully');
        handleLogout();
      } catch (err) {
        console.error('Delete failed:', err);
        alert('Failed to delete account');
      }
    }
  };

  if (!customerData) return <p>Loading dashboard...</p>;

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <h2>Customer Panel</h2>
        <ul>
          <li className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>Profile</li>
          <li className={activeTab === 'bookings' ? 'active' : ''} onClick={() => setActiveTab('bookings')}>Bookings</li>
          <li className={activeTab === 'subscriptions' ? 'active' : ''} onClick={() => setActiveTab('subscriptions')}>Subscriptions</li>
          <li onClick={handleLogout}>Logout</li>
        </ul>
      </aside>

      <main className="dashboard-content">
        {activeTab === 'profile' && (
          <div className="dashboard-section">
            <h3>My Profile</h3>
            <form className="profile-form" onSubmit={handleUpdate}>
              <label>
                Name:
                <input type="text" name="name" value={formData.name || ''} onChange={handleChange} />
              </label>
              <label>
                Username:
                <input type="text" name="username" value={formData.username || ''} onChange={handleChange} />
              </label>
              <label>
                Email:
                <input type="email" name="email" value={formData.email || ''} onChange={handleChange} />
              </label>
              <label>
                Address:
                <input type="text" name="address" value={formData.address || ''} onChange={handleChange} />
              </label>
              <label>
                Phone:
                <input type="text" name="phone" value={formData.phone || ''} onChange={handleChange} />
              </label>

              <div className="button-group">
                <button type="submit">Update Details</button>
                <button type="button" className="delete-btn" onClick={handleDelete}>Delete Account</button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="dashboard-section">
            <h3>Your Bookings</h3>
            <p>Booking history and details will appear here.</p>
          </div>
        )}

        {activeTab === 'subscriptions' && (
          <div className="dashboard-section">
            <h3>Your Subscriptions</h3>
            <p>Active and past subscriptions will be shown here.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default CustomerDashboard;
