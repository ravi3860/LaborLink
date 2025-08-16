import React, { useEffect, useState } from 'react';
import { 
  getCustomerDashboard, 
  updateCustomer, 
  deleteCustomer,
  toggleTwoStepVerification
} from '../../services/api';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './CustomerDashboard.css';
import {
  FaUser,
  FaCalendarCheck,
  FaRegCreditCard,
  FaSignOutAlt,
  FaChartLine,
  FaEdit,
  FaLock,
  FaHistory,
} from 'react-icons/fa';

const CustomerDashboard = () => {
  const [customerData, setCustomerData] = useState(null);
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState('profile');
  const [profileTab, setProfileTab] = useState('overview');
  const [twoStepEnabled, setTwoStepEnabled] = useState(false);
  const [loadingTwoStep, setLoadingTwoStep] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await getCustomerDashboard();
        setCustomerData(response.data.customer);
        setFormData(response.data.customer);
        setTwoStepEnabled(response.data.customer.twoStepEnabled || false);
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

  const handleToggleTwoStep = async () => {
    try {
      setLoadingTwoStep(true);
      const response = await toggleTwoStepVerification(customerData._id, !twoStepEnabled);
      setTwoStepEnabled(response.data.twoStepEnabled);
      Swal.fire('Success', response.data.message, 'success');
    } catch (err) {
      console.error('Failed to toggle 2-step:', err);
      Swal.fire('Error', 'Could not update 2-step verification', 'error');
    } finally {
      setLoadingTwoStep(false);
    }
  };

  if (!customerData) return <p className="cusdash-loading-text">Loading dashboard...</p>;

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="cusdash-container">
      {/* Sidebar */}
      <aside className="cusdash-sidebar">
        <h2 className="cusdash-sidebar-title">Customer Panel</h2>
        <ul className="cusdash-sidebar-nav">
          <li
            className={`cusdash-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <FaUser /> Profile
          </li>
          <li
            className={`cusdash-nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <FaCalendarCheck /> Bookings
          </li>
          <li
            className={`cusdash-nav-item ${activeTab === 'subscriptions' ? 'active' : ''}`}
            onClick={() => setActiveTab('subscriptions')}
          >
            <FaRegCreditCard /> Subscriptions
          </li>
          <li className="cusdash-nav-item cusdash-logout" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="cusdash-main-content">
        {/* Dashboard Header */}
        <div className="cusdash-header">
          <div>
            <h1>Welcome back, {customerData.name}</h1>
            <p className="cusdash-subtitle">Here’s what’s happening on your account today.</p>
          </div>
          <div className="cusdash-date">{today}</div>
        </div>

        {/* Quick Stats */}
        <div className="cusdash-stats">
          <div className="cusdash-stat-card">
            <div className="cusdash-stat-top">
              <FaCalendarCheck className="cusdash-stat-icon" />
              <span className="cusdash-stat-title">Bookings</span>
            </div>
            <div className="cusdash-stat-value">{customerData.bookings?.length || 0}</div>
          </div>
          <div className="cusdash-stat-card">
            <div className="cusdash-stat-top">
              <FaRegCreditCard className="cusdash-stat-icon" />
              <span className="cusdash-stat-title">Subscriptions</span>
            </div>
            <div className="cusdash-stat-value">{customerData.subscriptions?.length || 0}</div>
          </div>
          <div className="cusdash-stat-card">
            <div className="cusdash-stat-top">
              <FaChartLine className="cusdash-stat-icon" />
              <span className="cusdash-stat-title">Last Login</span>
            </div>
            <div className="cusdash-stat-value">{customerData.lastLogin || 'N/A'}</div>
          </div>
        </div>

        {activeTab === 'profile' && (
          <>
            {/* Profile Tabs */}
            <div className="cusdash-profile-tabs">
              <button
                className={`cusdash-profile-tab ${profileTab === 'overview' ? 'active' : ''}`}
                onClick={() => setProfileTab('overview')}
              >
                <FaUser /> Overview
              </button>
              <button
                className={`cusdash-profile-tab ${profileTab === 'edit' ? 'active' : ''}`}
                onClick={() => setProfileTab('edit')}
              >
                <FaEdit /> Edit Profile
              </button>
              <button
                className={`cusdash-profile-tab ${profileTab === 'security' ? 'active' : ''}`}
                onClick={() => setProfileTab('security')}
              >
                <FaLock /> Security
              </button>
              <button
                className={`cusdash-profile-tab ${profileTab === 'activity' ? 'active' : ''}`}
                onClick={() => setProfileTab('activity')}
              >
                <FaHistory /> Activity Log
              </button>
            </div>

            {/* Profile Content */}
            {profileTab === 'overview' && (
              <div className="cusdash-dashboard-grid">
                <div className="cusdash-profile-overview">
                  <div className="cusdash-profile-header">
                    <div className="cusdash-avatar-circle">
                      {customerData.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="cusdash-profile-info">
                      <h3>{customerData.name}</h3>
                      <p className="cusdash-role-label">Customer</p>
                    </div>
                  </div>

                  <div className="cusdash-profile-section-card">
                    <h4>Contact Information</h4>
                    <p><strong>Email:</strong> {customerData.email}</p>
                    <p><strong>Phone:</strong> {customerData.phone}</p>
                    <p><strong>Username:</strong> {customerData.username}</p>
                  </div>

                  <div className="cusdash-profile-section-card">
                    <h4>Address</h4>
                    <p>{customerData.address}</p>
                  </div>
                </div>

                {/* Activity Timeline */}
                <div className="cusdash-activity-timeline">
                  <h3>Recent Activity</h3>
                  <ul>
                    {customerData.activity?.length > 0 ? (
                      customerData.activity.map((item, idx) => (
                        <li key={idx} className="cusdash-activity-item">
                          <div className="cusdash-activity-dot" />
                          <div className="cusdash-activity-content">
                            <div className="cusdash-activity-text">{item.description}</div>
                            <div className="cusdash-activity-date">{item.date}</div>
                          </div>
                        </li>
                      ))
                    ) : (
                      <div className="cusdash-empty-state">
                        <p>No recent activity</p>
                      </div>
                    )}
                  </ul>
                </div>
              </div>
            )}

            {profileTab === 'edit' && (
              <div className="cusdash-dashboard-grid cusdash-dashboard-single">
                <div className="cusdash-profile-update-form">
                  <div className="cusdash-card-head">
                    <h3 className="cusdash-card-title">Update Details</h3>
                    <p className="cusdash-card-subtitle">
                      Keep your profile information accurate and up to date.
                    </p>
                  </div>

                  <form className="cusdash-form" onSubmit={handleUpdate} noValidate>
                    <div className="cusdash-form-grid">
                      <div className="cusdash-input-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                          id="name"
                          type="text"
                          name="name"
                          value={formData.name || ''}
                          onChange={handleChange}
                          required
                          placeholder="Enter your full name"
                        />
                        <small className="cusdash-input-hint">This will be displayed on bookings.</small>
                      </div>

                      <div className="cusdash-input-group">
                        <label htmlFor="username">Username</label>
                        <input
                          id="username"
                          type="text"
                          name="username"
                          value={formData.username || ''}
                          onChange={handleChange}
                          required
                          placeholder="Choose a unique username"
                        />
                        <small className="cusdash-input-hint">Use 4–20 characters.</small>
                      </div>

                      <div className="cusdash-input-group">
                        <label htmlFor="email">Email</label>
                        <input
                          id="email"
                          type="email"
                          name="email"
                          value={formData.email || ''}
                          onChange={handleChange}
                          required
                          placeholder="name@example.com"
                        />
                        <small className="cusdash-input-hint">We’ll send confirmations here.</small>
                      </div>

                      <div className="cusdash-input-group">
                        <label htmlFor="phone">Phone</label>
                        <input
                          id="phone"
                          type="text"
                          name="phone"
                          value={formData.phone || ''}
                          onChange={handleChange}
                          required
                          placeholder="+1 555 000 0000"
                        />
                        <small className="cusdash-input-hint">Add country code if applicable.</small>
                      </div>

                      <div className="cusdash-input-group cusdash-input-wide">
                        <label htmlFor="address">Address</label>
                        <input
                          id="address"
                          type="text"
                          name="address"
                          value={formData.address || ''}
                          onChange={handleChange}
                          required
                          placeholder="Street, City, State, ZIP"
                        />
                        <small className="cusdash-input-hint">Used for receipts and service visits.</small>
                      </div>
                    </div>

                    <div className="cusdash-button-row">
                      <button type="submit" className="cusdash-btn cusdash-btn-primary">
                        Save Changes
                      </button>
                      <button
                        type="button"
                        className="cusdash-btn cusdash-btn-danger"
                        onClick={handleDelete}
                      >
                        Delete Account
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {profileTab === 'security' && (
            <div className="cusdash-dashboard-grid cusdash-dashboard-single">
              <div className="cusdash-profile-section-card">
                <h3>Security Settings</h3>
                
                <div className="cusdash-two-step-container">
                  <div className="cusdash-two-step-info">
                    <h4>Two-Step Verification</h4>
                    <p>
                      Add an extra layer of security to your account by requiring a verification code when logging in.
                    </p>
                  </div>

                  <div className="cusdash-two-step-toggle">
                    <label className="cusdash-switch">
                      <input
                        type="checkbox"
                        checked={twoStepEnabled}
                        onChange={handleToggleTwoStep}
                        disabled={loadingTwoStep}
                      />
                      <span className="cusdash-slider round"></span>
                    </label>
                    <span className="cusdash-toggle-status">
                      {twoStepEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>

                {loadingTwoStep && <p className="cusdash-loading-text">Updating settings...</p>}
              </div>
            </div>
          )}

            {profileTab === 'activity' && (
              <div className="cusdash-dashboard-grid cusdash-dashboard-single">
                <div className="cusdash-profile-section-card">
                  <h3>Activity Log</h3>
                  <p>Recent logins and account activity will appear here.</p>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'bookings' && (
          <section className="cusdash-card">
            <h3 className="cusdash-card-title">Your Bookings</h3>
            <p>No bookings found yet.</p>
          </section>
        )}

        {activeTab === 'subscriptions' && (
          <section className="cusdash-card">
            <h3 className="cusdash-card-title">Your Subscriptions</h3>
            <p>No subscriptions found yet.</p>
          </section>
        )}
      </main>
    </div>
  );
};

export default CustomerDashboard;
