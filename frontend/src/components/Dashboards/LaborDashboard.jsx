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
  const [projects, setProjects] = useState(formData.projects || []);
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
    const response = await updateLabor({ ...formData, projects });
    Swal.fire('Details updated successfully!');
    setLaborData(response.data.updatedLabor);
  } catch (error) {
    console.error('Update failed:', error);
    Swal.fire('Failed to update details.');
  }
};


  const handleSubmit = (e) => {
    e.preventDefault();
    handleUpdate({ ...formData, projects });
  };

  const addProject = () => {
    setProjects([...projects, { name: '', description: '' }]);
  };

  const removeProject = (index) => {
    const updatedProjects = projects.filter((_, idx) => idx !== index);
    setProjects(updatedProjects);
  };

  const handleProjectChange = (index, field, value) => {
  const updatedProjects = [...projects];
  updatedProjects[index][field] = value;
  setProjects(updatedProjects);
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

                    <div className="labor-profile-section-card">
                      <h4>About Me</h4>
                      <p>{laborData.description || "No description provided."}</p>
                    </div>

                    <div className="labor-profile-section-card">
                      <h4>Experience</h4>
                      <p>{laborData.experience ? `${laborData.experience} years` : "Not specified"}</p>
                    </div>

                    <div className="labor-profile-section-card">
                      <h4>Payment Details</h4>
                      <p><strong>Type:</strong> {laborData.paymentType || "N/A"}</p>
                      <p><strong>Rate:</strong> {laborData.paymentRate ? `$${laborData.paymentRate}` : "N/A"}</p>
                    </div>

                    <div className="labor-profile-section-card">
                    <h4>Projects</h4>
                    {projects.length > 0 ? (
                      <ul>
                        {projects.map((proj, idx) => (
                          <li key={idx}>
                            <strong>{proj.name}:</strong> {proj.description}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No projects added yet.</p>
                    )}
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
                  {[
                    { field: 'name', label: 'Full Name', placeholder: 'Enter full name' },
                    { field: 'username', label: 'Username', placeholder: 'Choose a username' },
                    { field: 'email', label: 'Email', placeholder: 'name@example.com' },
                    { field: 'phone', label: 'Phone', placeholder: '+1 555 000 0000' },
                    { field: 'address', label: 'Address', placeholder: 'Street, City, State' }
                  ].map(({ field, label, placeholder }) => (
                    <div className="labor-input-group" key={field}>
                      <label htmlFor={field}>{label}</label>
                      <input
                        id={field}
                        name={field}
                        type={field === 'email' ? 'email' : 'text'}
                        value={formData[field] || ''}
                        onChange={handleChange}
                        placeholder={placeholder}
                        required
                      />
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

                {/* About Me */}
                <div className="cus-profile-group">
                  <label htmlFor="aboutMe" className="cus-label">About Me</label>
                  <textarea
                    id="aboutMe"
                    name="aboutMe"
                    value={formData.description || ''}
                    onChange={handleChange}
                    placeholder="Write a short description about yourself"
                    rows="4"
                    className="cus-textarea"
                  />
                </div>

                {/* Experience */}
                <div className="cus-profile-group">
                  <label htmlFor="experienceYears" className="cus-label">Experience (in years)</label>
                  <input
                    id="experienceYears"
                    name="experienceYears"
                    type="number"
                    value={formData.experience || ''}
                    onChange={handleChange}
                    placeholder="e.g., 5"
                    className="cus-input"
                  />
                </div>

                {/* Payment Type */}
                <div className="cus-profile-group">
                  <label htmlFor="paymentOption" className="cus-label">Payment Type</label>
                  <select
                    id="paymentOption"
                    name="paymentOption"
                    value={formData.paymentType || ''}
                    onChange={handleChange}
                    className="cus-select"
                  >
                    <option value="">Select Payment Type</option>
                    <option value="Hourly">Hourly</option>
                    <option value="Daily">Daily</option>
                  </select>
                </div>

                {/* Payment Rate */}
                <div className="cus-profile-group">
                  <label htmlFor="paymentRate" className="cus-label">Payment Rate ($) <span className="cus-required">*</span></label>
                  <input
                    id="paymentRate"
                    name="paymentRate"
                    type="number"
                    value={formData.paymentRate || ''}
                    onChange={handleChange}
                    placeholder="e.g., 20"
                    className="cus-input"
                    required
                    min="0"
                  />
                </div>

                {/* Projects Section */}
                <div className="cus-profile-group">
                  <label className="cus-label">Projects</label>
                  {projects.map((proj, idx) => (
                    <div key={idx} className="cus-project-row">
                      <input
                        type="text"
                        placeholder="Project Name"
                        value={proj.name}
                        onChange={(e) => handleProjectChange(idx, 'name', e.target.value)}
                        className="cus-input"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Project Description"
                        value={proj.description}
                        onChange={(e) => handleProjectChange(idx, 'description', e.target.value)}
                        className="cus-input"
                        required
                      />
                      <button
                        type="button"
                        className="cus-btn-remove"
                        onClick={() => removeProject(idx)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="cus-btn-add"
                    onClick={addProject}
                  >
                    + Add Project
                  </button>

                 {/* Buttons */}
                    <div className="labor-button-row">
                      <button type="submit" className="labor-btn labor-btn-primary">
                        Save Changes
                      </button>
                      <button type="button" className="labor-btn labor-btn-danger" onClick={handleDelete}>
                        Delete Account
                      </button>
                    </div>
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
