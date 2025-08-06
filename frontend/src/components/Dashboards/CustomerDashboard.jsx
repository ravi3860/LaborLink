import React, { useEffect, useState } from 'react';
import { getCustomerDashboard, updateCustomer, deleteCustomer } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './CustomerDashboard.css';
import { FaUser, FaCalendarCheck, FaRegCreditCard, FaSignOutAlt } from 'react-icons/fa';

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
        setFormData(response.data.customer);
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

  if (!customerData) return <p className="customer-loading-text">Loading dashboard...</p>;

  return (
    <div className="customer-dashboard-container">
      <aside className="customer-sidebar">
        <h2 className="customer-sidebar-title">Customer Panel</h2>
        <ul className="customer-sidebar-nav">
          <li className={`customer-nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            <FaUser /> Profile
          </li>
          <li className={`customer-nav-item ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
            <FaCalendarCheck /> Bookings
          </li>
          <li className={`customer-nav-item ${activeTab === 'subscriptions' ? 'active' : ''}`} onClick={() => setActiveTab('subscriptions')}>
            <FaRegCreditCard /> Subscriptions
          </li>
          <li className="customer-nav-item customer-logout" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </li>
        </ul>
      </aside>

      <main className="customer-main-content">
        {activeTab === 'profile' && (
          <section className="dashboard-grid">
            {/* Left Column: Profile Overview */}
            <div className="profile-overview">
              <div className="profile-header">
                <div className="avatar-circle">{customerData.name?.charAt(0).toUpperCase()}</div>
                <div className="profile-info">
                  <h3>{customerData.name}</h3>
                  <p className="role-label">Customer</p>
                </div>
              </div>

              <div className="profile-section-card">
                <h4>Contact Information</h4>
                <p><strong>Email:</strong> {customerData.email}</p>
                <p><strong>Phone:</strong> {customerData.phone}</p>
                <p><strong>Username:</strong> {customerData.username}</p>
              </div>

              <div className="profile-section-card">
                <h4>Address</h4>
                <p>{customerData.address}</p>
              </div>
            </div>

            {/* Right Column: Update/Delete Form */}
            <div className="profile-update-form">
              <h3 className="customer-card-title">Update Details</h3>
              <form className="customer-form" onSubmit={handleUpdate} noValidate>
                <label htmlFor="name">
                  Name:
                  <input id="name" type="text" name="name" value={formData.name || ''} onChange={handleChange} required />
                </label>

                <label htmlFor="username">
                  Username:
                  <input id="username" type="text" name="username" value={formData.username || ''} onChange={handleChange} required />
                </label>

                <label htmlFor="email">
                  Email:
                  <input id="email" type="email" name="email" value={formData.email || ''} onChange={handleChange} required />
                </label>

                <label htmlFor="address">
                  Address:
                  <input id="address" type="text" name="address" value={formData.address || ''} onChange={handleChange} required />
                </label>

                <label htmlFor="phone">
                  Phone:
                  <input id="phone" type="text" name="phone" value={formData.phone || ''} onChange={handleChange} required />
                </label>

                <div className="customer-button-group">
                  <button type="submit" className="customer-btn customer-btn-primary">Update</button>
                  <button type="button" className="customer-btn customer-btn-danger" onClick={handleDelete}>Delete Account</button>
                </div>
              </form>
            </div>
          </section>
        )}

        {activeTab === 'bookings' && (
          <section className="customer-card">
            <h3 className="customer-card-title">Your Bookings</h3>
            <p>No bookings found yet.</p>
          </section>
        )}

        {activeTab === 'subscriptions' && (
          <section className="customer-card">
            <h3 className="customer-card-title">Your Subscriptions</h3>
            <p>No subscriptions found yet.</p>
          </section>
        )}
      </main>
    </div>
  );
};

export default CustomerDashboard;
