import React, { useState } from 'react';
import { loginUser } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginForm.css';
import axios from 'axios';
import Swal from 'sweetalert2';

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
      const data = res.data;
      console.log('Login response:', data);

      if (formData.role === 'Customer') {
        if (data.requiresVerification && data.email) {
          setShowCodeInput(true);
          setEmailForVerification(data.email); // ✅ set actual email from backend
          Swal.fire('Verification Required', data.message || 'Code sent to your email', 'info');
        } else if (data.token && data.user) {
          login(data.token, data.user.role);
          Swal.fire('Success', 'Login successful', 'success').then(() =>
            navigate('/customer/dashboard')
          );
        } else {
          Swal.fire('Error', 'Unexpected response. Please try again.', 'error');
        }
      } else {
        if (data.token && data.user) {
          login(data.token, data.user.role);
          Swal.fire('Success', 'Login successful', 'success').then(() =>
            navigate(`/${data.user.role.toLowerCase()}/dashboard`)
          );
        } else {
          Swal.fire('Login Failed', 'Invalid credentials', 'error');
        }
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', err.response?.data?.error || 'Login failed', 'error');
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:2000/api/laborlink/verify-code', {
        email: emailForVerification,
        code: verificationCode,
      });

      const { token, user, message } = res.data;
      login(token, user.role);
      Swal.fire('Success', message || 'Login successful', 'success').then(() =>
        navigate('/customer/dashboard')
      );
    } catch (err) {
      console.error(err);
      Swal.fire('Verification Failed', err.response?.data?.error || 'Invalid code', 'error');
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
