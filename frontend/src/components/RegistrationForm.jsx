import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaUser, FaIdBadge, FaLock, FaEnvelope, FaHome, FaPhone, FaChild, FaUserTie, FaUsers, FaUserShield, FaHammer, FaWrench, FaPaintBrush, FaCarSide, FaTools, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { registerCustomer, registerLabor } from '../services/api';
import { useNavigate } from "react-router-dom";
import { FiUser } from 'react-icons/fi';
import Swal from 'sweetalert2';
import './RegistrationForm.css';
import logo from '../pages/Black_and_White_Modern_Personal_Brand_Logo-removebg-preview.png';

const ageOptions = [
  { value: 'Young Adults', label: 'Young Adults (18–25)', icon: <FaChild /> },
  { value: 'Adults', label: 'Adults (26–35)', icon: <FaUserTie /> },
  { value: 'Middle-aged Workers', label: 'Middle-aged (36–50)', icon: <FaUsers /> },
  { value: 'Senior Workers', label: 'Senior (51+)', icon: <FaUserShield /> },
];

const skillOptions = [
  { value: 'Masons', label: 'Masons', icon: <FaHammer /> },
  { value: 'Electricians', label: 'Electricians', icon: <FaWrench /> },
  { value: 'Plumbers', label: 'Plumbers', icon: <FaWrench /> },
  { value: 'Painters', label: 'Painters', icon: <FaPaintBrush /> },
  { value: 'Carpenters', label: 'Carpenters', icon: <FaCarSide /> },
  { value: 'Tile Layers', label: 'Tile Layers', icon: <FaTools /> },
  { value: 'Welders', label: 'Welders', icon: <FaHammer /> },
  { value: 'Roofers', label: 'Roofers', icon: <FaTools /> },
  { value: 'Helpers/General Labourers', label: 'Helpers/General', icon: <FaUsers /> },
  { value: 'Scaffolders', label: 'Scaffolders', icon: <FaHammer /> },
];

