
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from "./pages/HomePage";
import AboutUs from "./pages/AboutUsPage";
import FindWorker from "./pages/FindandWorkerPage";
import Subscriptions from "./pages/SubscriptionsPage";
import ContactUs from "./pages/ContactUsPage";
import Register from './pages/RegistrationPage';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/find-worker" element={<FindWorker />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;