import React, { useState } from 'react';
import { loginUser } from '../services/api';
import { Link } from 'react-router-dom';
import './LoginForm.css'; 

const LoginForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'Customer',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser(formData);
      alert(res.data.message || 'Login Successful');
      
      // Redirect to dashboard (add routing logic here later)
      // Example:
      // navigate(`/${formData.role}-dashboard`);
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