const RegistrationForm = () => {
  const { role } = useParams();

  const [formData, setFormData] = useState({
    role: role || 'customer',
    name: '',
    username: '',
    password: '',
    email: '',
    address: '',
    phone: '',
    ageCategory: '',
    skillCategory: '',
    description: '',
    yearsOfExperience: '',
    projects: [{ projectName: '', description: '' }],
    paymentType: '',
    paymentRate: ''
  });

  useEffect(() => {
    setFormData((prev) => ({ ...prev, role: role || 'customer' }));
  }, [role]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelect = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProjectChange = (index, field, value) => {
  const newProjects = [...formData.projects];
  newProjects[index][field] = value;
  setFormData({ ...formData, projects: newProjects });
  };

  const addProject = () => {
    setFormData({ ...formData, projects: [...formData.projects, { projectName: '', description: '' }] });
  };

  const removeProject = (index) => {
    const newProjects = [...formData.projects];
    newProjects.splice(index, 1);
    setFormData({ ...formData, projects: newProjects });
  };

  const navigate = useNavigate();

   const handleUserIconClick = () => {
    navigate('/login'); // ✅ adjust if needed
      };

      const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        let res;
        const dataToSend = { ...formData };

        if (formData.role === 'customer') {
          // Customers don't need labor-specific fields
          delete dataToSend.ageCategory;
          delete dataToSend.skillCategory;
          delete dataToSend.projects;
          delete dataToSend.description;
          delete dataToSend.yearsOfExperience;
          delete dataToSend.paymentType;
          delete dataToSend.paymentRate;

          res = await registerCustomer(dataToSend);

        } else if (formData.role === 'labor') {
          res = await registerLabor(dataToSend);

        } else {
          Swal.fire('Invalid role selection.');
          return;
        }

        Swal.fire(res.data.message || 'Registered Successfully!');

        // Reset formData safely with default structure for both roles
        setFormData({
          role: role || 'customer',
          name: '',
          username: '',
          password: '',
          email: '',
          address: '',
          phone: '',
          ageCategory: '',
          skillCategory: '',
          description: '',
          yearsOfExperience: '',
          projects: [{ projectName: '', description: '' }],
          paymentType: '',
          paymentRate: ''
        });

      } catch (error) {
        Swal.fire(error.response?.data?.error || error.message || 'Registration failed.');
      }
    };

  return (
  <div>
    {/* ✅ Header/Navbar */}
      <header className="header">
              <div className="header-container">
                <div className="logo-section">
                  <span className="logo-text">LaborLink</span>
                </div>
      
                <nav className="nav-menu">
                  <Link to="/" className="nav-link">Home</Link>
                  <Link to="/about" className="nav-link">About Us</Link>
                  <Link to="/find-worker" className="nav-link">Find a Worker</Link>
                  <Link to="/subscriptions" className="nav-link">Subscriptions</Link>
                  <Link to="/contact" className="nav-link">Contact Us</Link>
                </nav>
      
                <div className="user-icon-link" onClick={handleUserIconClick}>
                  <div className="user-icon">
                    <FiUser size={24} />
                  </div>
                </div>
      
                {/* Mobile menu icon placeholder */}
                <div className="mobile-menu-icon">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </header>
      
    <div className="registration-wrapper">
      <div className="rg-shadow-box">
        <div className="rg-header">
          <h2>Register as {role === 'labor' ? 'Labor' : 'Customer'}</h2>
          <p>Please fill out the form below to get started.</p>
        </div>

        <form onSubmit={handleSubmit} className="rg-form">
          <div className="rg-input-group">
            <FaUser className="input-icon" />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="rg-input-group">
            <FaIdBadge className="input-icon" />
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="rg-input-group">
            <FaLock className="input-icon" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="rg-input-group">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="rg-input-group">
            <FaHome className="input-icon" />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="rg-input-group">
            <FaPhone className="input-icon" />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          {formData.role === 'labor' && (
            <>
              <div className="select-group">
                <p className="select-label">Select Age Category</p>
                <div className="select-cards">
                  {ageOptions.map((opt) => (
                    <div
                      key={opt.value}
                      className={`select-card ${formData.ageCategory === opt.value ? 'selected' : ''}`}
                      onClick={() => handleSelect('ageCategory', opt.value)}
                    >
                      {opt.icon}
                      <span>{opt.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="select-group">
                <p className="select-label">Select Skill Category</p>
                <div className="select-cards">
                  {skillOptions.map((opt) => (
                    <div
                      key={opt.value}
                      className={`select-card ${formData.skillCategory === opt.value ? 'selected' : ''}`}
                      onClick={() => handleSelect('skillCategory', opt.value)}
                    >
                      {opt.icon}
                      <span>{opt.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Years of Experience */}
              <div className="rg-input-group">
                <input
                  type="number"
                  name="yearsOfExperience"
                  placeholder="Years of Experience"
                  value={formData.yearsOfExperience}
                  onChange={handleChange}
                />
              </div>

              {/* Payment Type */}
              <div className="rg-input-group">
                <select
                  name="paymentType"
                  value={formData.paymentType}
                  onChange={handleChange}
                >
                  <option value="">Select Payment Type</option>
                  <option value="Hourly">Hourly</option>
                  <option value="Daily">Daily</option>
                </select>
              </div>

              {/* Payment Rate */}
              <div className="rg-input-group">
                <input
                  type="number"
                  name="paymentRate"
                  placeholder="Payment Rate"
                  value={formData.paymentRate}
                  onChange={handleChange}
                />
              </div>

              {/* Self-description */}
              <div className="rg-input-group">
                <textarea
                  name="description"
                  placeholder="Tell us about yourself"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                />
              </div>

              {/* Projects */}
              <div className="projects-section">
                <h4>Projects</h4>
                {formData.projects.map((proj, index) => (
                  <div key={index} className="project-input-group">
                    <input
                      type="text"
                      placeholder="Project Name"
                      value={proj.projectName}
                      onChange={(e) => handleProjectChange(index, 'projectName', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Project Description"
                      value={proj.description}
                      onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                    />
                    <button type="button" onClick={() => removeProject(index)}>Remove</button>
                  </div>
                ))}
                <button type="button" onClick={addProject}>Add Project</button>
              </div>
            </>
          )}

          <button type="submit" className="rg-submit-btn">Next Step</button>
          <p className="rg-login-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
    {/* ✅ Footer */}
          <footer className="footer">
                  <div className="footer-container">
                    {/* Company Info */}
                    <div className="footer-section company-info">
                      <div className="footer-logo-container">
                        <img src={logo} alt="Logo" className="logo" />
                      </div>
                      <p className="footer-text">Your Trusted Property Partner</p>
                      <p className="footer-text">Connecting buyers and sellers with ease and transparency.</p>
                      <div className="social-icons">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                          <FaFacebookF />
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                          <FaTwitter />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                          <FaInstagram />
                        </a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                          <FaLinkedinIn />
                        </a>
                      </div>
                    </div>
          
                    {/* Quick Links */}
                    <div className="footer-section quick-links">
                      <h3>Quick Links</h3>
                      <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/about">About Us</Link></li>
                        <li><Link to="/find-worker">Find a Worker</Link></li>
                        <li><Link to="/subscriptions">Subscriptions</Link></li>
                        <li><Link to="/contact">Contact Us</Link></li>
                      </ul>
                    </div>
          
                    {/* Helpful Resources */}
                    <div className="footer-section helpful-resources">
                      <h3>Helpful Resources</h3>
                      <ul>
                        <li><a href="/">Terms & Conditions</a></li>
                        <li><a href="/">Privacy Policy</a></li>
                        <li><a href="/">Blog</a></li>
                        <li><a href="/">Support Center</a></li>
                        <li><a href="/">How It Works</a></li>
                      </ul>
                    </div>
          
                    {/* Contact Info */}
                    <div className="footer-section contact-info">
                      <h3>Contact Info</h3>
                      <p>Email: info@lms.com</p>
                      <p>Phone: +94 11 234 5678</p>
                      <p>Address: 123 Main Street, Colombo, Sri Lanka</p>
                    </div>
                  </div>
          
                  <div className="footer-bottom">
                    <p>© {new Date().getFullYear()} LaborLink. All rights reserved.</p>
                  </div>
                </footer>
  </div>
  );
};

export default RegistrationForm;
