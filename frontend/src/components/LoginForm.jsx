import React, { useState } from 'react';
import { loginUser } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginForm.css';
import axios from 'axios';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'Customer',
  });

  const [showCodeInput, setShowCodeInput] = useState(false);
  const [emailForVerification, setEmailForVerification] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser(formData);
      console.log('Login response:', res.data);

      if (formData.role === 'Customer') {
        if (res.data.requiresVerification && res.data.email) {
          setShowCodeInput(true);
          setEmailForVerification(res.data.email);  // Use backend email here
          alert(res.data.message || 'Verification code sent to your email.');
        } else if (res.data.token && res.data.user) {
          login(res.data.token, res.data.user.role);
          navigate('/customer/dashboard');
        } else {
          alert('Unexpected response. Please try again.');
        }
      } else {
        if (res.data.token && res.data.user) {
          login(res.data.token, res.data.user.role);
          navigate(`/${res.data.user.role.toLowerCase()}/dashboard`);
        } else {
          alert('Login failed. Please try again.');
        }
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Login failed');
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:2000/api/laborlink/verify-code', {
        email: emailForVerification,
        code: verificationCode
      });

      const { token, user, message } = res.data;
      login(token, user.role);
      alert(message || 'Login successful');
      navigate('/customer/dashboard');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Verification failed');
    }
  };

  return (
    <form onSubmit={showCodeInput ? handleCodeSubmit : handleLogin} className="auth-form">
      <h2 className="auth-title">Login to LaborLink</h2>

      {!showCodeInput && (
        <>
          <div className="auth-group">
            <label htmlFor="role">Select Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="auth-select"
            >
              <option value="Customer">Customer</option>
              <option value="Labor">Labor</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div className="auth-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              name="username"
              id="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              className="auth-input"
              required
            />
          </div>

          <div className="auth-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className="auth-input"
              required
            />
          </div>

          <button type="submit" className="auth-button">Login</button>
        </>
      )}

      {showCodeInput && (
        <>
          <div className="auth-group">
            <label htmlFor="code">Enter Verification Code</label>
            <input
              type="text"
              name="code"
              id="code"
              placeholder="Enter code sent to your email"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="auth-input"
              required
            />
          </div>
          <button type="submit" className="auth-button">Verify & Login</button>
        </>
      )}

      {!showCodeInput && (
        <p className="switch-link">
          Don’t have an account? <Link to="/register">Register</Link>
        </p>
      )}
    </form>
  );
};

export default LoginForm;
