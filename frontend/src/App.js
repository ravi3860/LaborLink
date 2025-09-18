import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import HomePage from "./pages/HomePage";
import AboutUs from "./pages/AboutUsPage";
import FindWorker from "./pages/FindandWorkerPage";
import Subscriptions from "./pages/SubscriptionsPage";
import ContactUs from "./pages/ContactUsPage";
import RoleSelectionPage from './pages/RoleSelectionPage';
import Register from './pages/RegistrationPage';
import LoginPage from './pages/LoginPage';
import CustomerDashboard from './components/Dashboards/CustomerDashboard';
import LaborDashboard from './components/Dashboards/LaborDashboard';
import AdminDashboard from './components/Dashboards/AdminDashboard';
import BookingForm from "./components/BookingForm";
import PaymentForm from "./components/PaymentForm"; 
import ReviewForm from "./components/ReviewForm";

const ProtectedRoute = ({ children, role }) => {
  const { auth } = useAuth();

  // Debug logs
  console.log("ProtectedRoute check:", auth);

  if (!auth?.token) return <Navigate to="/login" replace />;
  if (role && auth?.role !== role) return <Navigate to="/" replace />;

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
          <Route path="/select-role" element={<RoleSelectionPage />} />
          <Route path="/register/:role" element={<Register />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Dashboards */}
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

          {/* Booking Route */}
          <Route
            path="/bookings/labor/:id"
            element={
              <ProtectedRoute role="Customer">
                <BookingForm />
              </ProtectedRoute>
            }
          />

          {/* ✅ Payment Form Route */}
          <Route
            path="/payments/booking/:id"
            element={
              <ProtectedRoute role="Customer">
                <PaymentForm />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/customer/review/:customerId/:laborId/:bookingId"
            element={
              <ProtectedRoute role="Customer">
                <ReviewForm />
              </ProtectedRoute>
            }
          />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
