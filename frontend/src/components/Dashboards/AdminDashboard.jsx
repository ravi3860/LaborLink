import React, { useEffect, useState } from 'react';
import { 
  getAdminDashboard, 
  getAllBookings, 
  getAllCustomers, 
  getAllLabors, 
  updateBookingStatusAsAdmin, 
  deleteBooking, 
  deleteCustomer, 
  deleteLabor 
} from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FaTachometerAlt, FaSignOutAlt, FaUserShield, FaUsers, FaHardHat, FaClipboardList, FaChartLine, FaUser  
} from 'react-icons/fa';
import './AdminDashboard.css';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

// ---------------- DUMMY DATASETS FOR ANALYTICS ----------------
const customerGrowthData = {
  Jan: 5,
  Feb: 8,
  Mar: 12,
  Apr: 20,
  May: 15,
  Jun: 22,
  Jul: 18,
  Aug: 25,
  Sep: 28,
  Oct: 30,
  Nov: 26,
  Dec: 35,
};

const topLaborPerformance = [
  { name: "John Doe", completed: 42 },
  { name: "Jane Smith", completed: 39 },
  { name: "Carlos Vega", completed: 34 },
  { name: "Fatima Ali", completed: 28 },
  { name: "Chen Liu", completed: 25 },
];

const revenueData = {
  Jan: 1200,
  Feb: 1500,
  Mar: 2000,
  Apr: 2500,
  May: 2100,
  Jun: 2700,
  Jul: 3000,
  Aug: 3200,
  Sep: 3100,
  Oct: 4000,
  Nov: 3800,
  Dec: 4500,
};

const futureBookingPrediction = {
  labels: ["Nov", "Dec", "Jan (Next Year)", "Feb (Next Year)", "Mar (Next Year)"],
  data: [38, 45, 50, 55, 62], // simple increasing trend
};


const AdminDashboard = () => {
  const [adminUsername, setAdminUsername] = useState('');
  const [counts, setCounts] = useState({ admins: 0, customers: 0, labors: 0 });
  const [activeTab, setActiveTab] = useState('dashboard');

  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [labors, setLabors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [laborSearch, setLaborSearch] = useState(""); 
  const [laborFilter, setLaborFilter] = useState("");

  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const res = await getAdminDashboard();
        if(res.data?.success){
          setAdminUsername(res.data.adminUsername);
          setCounts({
            admins: res.data.adminCount || 0,
            customers: res.data.customerCount || 0,
            labors: res.data.laborCount || 0,
          });
        } else navigate('/login');

        const [bk, cu, la] = await Promise.all([
          getAllBookings(),
          getAllCustomers(),
          getAllLabors()
        ]);
        setBookings(bk.data.bookings || []);
        setCustomers(cu.data.customers || []);
        setLabors(la.data.labors || []);
      } catch(err){
        navigate('/login');
      }
    }
    fetchAdminData();
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const laborsMonthlyData = [3, 5, 2, 4, 6, 1, 5, 4, 3, 2, 1, 0];

  const countLaborsBySkill = (skill) => {
  return labors.filter(l => l.skillCategory === skill).length;
};

