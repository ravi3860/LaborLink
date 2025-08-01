import React, { useState } from 'react';
import axios from 'axios';

const RegistrationForm = () => {
  const [role, setRole] = useState('Customer'); // default role
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    email: '',
    address: '',
    phone: '',
    ageCategory: '',
    skillCategory: '',
  });
  const [message, setMessage] = useState('');

  const skillOptions = [
    'Masons', 'Electricians', 'Plumbers', 'Painters', 'Carpenters',
    'Tile Layers', 'Welders', 'Roofers', 'Helpers/General Labourers', 'Scaffolders'
  ];

  const ageOptions = [
    'Young Adults', // 18–25 years
    'Adults',       // 26–35 years
    'Middle-aged Workers', // 36–50 years
    'Senior Workers' // 51 years and above
  ];

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setFormData({
      name: '',
      username: '',
      password: '',
      email: '',
      address: '',
      phone: '',
      ageCategory: '',
      skillCategory: '',
    });
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let url = '';

      if (role === 'Customer') {
        url = '/api/customer/register';
      } else if (role === 'Labor') {
        url = '/api/labor/register';
      }

      const dataToSend = {
        name: formData.name,
        username: formData.username,
        password: formData.password,
        email: formData.email,
        address: formData.address,
        phone: formData.phone,
      };

      // Append labor-only fields if labor
      if (role === 'Labor') {
        dataToSend.ageCategory = formData.ageCategory;
        dataToSend.skillCategory = formData.skillCategory;
      }

      const response = await axios.post(url, dataToSend);

      setMessage(response.data.message);
      setFormData({
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
      setMessage(error.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto' }}>
      <h2>Register</h2>

      <label>
        Select Role:
        <select value={role} onChange={handleRoleChange}>
          <option value="Customer">Customer</option>
          <option value="Labor">Labor</option>
        </select>
      </label>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          required
        />

        {role === 'Labor' && (
          <>
            <label>
              Age Category:
              <select
                name="ageCategory"
                value={formData.ageCategory}
                onChange={handleChange}
                required
              >
                <option value="">Select Age Category</option>
                {ageOptions.map((age) => (
                  <option key={age} value={age}>
                    {age}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Skill Category:
              <select
                name="skillCategory"
                value={formData.skillCategory}
                onChange={handleChange}
                required
              >
                <option value="">Select Skill Category</option>
                {skillOptions.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}

        <button type="submit" style={{ marginTop: '10px' }}>
          Register
        </button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
};

export default RegistrationForm;