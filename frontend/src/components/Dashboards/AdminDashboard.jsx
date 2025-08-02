import React, { useEffect, useState } from 'react';
import { getAdminDashboard } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [adminUsername, setAdminUsername] = useState('');
  const [counts, setCounts] = useState({ admins: 0, customers: 0, labors: 0 });
  const [activeTab, setActiveTab] = useState('dashboard');
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await getAdminDashboard();
        setAdminUsername(response.data.adminUsername);
        setCounts({
          admins: response.data.adminCount || 0,
          customers: response.data.customerCount || 0,
          labors: response.data.laborCount || 0,
        });
      } catch (error) {
        console.error('Failed to fetch admin dashboard:', error);
        navigate('/login');
      }
    };

    fetchAdminData();
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!adminUsername) {
    return <p className="loading-text">Loading admin dashboard...</p>;
  }

  return (
    <div className="admin-dashboard">
      <aside className="sidebar">
        <h2>Admin Panel</h2>
        <ul>
          <li onClick={() => setActiveTab('dashboard')}>Dashboard</li>
          <li onClick={handleLogout}>Logout</li>
        </ul>
      </aside>

      <main className="dashboard-content">
        {activeTab === 'dashboard' && (
          <div className="section">
            <h2>Welcome, {adminUsername}</h2>
            <p className="summary-text">System Overview</p>
            <div className="summary-boxes">
              <div className="summary-box">
                <h3>{counts.admins}</h3>
                <p>Admins</p>
              </div>
              <div className="summary-box">
                <h3>{counts.customers}</h3>
                <p>Customers</p>
              </div>
              <div className="summary-box">
                <h3>{counts.labors}</h3>
                <p>Labors</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
