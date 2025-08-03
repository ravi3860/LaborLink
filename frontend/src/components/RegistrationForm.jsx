// src/components/RegistrationForm.jsx
import React, { useState } from 'react';
import { registerCustomer, registerLabor } from '../services/api';
import { Link } from 'react-router-dom';
import './RegistrationForm.css';
import Swal from 'sweetalert2';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    role: 'customer',
    name: '',
    username: '',
    password: '',
    email: '',
    address: '',
    phone: '',
    ageCategory: '',
    skillCategory: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let res;
      const dataToSend = { ...formData };

      if (formData.role === 'customer') {
        delete dataToSend.ageCategory;
        delete dataToSend.skillCategory;
        res = await registerCustomer(dataToSend);
      } else if (formData.role === 'labor') {
        res = await registerLabor(dataToSend);
      } else {
        Swal.fire('Admin cannot register here');
        return;
      }

      Swal.fire(res.data.message || 'Registered Successfully!');

      // ✅ Reset the form fields
      setFormData({
        role: 'customer',
        name: '',
        username: '',
        password: '',
        email: '',
        address: '',
        phone: '',
        ageCategory: '',
        skillCategory: '',
      });

    } catch (error) {
      console.error(error);
      Swal.fire(error.response?.data?.error || error.message || 'Registration failed.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="registration-form">
      <h2 className="form-title">Register in Laborlink</h2>

      <div className="form-group">
        <label htmlFor="role" className="form-label">Role:</label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="form-select"
        >
          <option value="customer">Customer</option>
          <option value="labor">Labor</option>
          <option value="admin" disabled>Admin (Login Only)</option>
        </select>
      </div>

      <div className="form-group">
        <input
          type="text"
          name="name"
          placeholder="Name"
          onChange={handleChange}
          value={formData.name}
          required
          className="form-input"
        />
      </div>

      <div className="form-group">
        <input
          type="text"
          name="username"
          placeholder="Username"
          onChange={handleChange}
          value={formData.username}
          required
          className="form-input"
        />
      </div>

      <div className="form-group">
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          value={formData.password}
          required
          className="form-input"
        />
      </div>

      <div className="form-group">
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          value={formData.email}
          required
          className="form-input"
        />
      </div>

      <div className="form-group">
        <input
          type="text"
          name="address"
          placeholder="Address"
          onChange={handleChange}
          value={formData.address}
          required
          className="form-input"
        />
      </div>

      <div className="form-group">
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          onChange={handleChange}
          value={formData.phone}
          required
          className="form-input"
        />
      </div>

      {formData.role === 'labor' && (
        <>
          <div className="form-group">
            <label htmlFor="ageCategory" className="form-label">Age Category:</label>
            <select
              id="ageCategory"
              name="ageCategory"
              value={formData.ageCategory}
              onChange={handleChange}
              required
              className="form-select"
            >
              <option value="">Select Age Category</option>
              <option value="Young Adults">Young Adults (18–25)</option>
              <option value="Adults">Adults (26–35)</option>
              <option value="Middle-aged Workers">Middle-aged Workers (36–50)</option>
              <option value="Senior Workers">Senior Workers (51+)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="skillCategory" className="form-label">Skill Category:</label>
            <select
              id="skillCategory"
              name="skillCategory"
              value={formData.skillCategory}
              onChange={handleChange}
              required
              className="form-select"
            >
              <option value="">--Select Skill--</option>
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
        </>
      )}

      <button type="submit" className="submit-btn">Register</button>

        <p className="switch-link">
            Already have an account? <Link to="/login">Log in</Link>
        </p>
    </form>
  );
};

export default RegistrationForm;