const skillDistributionData = [
  'Masons','Electricians','Plumbers','Painters','Carpenters',
  'Tile Layers','Welders','Roofers','Helpers/General Labourers','Scaffolders'
].map(skill => countLaborsBySkill(skill));

  const handleBookingStatus = async (id, status) => {
  try {
    const res = await updateBookingStatusAsAdmin(id, status);
    if (res.data?.success) {
      setBookings(prev => prev.map(b => 
        b._id === id ? { ...b, status: res.data.updatedBooking.status } : b
      ));
    } else {
      alert('Failed to update booking status.');
    }
  } catch (err) {
    alert('Failed to update booking status.');
  }
};

  const handleDeleteBooking = async (id) => {
    try {
      await deleteBooking(id);
      setBookings(prev => prev.filter(b => b._id !== id));
    } catch(err){
      alert('Failed to delete booking.');
    }
  }

  const handleDeleteUser = async (id, type) => {
    try {
      if(type === 'customer') {
        await deleteCustomer(id);
        setCustomers(prev => prev.filter(c => c._id !== id));
      } else {
        await deleteLabor(id);
        setLabors(prev => prev.filter(l => l._id !== id));
      }
    } catch(err){
      alert(`Failed to delete ${type}.`);
    }
  }

  const bookingStatusCounts = bookings.reduce((acc,b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});

  const monthlyBookingData = bookings.reduce((acc,b) => {
    const month = new Date(b.createdAt).toLocaleString('default',{ month:'short', year:'numeric' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="ad-dsh-dashboard">
      <aside className="ad-dsh-sidebar">
        <h2 className="ad-dsh-logo">LABOR<span>LINK</span></h2>
        <ul className="ad-dsh-nav">
          <li className={`ad-dsh-nav-item ${activeTab==='dashboard'?'active':''}`} onClick={()=>setActiveTab('dashboard')}>
            <FaTachometerAlt className="ad-dsh-icon"/> <span className="ad-dsh-nav-text">Dashboard</span>
          </li>
          <li className={`ad-dsh-nav-item ${activeTab==='bookings'?'active':''}`} onClick={()=>setActiveTab('bookings')}>
            <FaClipboardList className="ad-dsh-icon"/> <span className="ad-dsh-nav-text">Bookings</span>
          </li>
          <li className={`ad-dsh-nav-item ${activeTab==='customers'?'active':''}`} onClick={()=>setActiveTab('customers')}>
            <FaUsers className="ad-dsh-icon"/> <span className="ad-dsh-nav-text">Customers</span>
          </li>
          <li className={`ad-dsh-nav-item ${activeTab==='labors'?'active':''}`} onClick={()=>setActiveTab('labors')}>
            <FaHardHat className="ad-dsh-icon"/> <span className="ad-dsh-nav-text">Labors</span>
          </li>
          <li className={`ad-dsh-nav-item ${activeTab==='analytics'?'active':''}`} onClick={()=>setActiveTab('analytics')}>
            <FaChartLine className="ad-dsh-icon"/> <span className="ad-dsh-nav-text">Analytics</span>
          </li>
          <li className="ad-dsh-nav-item ad-dsh-logout" onClick={handleLogout}>
            <FaSignOutAlt className="ad-dsh-icon"/> <span className="ad-dsh-nav-text">Logout</span>
          </li>
        </ul>
      </aside>

      <div className="ad-dsh-main">
        <header className="ad-dsh-topbar">
          <div>
            <h3 className="ad-dsh-welcome">Welcome, <strong>{adminUsername || 'Admin'}</strong></h3>
            <p className="ad-dsh-sub">Manage the entire platform from here</p>
          </div>
        </header>

        {activeTab==='dashboard' && (
          <section className="ad-dsh-section ad-dsh-dashboard-overview">
            <h2 className="ad-dsh-section-title">System Overview</h2>

            {/* Top Cards */}
            <div className="ad-dsh-cards ad-dsh-cards-overview">
              <div className="ad-dsh-card">
                <div className="ad-dsh-card-top">
                  <FaUserShield className="ad-dsh-card-icon"/>
                </div>
                <h3>{counts.admins}</h3>
                <p>Admins</p>
              </div>

              <div className="ad-dsh-card">
                <div className="ad-dsh-card-top">
                  <FaUsers className="ad-dsh-card-icon"/>
                </div>
                <h3>{counts.customers}</h3>
                <p>Customers</p>
              </div>

              <div className="ad-dsh-card">
                <div className="ad-dsh-card-top">
                  <FaHardHat className="ad-dsh-card-icon"/>
                </div>
                <h3>{counts.labors}</h3>
                <p>Labors</p>
              </div>

              <div className="ad-dsh-card">
                <div className="ad-dsh-card-top">
                  <FaClipboardList className="ad-dsh-card-icon"/>
                </div>
                <h3>{bookings.length}</h3>
                <p>Total Bookings</p>
              </div>
            </div>

            {/* Booking Status Overview */}
            <div className="ad-dsh-booking-overview">
              <h4>Booking Status</h4>
              <div className="ad-dsh-status-cards">
                {['Pending','Accepted','Completed','Canceled'].map(status => (
                  <div key={status} className={`ad-dsh-status-card ${status.toLowerCase()}`}>
                    <span className="status-label">{status}</span>
                    <span className="status-count">{bookingStatusCounts[status] || 0}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mini Chart Section */}
            <div className="ad-dsh-mini-charts">
              <div className="ad-dsh-chart-card">
                <h4>Monthly Bookings</h4>
                <Bar
                  data={{
                    labels: Object.keys(monthlyBookingData),
                    datasets: [{
                      label: 'Bookings',
                      data: Object.values(monthlyBookingData),
                      backgroundColor: '#6D28D9'
                    }]
                  }}
                  options={{ plugins: { legend: { display: false } } }}
                />
              </div>

              <div className="ad-dsh-chart-card">
                <h4>Recent Bookings</h4>
                <ul className="ad-dsh-recent-bookings">
                  {bookings.slice(-5).reverse().map(b => (
                    <li key={b._id}>
                      <strong>{b.customerId?.name || 'N/A'}</strong> → <strong>{b.laborId?.name || 'N/A'}</strong>
                      <span className={`status-label ${b.status.toLowerCase()}`}>{b.status}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}


        {activeTab==='bookings' && (
      <section className="ad-dsh-section">
        <h2 className="ad-dsh-section-title">Manage Bookings</h2>

        {/* Search and Filter */}
        <div className="ad-dsh-booking-filters">
          <input 
            type="text" 
            placeholder="Search by customer or labor..." 
            className="ad-dsh-search"
            onChange={e => setSearchQuery(e.target.value)}
          />
          <select 
            className="ad-dsh-filter" 
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="completed">Completed</option>
            <option value="canceled">Canceled</option>
          </select>
        </div>

        <div className="ad-dsh-booking-cards">
          {bookings
            .filter(b => {
              const customerName = b.customerId?.name?.toLowerCase() || '';
              const laborName = b.laborId?.name?.toLowerCase() || '';
              const status = b.status?.toLowerCase() || '';

              const matchesSearch = !searchQuery || customerName.includes(searchQuery.toLowerCase()) || laborName.includes(searchQuery.toLowerCase());
              const matchesStatus = !filterStatus || status === filterStatus.toLowerCase();

              return matchesSearch && matchesStatus;
            })
            .map(b => (
            <div 
              key={b._id} 
              className={`ad-dsh-booking-card ${selectedBookingId===b._id ? 'selected' : ''}`}
              onClick={() => setSelectedBookingId(b._id)}
              title="Click to select booking"
            >
              <div className="ad-dsh-booking-info">
                <div className="ad-dsh-booking-id">ID: <span>{b._id}</span></div>
                <div className="ad-dsh-booking-user">
                  <FaUser className="ad-dsh-small-icon"/> {b.customerId?.name || 'N/A'}
                </div>
                <div className="ad-dsh-booking-labor">
                  <FaHardHat className="ad-dsh-small-icon"/> {b.laborId?.name || 'N/A'}
                </div>
              </div>

              <div className="ad-dsh-booking-actions">
                <span className={`ad-dsh-status ${b.status}`} title={`Current status: ${b.status}`}>
                  {b.status}
                </span>

                <select 
                  value={b.status} 
                  onChange={e=>handleBookingStatus(b._id, e.target.value)}
                  className={`ad-dsh-dropdown ${b.status}`}
                  aria-label="Change booking status"
                >
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="completed">Completed</option>
                  <option value="canceled">Canceled</option>
                </select>

                <button className="ad-dsh-delete" onClick={()=>handleDeleteBooking(b._id)} title="Delete Booking">
                  <FaClipboardList /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    )}

        {activeTab==='customers' && (
          <section className="ad-dsh-cus-section">
            <h2 className="ad-dsh-cus-title">Manage Customers</h2>

            {/* Search and Filter */}
            <div className="ad-dsh-cus-filters">
              <input 
                type="text" 
                placeholder="Search by name or email..." 
                className="ad-dsh-cus-search"
                onChange={e => setSearchQuery(e.target.value)}
              />
              <select className="ad-dsh-cus-filter" onChange={e => setFilterStatus(e.target.value)}>
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Customer Cards */}
            <div className="ad-dsh-cus-cards">
              {customers
                .filter(c => 
                  (!searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()) 
                  || c.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
                  (!filterStatus || (filterStatus === 'active' ? c.totalBookings > 0 : c.totalBookings === 0))
                )
                .map(c => (
                <div key={c._id} className="ad-dsh-cus-card">
                  {/* Header */}
                  <div className="ad-dsh-cus-header">
                    <h3>{c.name}</h3>
                    <span className="ad-dsh-cus-email">{c.email}</span>
                  </div>

                  {/* Analytics Overview */}
                  <div className="ad-dsh-cus-analytics">
                    <div className="ad-dsh-cus-analytics-item">
                      <p>Total Bookings</p>
                      <span>{c.totalBookings || 0}</span>
                    </div>
                    <div className="ad-dsh-cus-analytics-item">
                      <p>Completed</p>
                      <span>{c.completedBookings || 0}</span>
                    </div>
                    <div className="ad-dsh-cus-analytics-item">
                      <p>Pending</p>
                      <span>{c.pendingBookings || 0}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="ad-dsh-cus-progress">
                    <p>Booking Completion</p>
                    <div className="ad-dsh-cus-progress-bar">
                      <div 
                        className="ad-dsh-cus-progress-fill" 
                        style={{ width: `${c.totalBookings ? (c.completedBookings/c.totalBookings)*100 : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="ad-dsh-cus-actions">
                    <button 
                      className="ad-dsh-cus-delete"
                      onClick={() => handleDeleteUser(c._id, 'customer')}
                    >
                      Delete
                    </button>
                    {/* Optional: Placeholder for mini graph/chart per customer */}
                    <button className="ad-dsh-cus-detail">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}


      {activeTab === 'labors' && (
        <section className="ad-dsh-lb-section">
          <h2 className="ad-dsh-lb-title">Manage Labors</h2>

          {/* Search and Filter */}
          <div className="ad-dsh-lb-filters">
            <input
              type="text"
              placeholder="Search by name or skill..."
              className="ad-dsh-lb-search"
              onChange={(e) => setLaborSearch(e.target.value)}
            />
            <select
              className="ad-dsh-lb-filter"
              onChange={(e) => setLaborFilter(e.target.value)}
            >
              <option value="">All Skills</option>
              <option value="Masons">Masons</option>
              <option value="Electricians">Electricians</option>
              <option value="Plumbers">Plumbers</option>
              <option value="Painters">Painters</option>
              <option value="Carpenters">Carpenters</option>
              <option value="Tile Layers">Tile Layers</option>
              <option value="Welders">Welders</option>
              <option value="Roofers">Roofers</option>
              <option value="Helpers/General Labourers">Helpers</option>
              <option value="Scaffolders">Scaffolders</option>
            </select>
          </div>

          {/* Labor Cards */}
          <div className="ad-dsh-lb-cards">
            {labors
              .filter(
                (l) =>
                  (!laborSearch ||
                    l.name.toLowerCase().includes(laborSearch.toLowerCase()) ||
                    l.skillCategory.toLowerCase().includes(laborSearch.toLowerCase())) &&
                  (!laborFilter || l.skillCategory === laborFilter)
              )
              .map((l) => (
                <div key={l._id} className="ad-dsh-lb-card">
                  {/* Header */}
                  <div className="ad-dsh-lb-header">
                    <h3>{l.name}</h3>
                    <span className="ad-dsh-lb-skill">{l.skillCategory}</span>
                  </div>

                  {/* Analytics Overview */}
                  <div className="ad-dsh-lb-analytics">
                    <div className="ad-dsh-lb-analytics-item">
                      <p>Total Bookings</p>
                      <span>{l.totalBookings || 0}</span>
                    </div>
                    <div className="ad-dsh-lb-analytics-item">
                      <p>Completed</p>
                      <span>{l.completedBookings || 0}</span>
                    </div>
                    <div className="ad-dsh-lb-analytics-item">
                      <p>Pending</p>
                      <span>{l.pendingBookings || 0}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="ad-dsh-lb-progress">
                    <p>Completion Rate</p>
                    <div className="ad-dsh-lb-progress-bar">
                      <div
                        className="ad-dsh-lb-progress-fill"
                        style={{
                          width: `${
                            l.totalBookings
                              ? (l.completedBookings / l.totalBookings) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="ad-dsh-lb-actions">
                    <button
                      className="ad-dsh-lb-delete"
                      onClick={() => handleDeleteUser(l._id, 'labor')}
                    >
                      Delete
                    </button>
                    <button className="ad-dsh-lb-detail">View Analysis</button>
                  </div>
                </div>
              ))}
          </div>

          {/* ---------------- Mini Charts ---------------- */}
          <div className="ad-dsh-lb-mini-charts">
            
            {/* Monthly Bookings */}
            <div className="ad-dsh-chart-card">
              <h4>Monthly Bookings</h4>
              <Bar
                data={{
                  labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
                  datasets: [
                    {
                      label: 'Bookings',
                      data: laborsMonthlyData, // Array of 12 numbers per month
                      backgroundColor: 'rgba(109,40,217,0.7)',
                      borderRadius: 6,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    title: { display: false },
                  },
                  scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } },
                  },
                }}
              />
            </div>

            {/* Skill Distribution */}
            <div className="ad-dsh-chart-card">
              <h4>Skill Distribution</h4>
              <Pie
                data={{
                  labels: [
                    'Masons', 'Electricians', 'Plumbers', 'Painters',
                    'Carpenters', 'Tile Layers', 'Welders', 'Roofers',
                    'Helpers', 'Scaffolders'
                  ],
                  datasets: [
                    {
                      label: 'Labors per Skill',
                      data: skillDistributionData, // Array of 10 numbers
                      backgroundColor: [
                        '#6D28D9', '#A78BFA', '#FBBF24', '#10B981', 
                        '#EF4444', '#F97316', '#3B82F6', '#8B5CF6', 
                        '#F43F5E', '#14B8A6'
                      ],
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'right' },
                  },
                }}
              />
            </div>
        </div>
        </section>
      )}


       {activeTab==='analytics' && (
  <section className="ad-dsh-section">
    <h2 className="ad-dsh-section-title">Analytics & Insights</h2>
    <div className="ad-dsh-charts">

      {/* Booking Status Overview */}
      <div className="ad-dsh-chart-card">
        <h4>Booking Status</h4>
        <Pie 
          data={{
            labels: Object.keys(bookingStatusCounts),
            datasets: [{
              data: Object.values(bookingStatusCounts),
              backgroundColor: ['#6D28D9','#A78BFA','#FBBF24','#EF4444']
            }]
          }}
        />
      </div>

      {/* Monthly Booking Trends */}
      <div className="ad-dsh-chart-card">
        <h4>Monthly Bookings</h4>
        <Bar
          data={{
            labels: Object.keys(monthlyBookingData),
            datasets: [{
              label: 'Bookings',
              data: Object.values(monthlyBookingData),
              backgroundColor: '#6D28D9'
            }]
          }}
        />
      </div>

      {/* Customer Growth */}
      <div className="ad-dsh-chart-card">
        <h4>Customer Growth</h4>
        <Line
          data={{
            labels: Object.keys(customerGrowthData),
            datasets: [{
              label: 'New Customers',
              data: Object.values(customerGrowthData),
              borderColor: '#10B981',
              backgroundColor: 'rgba(16,185,129,0.2)',
              fill: true,
              tension: 0.3
            }]
          }}
        />
      </div>

      {/* Labor Skill Distribution */}
      <div className="ad-dsh-chart-card">
        <h4>Labor Skill Distribution</h4>
        <Doughnut
          data={{
            labels: Object.keys(skillDistributionData),
            datasets: [{
              data: Object.values(skillDistributionData),
              backgroundColor: [
                '#6D28D9','#A78BFA','#FBBF24','#10B981',
                '#EF4444','#3B82F6','#F97316','#14B8A6'
              ]
            }]
          }}
        />
      </div>

      {/* Top Performing Labors */}
      <div className="ad-dsh-chart-card">
        <h4>Top Performing Labors</h4>
        <Bar
          data={{
            labels: topLaborPerformance.map(l => l.name),
            datasets: [{
              label: 'Completed Bookings',
              data: topLaborPerformance.map(l => l.completed),
              backgroundColor: '#A78BFA'
            }]
          }}
          options={{ indexAxis: 'y' }}
        />
      </div>

      {/* Revenue Analysis */}
      <div className="ad-dsh-chart-card">
        <h4>Revenue Analysis</h4>
        <Line
          data={{
            labels: Object.keys(revenueData),
            datasets: [{
              label: 'Revenue ($)',
              data: Object.values(revenueData),
              borderColor: '#F97316',
              backgroundColor: 'rgba(249,115,22,0.2)',
              fill: true,
              tension: 0.3
            }]
          }}
        />
      </div>

      {/* Prediction / Forecast */}
      <div className="ad-dsh-chart-card">
        <h4>Predicted Bookings (Next 3 Months)</h4>
        <Line
          data={{
            labels: futureBookingPrediction.labels,
            datasets: [{
              label: 'Predicted Bookings',
              data: futureBookingPrediction.data,
              borderColor: '#6366F1',
              borderDash: [6,6],
              fill: false
            }]
          }}
        />
      </div>

    </div>
  </section>
)}

      </div>
    </div>
  );
};

export default AdminDashboard;
