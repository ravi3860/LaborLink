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
  FaBolt, FaWater, FaPaintBrush, FaCheckCircle, FaHammer, FaTools, FaFire 
} from 'react-icons/fa';
import { format } from "date-fns";
import axios from 'axios';
import { User, Mail, Phone, Clock, DollarSign, BarChart } from "lucide-react";
import { FaUserTie, FaCreditCard, FaClock, FaTimesCircle, FaStar, FaCrown } from 'react-icons/fa';
import { FiChevronRight } from 'react-icons/fi';
import { Tooltip } from 'react-tooltip';

  // Derived display status function
  const getBookingDisplayStatus = (booking) => {
    if (booking.status === 'Accepted' && !booking.payment) {
      return 'Booking accepted – Please pay';
    } else if (booking.payment?.status === 'pending') {
      return 'Payment pending';
    } else if (booking.payment?.status === 'paid') {
      return 'Payment completed';
    } else if (booking.status === 'Pending') {
      return 'Pending';
    }
    return booking.status;
  };

const CustomerDashboard = () => {
  const [customerData, setCustomerData] = useState(null);
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState('profile');
  const [profileTab, setProfileTab] = useState('overview');
  const [twoStepEnabled, setTwoStepEnabled] = useState(false);
  const [loadingTwoStep, setLoadingTwoStep] = useState(false);
  const navigate = useNavigate();

  const [bookingTab, setBookingTab] = useState('create');
  const [services, setServices] = useState([]);
  const [labors, setLabors] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedLabor, setSelectedLabor] = useState(null);

  // Fetch customer dashboard data
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

  // Fetch all available services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get('http://localhost:2000/api/laborlink/services');
        setServices(res.data.services);
      } catch (err) {
        console.error('Failed to fetch services:', err);
      }
    };

    fetchServices();
  }, []);

  // Fetch labors when a service is selected
  useEffect(() => {
    const fetchLabors = async () => {
      if (!selectedService) return;

      try {
        const res = await axios.get(
  `http://localhost:2000/api/laborlink/labors/service/${encodeURIComponent(selectedService.name)}`
);
        setLabors(res.data.labors);
      } catch (err) {
        console.error('Failed to fetch labors for service:', err);
      }
    };

    fetchLabors();
  }, [selectedService]);

  useEffect(() => {
  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token"); // 👈 Get saved token
      const res = await axios.get(
        `http://localhost:2000/api/laborlink/bookings/customer/${customerData._id}`,
        {
          headers: { Authorization: `Bearer ${token}` } // 👈 Attach token
        }
      );
      setCustomerData(prev => ({ ...prev, bookings: res.data }));
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    }
  };

  if (activeTab === "bookings" && bookingTab === "status") fetchBookings();
}, [activeTab, bookingTab, customerData?._id]);


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

  const serviceIcons = {
  Electricians: <FaBolt />,
  Plumbers: <FaWater />,
  Painters: <FaPaintBrush />,
  Masons: <FaHammer />,
  Carpenters: <FaTools />,
  Welders: <FaFire />,
  
};

  function formatLastLogin(dateString) {
    if (!dateString) return "No login record";
    const date = new Date(dateString);
    return format(date, "EEEE, MMMM d, yyyy • hh:mm a");
  }

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
          <p className="cusdash-stat-value">
            {formatLastLogin(customerData.lastLogin)}
          </p>
          <p className="cusdash-stat-date">
            Local Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </p>
        </div>
        </div>

        {/* ---------------- PROFILE ---------------- */}
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

        {/* ---------------- BOOKINGS ---------------- */}
        {activeTab === 'bookings' && (
          <section className="cusdash-card">
            <h3 className="cusdash-card-title">Bookings</h3>

            {/* Sub-tabs */}
            <div className="cusdash-profile-tabs">
              <button
                className={`cusdash-profile-tab ${bookingTab === 'create' ? 'active' : ''}`}
                onClick={() => setBookingTab('create')}
              >
                Create Booking
              </button>
              <button
                className={`cusdash-profile-tab ${bookingTab === 'status' ? 'active' : ''}`}
                onClick={() => setBookingTab('status')}
              >
                Booking Status
              </button>
              <button
                className={`cusdash-profile-tab ${bookingTab === 'history' ? 'active' : ''}`}
                onClick={() => setBookingTab('history')}
              >
                Booking History
              </button>
            </div>
    
            {bookingTab === 'create' && (
              <div>
                {/* Select Service */}
                {!selectedService ? (
                  services && services.length > 0 ? (
                    <div className="cusdash-booking-grid">
                      {services.map((service) => (
                        <div
                          key={service} 
                          className={`cusdash-booking-card ${selectedService?.name === service ? 'selected' : ''}`}
                          onClick={() => setSelectedService({ name: service })}
                        >
                          <div className="cusdash-service-icon">
                            {serviceIcons[service] || <FaTools />}
                          </div>
                          <h4>{service}</h4>
                          <p>{service} services available</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="cusdash-empty-state">No services available at the moment.</p>
                  )
                ) : 
                /* Select Labor */
                !selectedLabor ? (
                  labors && labors.length > 0 ? (
                    <div className="cusdash-labor-grid">
                     {labors.map((labor) => (
                      <div
                        key={labor._id}
                        className={`cusdash-labor-card ${selectedLabor?._id === labor._id ? 'selected' : ''}`}
                        onClick={() => setSelectedLabor(labor)}
                      >
                        {/* Header */}
                        <div className="cusdash-labor-header">
                          <div className="cusdash-profile-pic">
                            {labor.profileImage ? (
                              <img
                                src={`http://localhost:2000${labor.profileImage}`} 
                                alt={labor.name}
                                className="cusdash-labor-avatar-img"
                              />
                            ) : (
                              labor.name.charAt(0).toUpperCase()
                            )}
                          </div>

                          <div>
                            <h4>{labor.name}</h4>
                            <span>{labor.skillCategory || 'General Labor'}</span>
                          </div>
                        </div>

                        {/* Info rows */}
                        <div className="cusdash-labor-info">
                          <p><span className="cusdash-labor-info-icon"><User size={16} /></span> {labor.name}</p>
                          <p><span className="cusdash-labor-info-icon"><Mail size={16} /></span> {labor.email}</p>
                          <p><span className="cusdash-labor-info-icon"><Phone size={16} /></span> {labor.phone}</p>
                          <p><span className="cusdash-labor-info-icon"><Clock size={16} /></span> {labor.yearsOfExperience} yrs Experience</p>
                          <p><span className="cusdash-labor-info-icon"><DollarSign size={16} /></span> {labor.paymentType || 'Not specified'}</p>
                          <p><span className="cusdash-labor-info-icon"><BarChart size={16} /></span> {labor.paymentRate ? `Rs.${labor.paymentRate}/hr` : 'N/A'}</p>
                        </div>

                        {/* Action */}
                        <div className="cusdash-labor-action">
                          <button
                            className="cusdash-btn cusdash-btn-primary"
                            onClick={() => setSelectedLabor(labor)}
                          >
                            Proceed to Booking
                          </button>
                        </div>
                      </div>
                    ))}

                      <button
                        className="cusdash-btn cusdash-btn-secondary"
                        onClick={() => setSelectedService(null)}
                      >
                        Back to Services
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="cusdash-empty-state">No labors available for this service.</p>
                      <button
                        className="cusdash-btn cusdash-btn-secondary"
                        onClick={() => setSelectedService(null)}
                      >
                        Back to Services
                      </button>
                    </div>
                  )
                ) : 
                /* Confirm Booking */
                (
                  <div className="cusdash-summary-card">
                    <h4><FaCheckCircle /> Confirm Booking</h4>
                    <p>Service: {selectedService.name}</p>
                    <p>Labor: {selectedLabor.name}</p>
                     <button
                       className="cusdash-btn cusdash-btn-primary"
                       onClick={() =>
                         navigate(`/bookings/labor/${selectedLabor._id}`, {
                           state: { service: selectedService, labor: selectedLabor },
                         })
                       }
                     > Confirm Booking </button>
                    <button
                      className="cusdash-btn cusdash-btn-secondary"
                      onClick={() => setSelectedLabor(null)}
                    >
                      Back to Labors
                    </button>
                  </div>
                )}
              </div>
            )}

{/* ---------------- BOOKINGS - STATUS (NEW UPGRADE) ---------------- */}
{bookingTab === 'status' && (
  <div className="custat-booking-status-list">
    {customerData.bookings && customerData.bookings.length > 0 ? (
      customerData.bookings.map((booking, index) => {
        const status = getBookingDisplayStatus(booking);

        // determine progress step (0..3)
        const steps = ['Pending', 'Accepted', 'Paid', 'Completed'];
        let activeStep = 0;
        if ((booking.status || '').toLowerCase() === 'pending') activeStep = 0;
        if ((booking.status || '').toLowerCase() === 'accepted') activeStep = 1;
        if (booking.payment?.status === 'paid') activeStep = 2;
        if ((booking.status || '').toLowerCase() === 'completed') activeStep = 3;

        const statusMeta = {
          pending: { icon: <FaClock />, color: 'orange', title: 'Waiting for labor to respond' },
          'booking accepted – please pay': { icon: <FaCreditCard />, color: 'blue', title: 'Labor accepted — please pay' },
          'payment pending': { icon: <FaCreditCard />, color: 'orange', title: 'Payment initiated — awaiting confirmation' },
          'payment completed': { icon: <FaCheckCircle />, color: 'green', title: 'Payment received' },
          completed: { icon: <FaCheckCircle />, color: 'green', title: 'Work completed' },
          cancelled: { icon: <FaTimesCircle />, color: 'red', title: 'Booking cancelled' }
        };

        const meta = statusMeta[status.toLowerCase()] || { icon: <FaTools />, color: 'gray', title: status };

        return (
          <article
            key={booking._id}
            className="custat-booking-status-card glass-card fade-in-up"
            style={{ animationDelay: `${index * 120}ms` }}
            aria-labelledby={`booking-${booking._id}-title`}
          >
            <header className="custat-booking-card-header">
              <div className="custat-booking-left">
                <div className="custat-service-icon">
                  <FaTools />
                </div>
                <div>
                  <h4 id={`booking-${booking._id}-title`} className="custat-booking-title">
                    {booking.serviceName || booking.service}
                  </h4>
                  <div className="custat-booking-sub">
                    <span className="labor-name"><FaUserTie /> {booking.laborId?.name || '—'}</span>
                    <span className="booking-date" title={new Date(booking.bookingDate).toString()}>
                      {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : 'No date'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="custat-booking-right">
                <div
                  className={`custat-status-pill status-pill-${meta.color}`}
                  title={meta.title}
                  aria-label={meta.title}
                >
                  <span className="status-icon">{meta.icon}</span>
                  <span className="status-text">{status}</span>
                </div>
              </div>
            </header>

            {/* Progress timeline */}
            <div className="custat-progress-wrap" aria-hidden="true">
              <div className="custat-progress-line">
                {steps.map((s, idx) => {
                  const stepActive = idx <= activeStep;
                  const stepKey = `step-${booking._id}-${idx}`;
                  return (
                    <div key={stepKey} className={`custat-step ${stepActive ? 'active' : ''}`}>
                      <div className="custat-step-dot">{idx < activeStep ? <FaCheckCircle /> : idx === activeStep ? <FiChevronRight /> : null}</div>
                      <div className="custat-step-label">{s}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Details row */}
            <div className="custat-booking-body">
              <div className="custat-booking-left-col">
                <p className="custat-amount">
                  <strong>Amount:</strong> Rs.{booking.totalAmount ?? booking.payment?.amount ?? '—'}
                </p>
                <p className="custat-payment-type">
                  <strong>Payment type:</strong> {booking.paymentType || '—'}
                </p>
              </div>

              <div className="custat-booking-actions">
                {(status.toLowerCase().includes('please pay') || booking.payment?.status === 'pending') && (
                  <button
                    className="custat-btn custat-btn-primary pulse ripple"
                    onClick={() => navigate(`/payments/booking/${booking._id}`)}
                    title="Pay for this booking"
                    aria-label="Pay now"
                  >
                    <FaCreditCard /> Pay Now
                  </button>
                )}

                <button
                  className="custat-btn custat-btn-ghost"
                  onClick={() => navigate(`/bookings/${booking._id}`)}
                  title="View booking details"
                >
                  View
                </button>
              </div>
            </div>

            <div className="custat-booking-foot">
              <small className="custat-foot-note">
                {status.toLowerCase().includes('pay') ? (
                  <>Tip: Payments are processed securely. You will receive a receipt via email.</>
                ) : (
                  <>Status last updated: {new Date(booking.updatedAt || booking.createdAt).toLocaleString()}</>
                )}
              </small>
            </div>
          </article>
        );
      })
    ) : (
      <div className="custat-empty-state big">
        <div className="empty-illustration">🧾</div>
        <h3>No active bookings</h3>
        <p>Looks like you haven't booked any services yet. Browse services and book a trusted professional.</p>
        <button className="custat-btn custat-btn-primary" onClick={() => setActiveTab('profile')}>Browse Services</button>
      </div>
    )}
  </div>
)}

            {/* Booking History */}
            {bookingTab === 'history' && (
              <div className="cusdash-booking-history-list">
                {customerData.bookings && customerData.bookings.length > 0 ? (
                  customerData.bookings
                    .filter((b) => b.payment?.status === 'paid')
                    .map((booking) => (
                      <div key={booking._id} className="cusdash-booking-history-card">
                        <h4>Service: {booking.serviceName}</h4>
                        <p>Labor: {booking.laborId?.name}</p>
                        <p>Paid Amount: Rs.{booking.payment.amount}</p>
                        <p>Date: {new Date(booking.createdAt).toLocaleDateString()}</p>
                      </div>
                    ))
                ) : (
                  <p className="cusdash-empty-state">No past bookings yet.</p>
                )}
              </div>
            )}
          </section>
        )}

        
     
{/* ---------------- SUBSCRIPTIONS ---------------- */}
{activeTab === 'subscriptions' && (
  <section className="subscriptions-section">
    <h3 className="section-title">Subscription Plans</h3>

    <div className="subscriptions-grid">
      {[
        {
          name: 'Basic',
          price: 'Free',
          features: ['10 Bookings / Month', 'Standard Support'],
        },
        {
          name: 'Standard',
          price: 'Rs.1000 / Month',
          features: ['50 Bookings / Month', 'Priority Support', 'Access to Skilled Labors'],
          popular: true,
        },
        {
          name: 'Premium',
          price: 'Rs.2000 / Month',
          features: ['Unlimited Bookings', '24/7 Support', 'All Labor Categories', 'Analytics'],
        },
      ].map((plan, index) => (
        <div
          key={index}
          className={`subscription-card ${plan.popular ? 'popular' : ''}`}
        >
          {plan.popular && (
            <div className="popular-badge">
              <FaCrown className="crown-icon" /> Most Popular
            </div>
          )}
          <h4 className="plan-name">{plan.name}</h4>
          <p className="plan-price">{plan.price}</p>
          <ul className="plan-features">
            {plan.features.map((feat, i) => (
              <li key={i} className="plan-feature">
                <FaCheckCircle className="check-icon" /> {feat}
              </li>
            ))}
          </ul>
          <button className="subscribe-btn">Subscribe Now</button>
        </div>
      ))}
    </div>
  </section>
)}

      </main>
    </div>
  );
};

export default CustomerDashboard;
