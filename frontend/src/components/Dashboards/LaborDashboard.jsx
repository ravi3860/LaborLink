import React, { useEffect, useState } from 'react';
import { getLaborDashboard, updateLabor, deleteLabor, getBookingsForLabor, updateBookingStatus } from '../../services/api';
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
  FaClock,
  FaCalendarDay,
  FaPen 
} from 'react-icons/fa';
import { FaUserAlt, FaBriefcase, FaMoneyBillWave, FaDollarSign, FaTasks, FaTrashAlt, FaPlus, FaBolt, FaCheckCircle} from "react-icons/fa";
import './LaborDashboard.css';

const LaborDashboard = () => {
  const [laborData, setLaborData] = useState(null);
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState('profile');
  const [profileTab, setProfileTab] = useState('overview');
  const [projects, setProjects] = useState(formData.projects || []);
  const [bookingTab, setBookingTab] = useState('current');
  const [bookings, setBookings] = useState([]);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
  const fetchAll = async () => {
    try {
      const res = await getLaborDashboard();
      const labor = res.data.labor;
      setLaborData(labor);
      setFormData(labor);
      setProjects(labor.projects || []);

      // 🔑 fetch bookings for this labor
      const bRes = await getBookingsForLabor(labor._id);
      // backend may return { bookings: [...] } or just [...]
      setBookings(bRes.data.bookings || bRes.data || []);
    } catch (err) {
      console.error('Failed to fetch labor dashboard:', err);
      navigate('/login');
    }
  };
  fetchAll();
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
    setProjects(response.data.updatedLabor.projects || []);
  } catch (error) {
    console.error('Update failed:', error);
    Swal.fire('Failed to update details.');
  }
};

  const handleProfileImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formDataObj = new FormData();
  formDataObj.append("profileImage", file); // must match multer's field name

  try {
    // Assuming you have laborData._id available
    const response = await fetch(
      `http://localhost:2000/api/laborlink/labors/${laborData._id}/upload-profile/`,
      {
        method: "POST",
        body: formDataObj,
        headers: {
          // No need to set Content-Type; browser sets it automatically for FormData
          Authorization: `Bearer ${localStorage.getItem("token")}`, // if you are using token auth
        },
      }
    );

    const data = await response.json();

    if (response.ok) {
      Swal.fire("Profile image updated successfully!");
      setLaborData(data.labor); // update frontend with new image
    } else {
      Swal.fire("Upload failed", data.error || "Unknown error", "error");
    }
  } catch (err) {
    console.error("Error uploading profile image:", err);
    Swal.fire("Upload failed", "An error occurred", "error");
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

  const refreshBookings = async () => {
  const bRes = await getBookingsForLabor(laborData._id);
  setBookings(bRes.data.bookings || bRes.data || []);
};

const handleBookingStatus = async (bookingId, newStatus, reason = '') => {
  try {
    // Send reason along with status
    await updateBookingStatus(bookingId, newStatus, reason);

    Swal.fire(`Booking status updated to ${newStatus}`);
    await refreshBookings();
  } catch (err) {
    console.error('Failed to update booking status:', err);
    Swal.fire('Failed to update booking status.');
  }
};
const norm = s => (s || '').toString().trim().toLowerCase();
const CURRENT = new Set(['pending', 'accepted', 'ongoing']);
const HISTORY = new Set(['completed', 'cancelled', 'declined']);


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
                    <div className="labor-avatar-wrapper">
                      <div className="labor-avatar-circle">
                        {laborData.profileImage ? (
                          <img
                            src={`http://localhost:2000${laborData.profileImage}`}
                            alt="Profile"
                            className="labor-avatar-img"
                          />
                        ) : (
                          <span className="labor-avatar-placeholder">
                            {laborData.name?.charAt(0)}
                          </span>
                        )}
                      </div>

                      {/* Hidden input */}
                      <input
                        type="file"
                        accept="image/*"
                        className="labor-avatar-input"
                        onChange={handleProfileImageUpload}
                        id="avatarUpload"
                      />

                      {/* Icon OUTSIDE circle */}
                      <label htmlFor="avatarUpload" className="labor-avatar-edit-icon">
                        <FaPen />
                      </label>
                    </div>

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
                      <p><strong>Rate:</strong> {laborData.paymentRate ? `Rs. ${laborData.paymentRate}` : "N/A"}</p>
                    </div>
                  </div>

            <div className="labor-projects-overview">
            <h3>Projects</h3>
            {projects?.length > 0 ? (
              <div className="labor-projects-grid">
                {projects.map((proj, idx) => (
                  <div key={idx} className="labor-project-card">
                    {/* Image Placeholder */}
                    <div className="labor-project-image">
                      {proj.image ? (
                        <img 
                          src={proj.image} 
                          alt={proj.projectName} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
                        />
                      ) : (
                        'No image uploaded'
                      )}
                    </div>

                    {/* Project Info */}
                    <div className="labor-project-info">
                      <h4>{proj.projectName || 'Untitled Project'}</h4>
                      <p>{proj.description || 'No description provided.'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="labor-empty-state">No projects added yet.</p>
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
                  <label htmlFor="aboutMe" className="cus-label">
                    <FaUserAlt className="cus-icon" /> About Me
                  </label>
                  <textarea
                    id="aboutMe"
                    name="description"
                    value={formData.description || ''}
                    onChange={handleChange}
                    placeholder="Write a short description about yourself"
                    rows="4"
                    className="cus-textarea"
                  />
                </div>

                {/* Experience */}
                <div className="cus-profile-group">
                  <label htmlFor="experienceYears" className="cus-label">
                    <FaBriefcase className="cus-icon" /> Experience (in years)
                  </label>
                  <input
                    id="experienceYears"
                    name="yearsOfExperience"
                    type="number"
                    value={formData.yearsOfExperience || ''}
                    onChange={handleChange}
                    placeholder="e.g., 5"
                    className="cus-input"
                    min="0"
                  />
                </div>

                {/* Payment Type */}
              <div className="cus-profile-group">
                <label className="cus-label">
                  <FaMoneyBillWave className="cus-icon" /> Payment Type
                </label>
                <div className="cus-payment-options">
                  <button
                    type="button"
                    className={`cus-payment-btn ${formData.paymentType === "Hourly" ? "active" : ""}`}
                    onClick={() => setFormData({ ...formData, paymentType: "Hourly" })}
                  >
                    <FaClock className="cus-payment-icon" />
                    Hourly
                  </button>
                  <button
                    type="button"
                    className={`cus-payment-btn ${formData.paymentType === "Daily" ? "active" : ""}`}
                    onClick={() => setFormData({ ...formData, paymentType: "Daily" })}
                  >
                    <FaCalendarDay className="cus-payment-icon" />
                    Daily
                  </button>
                </div>
              </div>

                {/* Payment Rate */}
                <div className="cus-profile-group">
                  <label htmlFor="paymentRate" className="cus-label">
                    <FaDollarSign className="cus-icon" /> Payment Rate (Rs.) <span className="cus-required">*</span>
                  </label>
                  <input
                    id="paymentRate"
                    name="paymentRate"
                    type="number"
                    value={formData.paymentRate || ''}
                    onChange={handleChange}
                    placeholder="e.g., 20"
                    className="cus-input"
                    required
                    min="1"
                  />
                </div>

                {/* Projects Section */}
                <div className="cus-profile-group">
                  <label className="cus-label">
                    <FaTasks className="cus-icon" /> Projects
                  </label>
                  {projects.map((proj, idx) => (
                    <div key={idx} className="cus-project-row">
                      <input
                        type="text"
                        placeholder="Project Name"
                        value={proj.projectName}
                        onChange={(e) => handleProjectChange(idx, 'projectName', e.target.value)}
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
                        <FaTrashAlt /> Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="cus-btn-add"
                    onClick={addProject}
                  >
                    <FaPlus /> Add Project
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

{activeTab === 'bookings' && (
  <div className="labor-dashboard-grid">
    <section className="labor-card full-width">
      <h3>Your Bookings</h3>

      {/* Booking Stats */}
     <div className="labor-bookings-stats">
      {['Total', 'Pending', 'Accepted', 'Ongoing', 'Completed', 'Cancelled', 'Declined'].map((status, i) => {
        const total = status === 'Total'
          ? bookings.length
          : bookings.filter(b => norm(b.status) === norm(status)).length;
        return (
          <div key={i} className="labor-booking-stat-card">
            <span>{status}</span>
            <strong>{total}</strong>
          </div>
        );
      })}
    </div>


      {/* Booking Sub-tabs */}
      <div className="labor-booking-tabs">
        <button
          className={`labor-booking-tab ${bookingTab === 'current' ? 'active' : ''}`}
          onClick={() => setBookingTab('current')}
        >
          Current Bookings
        </button>
        <button
          className={`labor-booking-tab ${bookingTab === 'history' ? 'active' : ''}`}
          onClick={() => setBookingTab('history')}
        >
          Booking History
        </button>
      </div>

      {/* Booking Content */}
      {bookingTab === 'current' && (
        <div className="labor-bookings-section">
          {bookings.filter(b => CURRENT.has(norm(b.status))).length === 0 ? (
            <p className="labor-empty-state">No current bookings.</p>
          ) : (
            bookings
              .filter(b => CURRENT.has(norm(b.status)))
              .map((booking, idx) => {
                const customerName = booking.customerName || booking.customer?.name || booking.customer?.fullName || 'N/A';
                const serviceName = booking.service || booking.serviceName || booking.category || 'N/A';
                const when = booking.bookingDate || booking.date || booking.scheduledFor || booking.createdAt;
                return (
                  <div key={idx} className={`labor-booking-card ${norm(booking.status)}`}>
                    <div className="labor-booking-info">
                      <p><strong>Customer:</strong> {customerName}</p>
                      <p><strong>Service:</strong> {serviceName}</p>
                      <p><strong>Date:</strong> {when ? new Date(when).toLocaleDateString() : 'N/A'}</p>
                      <span className={`booking-status ${norm(booking.status)}`}>{booking.status}</span>
                    </div>
                    <div className="labor-booking-actions">
                      {norm(booking.status) === 'pending' && (
                        <>
                          <button onClick={() => handleBookingStatus(booking._id, 'Accepted')} className="labor-btn labor-btn-primary">Accept</button>
                          <button onClick={() => { setSelectedBookingId(booking._id); setShowDeclineModal(true); }} className="labor-btn labor-btn-danger">Decline</button>
                        </>
                      )}
                      {norm(booking.status) === 'accepted' || norm(booking.status) === 'ongoing' ? (
                        <>
                          <button onClick={() => handleBookingStatus(booking._id, 'Completed')} className="labor-btn labor-btn-primary">Mark Completed</button>
                          <button onClick={() => handleBookingStatus(booking._id, 'Cancelled')} className="labor-btn labor-btn-danger">Cancel</button>
                        </>
                      ) : null}
                    </div>
                  </div>
                );
              })
          )}
        </div>
      )}


      {bookingTab === 'history' && (
        <div className="labor-bookings-section">
          {bookings.filter(b => HISTORY.has(norm(b.status))).length === 0 ? (
            <p className="labor-empty-state">No past bookings.</p>
          ) : (
            bookings
              .filter(b => HISTORY.has(norm(b.status)))
              .map((booking, idx) => {
                const customerName = booking.customerName || booking.customer?.name || booking.customer?.fullName || 'N/A';
                const serviceName = booking.service || booking.serviceName || booking.category || 'N/A';
                const when = booking.bookingDate || booking.date || booking.scheduledFor || booking.createdAt;
                return (
                  <div key={idx} className={`labor-booking-card history ${norm(booking.status)}`}>
                    <div className="labor-booking-info">
                      <p><strong>Customer:</strong> {customerName}</p>
                      <p><strong>Service:</strong> {serviceName}</p>
                      <p><strong>Date:</strong> {when ? new Date(when).toLocaleDateString() : 'N/A'}</p>
                      <span className={`booking-status ${norm(booking.status)}`}>{booking.status}</span>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      )}
      </section>
    </div>
  )}

        {showDeclineModal && (
          <div className="decline-modal-overlay">
            <div className="decline-modal">
              <h3>Decline Booking</h3>
              <p>Please provide a reason for declining this booking:</p>
              <textarea
                className="decline-textarea"
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Type your reason here..."
              />
              <div className="decline-actions">
                <button 
                  className="labor-btn labor-btn-secondary" 
                  onClick={() => {
                    setDeclineReason("");
                    setShowDeclineModal(false);
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="labor-btn labor-btn-danger"
                  onClick={() => {
                    handleBookingStatus(selectedBookingId, "Cancelled", declineReason);
                    setDeclineReason("");
                    setShowDeclineModal(false);
                  }}
                >
                  Confirm Decline
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Subscriptions */}
        {activeTab === 'subscriptions' && (
  <section className="labor-subscriptions-section">
    <h3 className="section-title">Your Active Subscriptions</h3>

    <div className="labor-subscriptions-grid">
      {[
        {
          name: 'Starter',
          duration: '1 Month',
          features: ['Accept up to 10 Projects', 'Standard Tools Access'],
          active: false,
        },
        {
          name: 'Pro',
          duration: '3 Months',
          features: ['Accept up to 50 Projects', 'Premium Tools Access', 'Priority Support'],
          active: true,
        },
        {
          name: 'Elite',
          duration: '6 Months',
          features: ['Unlimited Projects', 'All Tools Access', '24/7 Support', 'Analytics Dashboard'],
          active: false,
        },
      ].map((plan, index) => (
        <div
          key={index}
          className={`labor-subscription-card ${plan.active ? 'active' : ''}`}
        >
          {plan.active && <div className="active-badge"><FaBolt /> Active</div>}
          <h4 className="plan-name">{plan.name}</h4>
          <p className="plan-duration">{plan.duration}</p>
          <ul className="plan-features">
            {plan.features.map((feat, i) => (
              <li key={i} className="plan-feature">
                <FaCheckCircle className="check-icon" /> {feat}
              </li>
            ))}
          </ul>
          <button className="subscribe-btn">{plan.active ? 'Renew' : 'Upgrade'}</button>
        </div>
      ))}

      {/* Empty State */}
      {false && (
        <div className="empty-state">
          <p>No active subscriptions yet.</p>
          <button className="subscribe-btn">View Plans</button>
        </div>
      )}
    </div>
  </section>
)}
      </main>
    </div>
  );
};

export default LaborDashboard;
