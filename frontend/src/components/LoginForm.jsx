// src/components/LoginForm.jsx
import React, { useState } from 'react';
import { loginUser } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginForm.css';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'Customer',
  });

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser(formData);
      const { token, message, user } = res.data;
      const role = user.role;

      login(token, role);

      alert(message || 'Login Successful');

      if (role === 'Customer') {
        navigate('/customer/dashboard');
      } else if (role === 'Labor') {
        navigate('/labor/dashboard');
      } else if (role === 'Admin') {
        navigate('/admin/dashboard');
      } else {
        alert('Unknown role. Cannot redirect.');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2 className="auth-title">Login to LaborLink</h2>

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

      <p className="switch-link">
        Don’t have an account? <Link to="/register">Register</Link>
      </p>
    </form>
  );
};

export default LoginForm;
