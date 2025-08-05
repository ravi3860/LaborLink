import React, { useEffect, useState } from 'react';
import { getLaborDashboard, updateLabor, deleteLabor } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import { FaUser, FaCalendarCheck, FaRegCreditCard, FaSignOutAlt} from 'react-icons/fa';
import './LaborDashboard.css';

const LaborDashboard = () => {
  const [laborData, setLaborData] = useState(null);
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState('profile');
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

    const form = e.target;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    handleUpdate();
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete your account? This action is irreversible.');
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

  if (!laborData) return <p className="loading-text">Loading dashboard...</p>;

  return (
    <div className="labor-dashboard">
      <aside className="labor-sidebar">
        <h2>Labor Panel</h2>
        <ul className="nav-list">
          <li onClick={() => setActiveTab('profile')} className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}>
           <FaUser /> Profile
          </li>
          <li onClick={() => setActiveTab('bookings')} className={`nav-item ${activeTab === 'bookings' ? 'active' : ''}`}>
            <FaCalendarCheck /> Bookings
          </li>
          <li onClick={() => setActiveTab('subscriptions')} className={`nav-item ${activeTab === 'subscriptions' ? 'active' : ''}`}>
            <FaRegCreditCard /> Subscriptions
          </li>
          <li onClick={handleLogout} className="nav-item logout-item"><FaSignOutAlt /> Logout</li>
        </ul>
      </aside>

      <main className="labor-main">
        {activeTab === 'profile' && (
          <section className="profile-section">
            <h2 className="section-title">Welcome, {laborData.name}</h2>
            <form className="profile-form" onSubmit={handleSubmit} noValidate>
              {['name', 'email', 'username', 'address', 'phone'].map((field) => (
                <div className="form-group" key={field}>
                  <label htmlFor={field}>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
                  <input
                    id={field}
                    name={field}
                    type={field === 'email' ? 'email' : 'text'}
                    value={formData[field] || ''}
                    onChange={handleChange}
                    required
                  />
                </div>
              ))}

              <div className="form-group">
                <label htmlFor="ageCategory">Age Category:</label>
                <select
                  id="ageCategory"
                  name="ageCategory"
                  value={formData.ageCategory || ''}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Age Category</option>
                  <option value="Young Adults">Young Adults (18–25)</option>
                  <option value="Adults">Adults (26–35)</option>
                  <option value="Middle-aged Workers">Middle-aged Workers (36–50)</option>
                  <option value="Senior Workers">Senior Workers (51+)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="skillCategory">Skill Category:</label>
                <select
                  id="skillCategory"
                  name="skillCategory"
                  value={formData.skillCategory || ''}
                  onChange={handleChange}
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

              <div className="form-actions">
                <button type="submit" className="btn btn-update">Update Details</button>
                <button type="button" className="btn btn-delete" onClick={handleDelete}>Delete Account</button>
              </div>
            </form>
          </section>
        )}

        {activeTab === 'bookings' && (
          <section className="bookings-section section-placeholder">
            <h2 className="section-title">Your Bookings</h2>
            <p>Booking details will appear here.</p>
          </section>
        )}

        {activeTab === 'subscriptions' && (
          <section className="subscriptions-section section-placeholder">
            <h2 className="section-title">Your Subscriptions</h2>
            <p>Subscription info will appear here.</p>
          </section>
        )}
      </main>
    </div>
  );
};

export default LaborDashboard;


