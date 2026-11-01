import React from "react";
import { Link } from "react-router-dom";
import { FiUser, FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import logo from "./logo.png";
import "./ContactUsPage.css";

const ContactUsPage = () => {
  return (
    <div className="contactus-page">
      {/* Navbar */}
      <header className="header">
        <div className="header-container">
          <div className="logo-section">
            <img src={logo} alt="Logo" className="logo" />
          </div>

          <nav className="nav-menu">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/about" className="nav-link">About Us</Link>
            <Link to="/find-worker" className="nav-link">Find a Worker</Link>
            <Link to="/subscriptions" className="nav-link">Subscriptions</Link>
            <Link to="/contact" className="nav-link active">Contact Us</Link>
          </nav>

          <div className="user-icon-link">
            <div className="user-icon">
              <FiUser size={24} color="#6b52ff" />
            </div>
          </div>
        </div>
      </header>

      {/* Banner Image Cards */}
      <section className="contact-banner-cards">
        <div className="card">
          <img src="/conthree.png" alt="Support" />
          <h3>Customer Support</h3>
          <p>24/7 support for all your queries and assistance requests.</p>
        </div>
        <div className="card">
          <img src="/conone.png" alt="Locations" />
          <h3>Multiple Locations</h3>
          <p>Our services are available across major cities in Sri Lanka.</p>
        </div>
        <div className="card">
          <img src="/contwo.png" alt="Quick Response" />
          <h3>Quick Response</h3>
          <p>Immediate help in case of emergency requests.</p>
        </div>
      </section>

      {/* Emergency & Refund Section */}
      <section className="emergency-refund-section">
        <div className="vertical-card">
          <img src="/phone.png" alt="Emergency Hotline" className="vertical-card-image" />
          <div className="vertical-card-details">
            <h2>Emergency Hotline</h2>
            <p>Call us immediately for urgent assistance:</p>
            <p className="highlight">+94 77 123 4567</p>
          </div>
        </div>

        <div className="vertical-card">
          <img src="/trans.png" alt="Transaction & Refund" className="vertical-card-image" />
          <div className="vertical-card-details">
            <h2>Transaction & Refund Info</h2>
            <p>Secure payments and easy refund requests within 7 days of service completion.</p>
            <p className="highlight">Cash or card payments available.</p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-container">
        {/* Contact Info */}
        <div className="contact-info card">
          <h2>Contact Information</h2>
          <p>Fill out the form and our team will respond as quickly as possible.</p>
          <ul>
            <li><FiMail /> info@lms.com</li>
            <li><FiPhone /> +94 11 234 5678</li>
            <li><FiMapPin /> Colombo, Sri Lanka</li>
          </ul>
        </div>

        {/* Contact Form */}
        <div className="contact-form card">
          <h2>Send a Message</h2>
          <form>
            <div className="form-group">
              <input type="text" placeholder="Your Name" required />
            </div>
            <div className="form-group">
              <input type="email" placeholder="Your Email" required />
            </div>
            <div className="form-group">
              <input type="text" placeholder="Subject" required />
            </div>
            <div className="form-group">
              <textarea placeholder="Your Message" rows="6" required></textarea>
            </div>
            <button type="submit" className="send-btn">Send Message</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-about">
            <img src={logo} alt="Logo" className="footer-logo" />
            <p>LaborLink is Sri Lanka’s leading labor management system, connecting workers with opportunities.</p>
          </div>
          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/find-worker">Find a Worker</Link></li>
              <li><Link to="/subscriptions">Subscriptions</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>
          <div className="footer-contact">
            <h4>Contact</h4>
            <p>Email: info@lms.com</p>
            <p>Phone: +94 11 234 5678</p>
            <p>Address: Colombo, Sri Lanka</p>
          </div>
          <div className="footer-social">
            <h4>Follow Us</h4>
            <div className="social-icons">
              <a href="#">🌐</a>
              <a href="#">🐦</a>
              <a href="#">▶️</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          © {new Date().getFullYear()} LaborLink. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default ContactUsPage;
