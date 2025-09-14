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
  FaPen,
  FaMapMarkedAlt,
  FaPhoneAlt,
  FaExclamationTriangle

} from 'react-icons/fa';
import { FaUserAlt, FaBriefcase, FaMoneyBillWave, FaDollarSign, FaTasks, FaTrashAlt, FaPlus, FaBolt, FaCheckCircle} from "react-icons/fa";
import { 
  FaUserCircle, FaTools, FaCalendarAlt, FaBan, FaTrophy, 
  FaCreditCard, FaFolderOpen, FaExternalLinkAlt, 
} from "react-icons/fa";
import { MdPendingActions, MdCancel} from "react-icons/md";
import { AiOutlineAppstore } from "react-icons/ai";
import './LaborDashboard.css';
import axios from 'axios';
import { FaFileInvoice } from "react-icons/fa";

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
  const [bookingAmounts, setBookingAmounts] = useState({});
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

useEffect(() => {
  const fetchAllAmounts = async () => {
    const amounts = {};
    for (let b of bookings) {
      amounts[b._id] = await fetchBookingAmount(b._id);
    }
    setBookingAmounts(amounts);
  };
  if (bookings.length) fetchAllAmounts();
}, [bookings]);

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

const fetchBookingAmount = async (bookingId) => {
  try {
    const token = localStorage.getItem("token"); // labor token
    const res = await axios.get(
      `http://localhost:2000/api/laborlink/bookings/${bookingId}/amount`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data.amount;
  } catch (err) {
    console.error(
      "Failed to fetch booking amount:",
      err.response?.data || err.message
    );
    return 0;
  }
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

// Clear History
const handleClearHistory = async () => {
  if (!window.confirm("Are you sure you want to clear all past bookings? This cannot be undone.")) return;

  try {
    // ✅ Use the correct token key
    const token = localStorage.getItem('token'); 
    const res = await fetch(`http://localhost:2000/api/laborlink/bookings/labor/history/clear`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // ✅ Correct token
      },
    });

    const data = await res.json();
    if (res.ok) {
      Swal.fire('Success', data.message, 'success');
      await refreshBookings(); // refresh bookings after clearing
    } else {
      Swal.fire('Error', data.message || 'Failed to clear history', 'error');
    }
  } catch (err) {
    console.error(err);
    Swal.fire('Error', 'Something went wrong while clearing history.', 'error');
  }
};


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

