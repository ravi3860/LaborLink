import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import HomePage from "./pages/HomePage";
import AboutUs from "./pages/AboutUsPage";
import FindWorker from "./pages/FindandWorkerPage";
import Subscriptions from "./pages/SubscriptionsPage";
import ContactUs from "./pages/ContactUsPage";
import Register from './pages/RegistrationPage';
import LoginPage from './pages/LoginPage';
import CustomerDashboard from './components/Dashboards/CustomerDashboard';
import LaborDashboard from './components/Dashboards/LaborDashboard';
import AdminDashboard from './components/Dashboards/AdminDashboard';

const ProtectedRoute = ({ children, role }) => {
  const { auth } = useAuth();

  if (!auth.token) return <Navigate to="/login" />;
  if (role && auth.role !== role) return <Navigate to="/" />;

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/find-worker" element={<FindWorker />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route
            path="/customer/dashboard"
            element={
              <ProtectedRoute role="Customer">
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/labor/dashboard"
            element={
              <ProtectedRoute role="Labor">
                <LaborDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute role="Admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;