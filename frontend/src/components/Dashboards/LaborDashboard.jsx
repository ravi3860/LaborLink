import React, { useEffect, useState } from 'react';
import { getLaborDashboard, updateLabor, deleteLabor } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import {
  FaUser,
  FaCalendarCheck,
  FaRegCreditCard,
  FaSignOutAlt,
  FaEdit,
  FaLock,
  FaHistory,
  FaChartLine,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaIdBadge,
} from 'react-icons/fa';
import './LaborDashboard.css';

const LaborDashboard = () => {
  const [laborData, setLaborData] = useState(null);
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState('profile');
  const [profileTab, setProfileTab] = useState('overview');
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLaborData = async () => {
      try {
        const response = await getLaborDashboard();
        setLaborData(response.data.labor);
        setFormData(response.data.labor);
      } catch (err) {
        console.error('Failed to fetch labor dashboard:', err);
        navigate('/login');
      }
    };
    fetchLaborData();
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      const response = await updateLabor(formData);
      Swal.fire('Details updated successfully!');
      setLaborData(response.data.updatedLabor);
    } catch (error) {
      console.error('Update failed:', error);
      Swal.fire('Failed to update details.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleUpdate();
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete your account? This action is irreversible.'
    );
    if (!confirmDelete) return;
    try {
      await deleteLabor(formData._id);
      Swal.fire('Account deleted successfully.');
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Delete failed:', error);
      Swal.fire('Failed to delete account.');
    }
  };

  if (!laborData) return <p className="labor-loading-text">Loading dashboard...</p>;

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="labor-container">
      {/* Sidebar */}
      <aside className="labor-sidebar">
        <h2 className="labor-sidebar-title">Labor Panel</h2>
        <ul className="labor-sidebar-nav">
          <li
            className={`labor-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <FaUser /> Profile
          </li>
          <li
            className={`labor-nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <FaCalendarCheck /> Bookings
          </li>
          <li
            className={`labor-nav-item ${activeTab === 'subscriptions' ? 'active' : ''}`}
            onClick={() => setActiveTab('subscriptions')}
          >
            <FaRegCreditCard /> Subscriptions
          </li>
          <li className="labor-nav-item labor-logout" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="labor-main-content">
        {/* Header */}
        <div className="labor-header">
          <div>
            <h1>Welcome back, {laborData.name}</h1>
            <p className="labor-subtitle">Here’s a quick overview of your labor account today.</p>
          </div>
          <div className="labor-date">{today}</div>
        </div>

        {/* Quick Stats */}
        <div className="labor-stats">
          <div className="labor-stat-card">
            <div className="labor-stat-top">
              <FaCalendarCheck className="labor-stat-icon" />
              <span className="labor-stat-title">Bookings</span>
            </div>
            <div className="labor-stat-value">{laborData.bookings?.length || 0}</div>
          </div>
          <div className="labor-stat-card">
            <div className="labor-stat-top">
              <FaRegCreditCard className="labor-stat-icon" />
              <span className="labor-stat-title">Subscriptions</span>
            </div>
            <div className="labor-stat-value">{laborData.subscriptions?.length || 0}</div>
          </div>
          <div className="labor-stat-card">
            <div className="labor-stat-top">
              <FaChartLine className="labor-stat-icon" />
              <span className="labor-stat-title">Last Login</span>
            </div>
            <div className="labor-stat-value">{laborData.lastLogin || 'N/A'}</div>
          </div>
        </div>

        {/* Profile Tabs */}
        {activeTab === 'profile' && (
          <>
            <div className="labor-profile-tabs">
              <button
                className={`labor-profile-tab ${profileTab === 'overview' ? 'active' : ''}`}
                onClick={() => setProfileTab('overview')}
              >
                <FaUser /> Overview
              </button>
              <button
                className={`labor-profile-tab ${profileTab === 'edit' ? 'active' : ''}`}
                onClick={() => setProfileTab('edit')}
              >
                <FaEdit /> Edit Profile
              </button>
              <button
                className={`labor-profile-tab ${profileTab === 'security' ? 'active' : ''}`}
                onClick={() => setProfileTab('security')}
              >
                <FaLock /> Security
              </button>
              <button
                className={`labor-profile-tab ${profileTab === 'activity' ? 'active' : ''}`}
                onClick={() => setProfileTab('activity')}
              >
                <FaHistory /> Activity Log
              </button>
            </div>

            {/* Dashboard Content */}
              {/* Overview */}
              
              {profileTab === 'overview' && (
                <>
                <div className="labor-dashboard-grid">
                  <div className="labor-profile-overview">
                    <div className="labor-profile-header">
                      <div className="labor-avatar-circle">{laborData.name?.charAt(0).toUpperCase()}</div>
                      <div className="labor-profile-info">
                        <h3>{laborData.name}</h3>
                        <p className="labor-role-label">{laborData.skillCategory}</p>
                      </div>
                    </div>

                    <div className="labor-profile-section-card">
                      <h4>Contact Information</h4>
                      <p><FaEnvelope /> {laborData.email}</p>
                      <p><FaPhone /> {laborData.phone}</p>
                      <p><FaIdBadge /> {laborData.username}</p>
                    </div>

                    <div className="labor-profile-section-card">
                      <h4>Address</h4>
                      <p><FaMapMarkerAlt /> {laborData.address}</p>
                    </div>

                    <div className="labor-profile-section-card">
                      <h4>Personal Details</h4>
                      <p><strong>Age Category:</strong> {laborData.ageCategory}</p>
                      <p><strong>Skill Category:</strong> {laborData.skillCategory}</p>
                    </div>
                  </div>
                   
                  
                  <div className="labor-activity-timeline">
                    <h3>Recent Activity</h3>
                    {laborData.activity?.length > 0 ? (
                      <ul>
                        {laborData.activity.map((item, idx) => (
                          <li key={idx} className="labor-activity-item">
                            <div className="labor-activity-dot" />
                            <div className="labor-activity-content">
                              <div className="labor-activity-text">{item.description}</div>
                              <div className="labor-activity-date">{item.date}</div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="labor-empty-state">No recent activity</p>
                    )}
                  </div>
                  </div> 
                </>
              )}

              {/* Edit Profile */}
              {profileTab === 'edit' && (
                <div className="labor-profile-update-form">
                  <div className="labor-card-head">
                    <h3 className="labor-card-title">Update Your Details</h3>
                    <p className="labor-card-subtitle">Keep your account information up to date.</p>
                  </div>

                  <form className="labor-form" onSubmit={handleSubmit}>
                    {/* All inputs full width */}
                    {[
                      { field: 'name', label: 'Full Name', placeholder: 'Enter full name', hint: 'This will be displayed on bookings.' },
                      { field: 'username', label: 'Username', placeholder: 'Choose a username', hint: 'Use 4–20 characters.' },
                      { field: 'email', label: 'Email', placeholder: 'name@example.com', hint: 'We’ll send confirmations here.' },
                      { field: 'phone', label: 'Phone', placeholder: '+1 555 000 0000', hint: 'Add country code if applicable.' },
                      { field: 'address', label: 'Address', placeholder: 'Street, City, State', hint: 'Used for receipts and service visits.' }
                    ].map(({ field, label, placeholder, hint }) => (
                      <div className="labor-input-group" key={field}>
                        <label htmlFor={field}>{label}</label>
                        <input
                          id={field}
                          name={field}
                          type={field === 'email' ? 'email' : 'text'}
                          value={formData[field] || ''}
                          onChange={handleChange}
                          required
                          placeholder={placeholder}
                        />
                        {hint && <small className="labor-input-hint">{hint}</small>}
                      </div>
                    ))}

                    {/* Age Category */}
                    <div className="labor-input-group">
                      <label htmlFor="ageCategory">Age Category</label>
                      <select
                        id="ageCategory"
                        name="ageCategory"
                        value={formData.ageCategory || ''}
                        onChange={handleChange}
                        className="labor-select"
                        required
                      >
                        <option value="">Select Age Category</option>
                        <option value="Young Adults">Young Adults (18–25)</option>
                        <option value="Adults">Adults (26–35)</option>
                        <option value="Middle-aged Workers">Middle-aged Workers (36–50)</option>
                        <option value="Senior Workers">Senior Workers (51+)</option>
                      </select>
                    </div>

                    {/* Skill Category */}
                    <div className="labor-input-group">
                      <label htmlFor="skillCategory">Skill Category</label>
                      <select
                        id="skillCategory"
                        name="skillCategory"
                        value={formData.skillCategory || ''}
                        onChange={handleChange}
                        className="labor-select"
                        required
                      >
                        <option value="">Select Skill Category</option>
                        <option value="Masons">Masons</option>
                        <option value="Electricians">Electricians</option>
                        <option value="Plumbers">Plumbers</option>
                        <option value="Painters">Painters</option>
                        <option value="Carpenters">Carpenters</option>
                        <option value="Tile Layers">Tile Layers</option>
                        <option value="Welders">Welders</option>
                        <option value="Roofers">Roofers</option>
                        <option value="Helpers/General Labourers">Helpers/General Labourers</option>
                        <option value="Scaffolders">Scaffolders</option>
                      </select>
                    </div>

                    {/* Buttons */}
                    <div className="labor-button-row">
                      <button type="submit" className="labor-btn labor-btn-primary">
                        Save Changes
                      </button>
                      <button type="button" className="labor-btn labor-btn-danger" onClick={handleDelete}>
                        Delete Account
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Security */}
              {profileTab === 'security' && (
                <div className="labor-profile-section-card">
                  <h3>Security Settings</h3>
                  <p>Password change & 2FA options will appear here.</p>
                </div>
              )}

              {/* Activity */}
              {profileTab === 'activity' && (
                <div className="labor-profile-section-card">
                  <h3>Activity Log</h3>
                  <p>No recent activity.</p>
                </div>
              )}
          </>
        )}

        {/* Bookings */}
        {activeTab === 'bookings' && (
          <section className="labor-card">
            <h3>Your Bookings</h3>
            <p>No bookings yet.</p>
          </section>
        )}

        {/* Subscriptions */}
        {activeTab === 'subscriptions' && (
          <section className="labor-card">
            <h3>Your Subscriptions</h3>
            <p>No subscriptions yet.</p>
          </section>
        )}
      </main>
    </div>
  );
};

export default LaborDashboard;