{/* ----------------- BOOKINGS (redesigned) ----------------- */}
{activeTab === 'bookings' && (
  <div className="lb-bk-dashboard-grid">
    <section className="lb-bk-card full-width">
      <div className="lb-bk-header-row">
        <h3 className="lb-bk-header">
          <FaMapMarkedAlt /> &nbsp; Your Bookings
          <small>Manage customer requests, payments & job statuses</small>
        </h3>

        {/* Stats (small tiles) */}
        <div className="lb-bk-stats">
          {[
            {label: 'Total', icon: <AiOutlineAppstore />},
            {label: 'Pending', icon: <MdPendingActions />},
            {label: 'Accepted', icon: <FaCheckCircle />},
            {label: 'Ongoing', icon: <FaTools />},
            {label: 'Completed', icon: <FaTrophy />},
            {label: 'Cancelled', icon: <MdCancel />},
            {label: 'Declined', icon: <FaBan />}
          ].map((item, i) => {
            const total = item.label === 'Total'
              ? bookings.length
              : bookings.filter(b => norm(b.status) === norm(item.label)).length;
            return (
              <div key={i} className={`lb-bk-stat-card ${norm(item.label)}`}>
                <div className="lb-bk-stat-icon">{item.icon}</div>
                <div className="lb-bk-stat-label">{item.label}</div>
                <div className="lb-bk-stat-value">{total}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="lb-bk-tabs">
        <button className={`lb-bk-tab ${bookingTab === 'current' ? 'active' : ''}`}
                onClick={() => setBookingTab('current')}>
          <FaFolderOpen /> Current
        </button>
        <button className={`lb-bk-tab ${bookingTab === 'history' ? 'active' : ''}`}
                onClick={() => setBookingTab('history')}>
          <FaHistory /> History
        </button>
      </div>

      {/* Current */}
      {bookingTab === 'current' && (
        <div className="lb-bk-section">
          {bookings.filter(b => CURRENT.has(norm(b.status))).length === 0 ? (
            <p className="lb-bk-empty">No current bookings.</p>
          ) : (
            bookings.filter(b => CURRENT.has(norm(b.status))).map((booking, idx) => {
              // details
              const customerName = booking.customerName || booking.customer?.name || 'N/A';
              const serviceName = booking.service || booking.category || 'N/A';
              const when = booking.bookingDate || booking.date || booking.scheduledFor || booking.createdAt;

              // location from booking model
              const lat = booking.locationCoordinates?.lat;
              const lng = booking.locationCoordinates?.lng;
              const address = booking.locationAddress || booking.customer?.address || "No address provided";

              // payment
              const isPaid = booking.payment?.status === 'paid';
              const method = booking.payment?.method;
              const brand = booking.payment?.card?.brand || booking.payment?.brand || null;
              const last4 = booking.payment?.card?.last4 || booking.payment?.last4 || null;
              const receiptUrl = booking.payment?.receiptUrl || booking.payment?.receipt_url || null;
              const paidAt = booking.payment?.paidAt || booking.payment?.capturedAt || booking.payment?.createdAt || null;


              const mapSrc = (lat && lng)
                ? `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`
                : `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed`;

              const mapsLink = (lat && lng)
                ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

              
              return (
                <article key={idx} className={`lb-bk-card-grid ${norm(booking.status)}`} aria-labelledby={`bk-${booking._id}`}>
                  {/* LEFT: Info + map */}
                  <div className="lb-bk-left">
                    <div className="lb-bk-topline">
                      <div className="lb-bk-avatar" title={customerName}>
                        {/* initials */}
                        {customerName.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()}
                      </div>
                      <div className="lb-bk-main-info">
                        <div className="lb-bk-customer">
                          <strong className="lb-bk-name">{customerName}</strong>
                          <span className="lb-bk-service">{serviceName}</span>
                        </div>
                        <div className="lb-bk-meta-row">
                          <div className="lb-bk-meta-item"><FaCalendarAlt /> {when ? new Date(when).toLocaleString() : 'N/A'}</div>
                          <div className="lb-bk-meta-item"><FaPhoneAlt /> {booking.customerPhone || ''}</div>
                        </div>
                      </div>
                    </div>

                    <div className="lb-bk-location-block">
                      <div className="lb-bk-location-title"><FaMapMarkerAlt /> Location</div>
                      <div className="lb-bk-location-text">{address}</div>

                      <div className="lb-bk-map-thumb" role="img" aria-label={`Map for ${address}`}>
                        {/* small iframe thumbnail */}
                        <iframe
                          src={mapSrc}
                          title={`map-${booking._id}`}
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          allowFullScreen
                        />
                        <a className="lb-bk-map-cta" href={mapsLink} target="_blank" rel="noreferrer">
                          <FaExternalLinkAlt /> View larger map
                        </a>
                      </div>
                    </div>

                    <div className="lb-bk-notes">
                      {booking.notes && (
                        <>
                          <div className="lb-bk-notes-title">Notes</div>
                          <div className="lb-bk-notes-text">{booking.notes}</div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* RIGHT: status / payment / actions */}
                  <aside className="lb-bk-right">
                    <div className="lb-bk-status-row">
                      <span className={`lb-bk-status ${norm(booking.status)}`}>
                        {norm(booking.status) === 'pending' && <MdPendingActions />}
                        {norm(booking.status) === 'accepted' && <FaCheckCircle />}
                        {norm(booking.status) === 'ongoing' && <FaTools />}
                        {norm(booking.status) === 'completed' && <FaTrophy />}
                        {norm(booking.status) === 'cancelled' && <MdCancel />}
                        &nbsp; {booking.status}
                      </span>

                     <div className="lb-bk-amount">
  Rs. {bookingAmounts[booking._id]?.toLocaleString() || 0}
</div>
                    </div>

                   {/* Payment panel */}
                    <div className="lb-bk-payment-panel">
                      {booking.payment ? (
                        <>
                          <div className="lb-bk-payment-left">
                            {method === 'card' ? <FaCreditCard /> : <FaMoneyBillWave />}
                          </div>
                          <div className="lb-bk-payment-body">
                            <div className="lb-bk-payment-title">
                              {method === 'card'
                                ? `Paid • ${brand ? brand.toUpperCase() : 'CARD'} ${last4 ? `• • • • ${last4}` : ''}`
                                : booking.payment.status === 'paid'
                                  ? 'Paid (Cash)'
                                  : 'Cash Payment Pending'
                              }
                            </div>
                            <div className="lb-bk-payment-sub">
                              {paidAt
                                ? `Paid on ${new Date(paidAt).toLocaleString()}`
                                : method === 'cash' && booking.payment.status !== 'paid'
                                  ? 'Payment will be recorded after labor marks completed'
                                  : 'Payment recorded'
                              }
                            </div>
                          </div>
                          <div className="lb-bk-payment-actions">
                            {receiptUrl && method === 'card' && (
                              <a className="lb-bk-receipt-btn" href={receiptUrl} target="_blank" rel="noreferrer">
                                <FaFileInvoice /> Receipt
                              </a>
                            )}
                            {booking.payment.status === 'paid' && (
                              <span className="lb-bk-paid-pill"><FaCheckCircle /> Paid</span>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="lb-bk-unpaid">
                          <FaCreditCard /> <strong>Pending payment</strong>
                          <div className="lb-bk-unpaid-sub">Payment will appear here once customer completes it.</div>
                        </div>
                      )}
                    </div>

                    {/* Actions group */}
                    <div className="lb-bk-actions-col">
                      {norm(booking.status) === 'pending' && (
                        <>
                          <button className="lb-bk-btn lb-bk-btn-primary"
                                  onClick={() => handleBookingStatus(booking._id, 'Accepted')}>
                            <FaCheckCircle /> Accept
                          </button>
                          <button className="lb-bk-btn lb-bk-btn-outline"
                                  onClick={() => { setSelectedBookingId(booking._id); setShowDeclineModal(true); }}>
                            <FaBan /> Decline
                          </button>
                        </>
                      )}

                      {(norm(booking.status) === 'accepted' || norm(booking.status) === 'ongoing') && (
                        <>
                          <button
                            className="lb-bk-btn lb-bk-btn-primary"
                            onClick={() => handleBookingStatus(booking._id, 'Completed')}
                            disabled={
                              !booking.payment || // no payment record
                              (method === 'card' && !isPaid) // card not paid
                            }
                            title={
                              !booking.payment
                                ? 'Cannot complete: Payment not recorded yet'
                                : method === 'card' && !isPaid
                                  ? 'Cannot complete before card payment'
                                  : 'Mark as completed'
                            }
                          >
                            <FaCheckCircle /> Mark Completed
                          </button>


                         <button
                            className="lb-bk-btn lb-bk-btn-danger"
                            onClick={() => {
                              setSelectedBookingId(booking._id);
                              setShowDeclineModal(true);
                            }}
                          >
                            <MdCancel /> Cancel
                          </button>


                          <a className="lb-bk-btn lb-bk-btn-ghost" href={mapsLink} target="_blank" rel="noreferrer">
                            <FaExternalLinkAlt /> Navigate
                          </a>
                        </>
                      )}

                      {/* small meta */}
                      <div className="lb-bk-small-meta">
                        <div><strong>ID:</strong> <span className="mono">{booking._id}</span></div>
                        <div><strong>Labor:</strong> {booking.laborId?.name || booking.laborName || '—'}</div>
                      </div>
                    </div>
                  </aside>
                </article>
              );
            })
          )}
        </div>
      )}

      {/* Decline Modal */}
        {showDeclineModal && (
          <div className="lb-bk-decline-overlay">
            <div className="lb-bk-decline-modal">
              <FaExclamationTriangle className="lb-bk-modal-icon"/>
              <h3>Cancel / Decline Booking</h3>
              <p>Please provide a reason for cancelling or declining this booking:</p>
              <textarea
                className="lb-bk-decline-textarea"
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Type your reason here..."
              />
              <div className="lb-bk-decline-actions">
                <button
                  className="lb-bk-btn lb-bk-btn-secondary"
                  onClick={() => {
                    setDeclineReason("");
                    setShowDeclineModal(false);
                  }}
                >
                  Close
                </button>
             <button
                className="lb-bk-btn lb-bk-btn-danger"
                onClick={() => {
                  handleBookingStatus(
                    selectedBookingId, 
                    "Cancelled",
                    declineReason
                  );
                  setDeclineReason("");
                  setShowDeclineModal(false);
                }}
              >
                Confirm Cancel
              </button>

              </div>
            </div>
          </div>
        )}

     {/* History (simpler professional layout) */}
      {bookingTab === 'history' && (
        <div className="lb-bk-section">
          {bookings.filter(b => HISTORY.has(norm(b.status))).length === 0 ? (
            <p className="lb-bk-empty">No past bookings.</p>
          ) : (
            bookings.filter(b => HISTORY.has(norm(b.status))).map((booking, idx) => {
              const customerName = booking.customerName || booking.customer?.name || booking.customer?.fullName || 'N/A';
              const serviceName = booking.service || booking.serviceName || booking.category || 'N/A';
              const when = booking.bookingDate || booking.date || booking.scheduledFor || booking.createdAt;
              const address = booking.locationAddress || booking.address || booking.customer?.address || "No address provided";

              return (
                <div key={idx} className={`lb-bk-card history ${norm(booking.status)}`}>
                  <div className="lb-bk-info">
                    <p><FaUserCircle /> <strong>Customer:</strong> {customerName}</p>
                    <p><FaTools /> <strong>Service:</strong> {serviceName}</p>
                    <p><FaCalendarAlt /> <strong>Date:</strong> {when ? new Date(when).toLocaleDateString() : 'N/A'}</p>
                    <p><FaMapMarkerAlt /> <strong>Location:</strong> {address}</p>
                  </div>
                  <div className="lb-bk-history-meta">
                    <span className={`lb-bk-status ${norm(booking.status)}`}>{booking.status}</span>
                    <div className="lb-bk-small-meta"><strong>ID:</strong> <span className="mono">{booking._id}</span></div>
                  </div>
                </div>
              );
            })
          )}

          {/* Clear History Button */}
          {bookings.filter(b => HISTORY.has(norm(b.status))).length > 0 && (
            <div className="lb-bk-clear-history">
              <button className="lb-bk-btn lb-bk-btn-secondary" onClick={handleClearHistory}>
                <FaTrashAlt /> Clear History
              </button>
            </div>
          )}
        </div>
      )}
    </section>
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
