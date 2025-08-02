import React, { useEffect, useState } from 'react';
import { getLaborDashboard, updateLabor, deleteLabor } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
      alert('Details updated successfully!');
      setLaborData(response.data.updatedLabor);
    } catch (error) {
      console.error('Update failed:', error);
      alert('Failed to update details.');
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete your account? This action is irreversible.');
    if (!confirmDelete) return;

    try {
      await deleteLabor(formData._id);
      alert('Account deleted successfully.');
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete account.');
    }
  };

  if (!laborData) return <p className="loading-text">Loading dashboard...</p>;

  return (
    <div className="labor-dashboard">
      <aside className="sidebar">
        <h2>Labor Panel</h2>
        <ul>
          <li onClick={() => setActiveTab('profile')} className={activeTab === 'profile' ? 'active' : ''}>Profile</li>
          <li onClick={() => setActiveTab('bookings')} className={activeTab === 'bookings' ? 'active' : ''}>Bookings</li>
          <li onClick={() => setActiveTab('subscriptions')} className={activeTab === 'subscriptions' ? 'active' : ''}>Subscriptions</li>
          <li onClick={handleLogout}>Logout</li>
        </ul>
      </aside>

      <main className="dashboard-content">
        {activeTab === 'profile' && (
          <div className="profile-form-section">
            <h2>Welcome, {laborData.name}</h2>
            <form className="profile-form" onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <label>Name:</label>
                <input name="name" type="text" value={formData.name || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input name="email" type="email" value={formData.email || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Username:</label>
                <input name="username" type="text" value={formData.username || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Address:</label>
                <input name="address" type="text" value={formData.address || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Phone:</label>
                <input name="phone" type="text" value={formData.phone || ''} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Age Category:</label>
                <select
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
                <label>Skill Category:</label>
                <select
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

              <div className="form-buttons">
                <button type="button" className="btn-update" onClick={handleUpdate}>Update Details</button>
                <button type="button" className="btn-delete" onClick={handleDelete}>Delete Account</button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="section">
            <h2>Your Bookings</h2>
            <p>Booking details will appear here.</p>
          </div>
        )}

        {activeTab === 'subscriptions' && (
          <div className="section">
            <h2>Your Subscriptions</h2>
            <p>Subscription info will appear here.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default LaborDashboard;
