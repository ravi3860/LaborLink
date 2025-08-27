import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import "./BookingForm.css";
import { Calendar, Clock, MapPin, DollarSign, FileText, Timer } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { FiUser } from "react-icons/fi";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import logo from '../pages/Black_and_White_Modern_Personal_Brand_Logo-removebg-preview.png';

const BookingForm = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const mapRef = useRef(null);

  const { service, labor } = location.state || {};

  const [formData, setFormData] = useState({
    bookingDate: "",
    bookingTime: "",
    paymentType: labor?.paymentType || "Hourly",
    hours: "",
    days: "",
    notes: "",
    locationAddress: "",
    locationCoordinates: { lat: 0, lng: 0 },
    city: "",
    district: "",
  });

  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [totalAmount, setTotalAmount] = useState(0);

  // ✅ Fetch logged-in customer info
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          Swal.fire("Not Logged In", "Please log in to continue.", "warning");
          navigate("/login");
          return;
        }
        const decoded = jwtDecode(token);
        const customerId = decoded.id;

        const { data } = await axios.get(
          "http://localhost:2000/api/laborlink/customer/dashboard",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setCustomerInfo({
          name: data.customer.name,
          email: data.customer.email,
          phone: data.customer.phone,
          id: customerId,
        });
      } catch (err) {
        console.error("Failed to fetch customer info:", err);
        Swal.fire("Error", "Failed to get customer info. Please log in again.", "error");
        navigate("/login");
      }
    };
    fetchCustomer();
  }, [navigate]);

  // ✅ Google Map Init
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement("script");
      script.src =
        "https://maps.googleapis.com/maps/api/js?key=AIzaSyC7Ryp7xCNU4eLnBO1SlK2sWldalQg_f3I&libraries=places";
      script.async = true;
      script.onload = initMap;
      document.body.appendChild(script);
    } else {
      initMap();
    }
  }, []);

  const initMap = () => {
    if (!mapRef.current) return;

    const initialLocation = { lat: -34.397, lng: 150.644 };
    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: initialLocation,
      zoom: 6,
    });

    const markerInstance = new window.google.maps.Marker({
      position: initialLocation,
      map: mapInstance,
      draggable: true,
    });

    markerInstance.addListener("dragend", () => {
      const position = markerInstance.getPosition();
      const lat = position.lat();
      const lng = position.lng();

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results) => {
        if (results[0]) {
          const address = results[0].formatted_address;
          let city = "",
            district = "";
          results[0].address_components.forEach((comp) => {
            if (comp.types.includes("locality")) city = comp.long_name;
            if (comp.types.includes("administrative_area_level_2"))
              district = comp.long_name;
          });

          setFormData((prev) => ({
            ...prev,
            locationAddress: address,
            locationCoordinates: { lat, lng },
            city,
            district,
          }));
        }
      });
    });
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ✅ Calculate total amount
  useEffect(() => {
    const rate = labor?.paymentRate || 0;
    const hours = formData.hours || 0;
    const days = formData.days || 0;
    const serviceCharge = 1000;
    const amount =
      formData.paymentType === "Hourly"
        ? rate * hours + serviceCharge
        : rate * days + serviceCharge;
    setTotalAmount(amount);
  }, [formData.paymentType, formData.hours, formData.days, labor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire("Not Logged In", "Please log in to book a service.", "warning");
        return;
      }

      if (formData.paymentType === "Hourly" && !formData.hours) {
        Swal.fire("Missing Info", "Please enter number of hours.", "info");
        return;
      }
      if (formData.paymentType === "Daily" && !formData.days) {
        Swal.fire("Missing Info", "Please enter number of days.", "info");
        return;
      }

      const res = await axios.post(
        "http://localhost:2000/api/laborlink/bookings",
        {
          ...formData,
          customerId: customerInfo.id,
          customerName: customerInfo.name,
          customerEmail: customerInfo.email,
          customerPhone: customerInfo.phone,
          laborId: id,
          service: labor?.skillCategory,
          laborRate: labor?.paymentRate,
          totalAmount,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire({
        icon: "success",
        title: "Booking Confirmed 🎉",
        html: `
          <p><strong>Booking ID:</strong> ${res.data.booking._id}</p>
          <p><strong>Total Amount:</strong> Rs.${totalAmount}</p>
        `,
        confirmButtonText: "Go to Dashboard",
        confirmButtonColor: "#3085d6",
        customClass: {
          popup: "b-form-swal",
          title: "b-form-swal-title",
          htmlContainer: "b-form-swal-body",
        },
      }).then(() => {
        navigate("/customer/dashboard");
      });
    } catch (err) {
      console.error("Booking error:", err.response?.data || err.message);
      Swal.fire("Error", err.response?.data?.message || "Booking failed", "error");
    }
  };

  const handleUserIconClick = () => {
    navigate("/login");
  };

  return (
    <>
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

          <div className="mobile-menu-icon">
            <span></span><span></span><span></span>
          </div>
        </div>
      </header>

      {/* ✅ Background Section */}
      <section className="bformlanding-section">
        <div className="b-form-container">
          <h2 className="b-form-title">
            Book {labor?.name || "Selected Labor"} for {service?.name || "Service"}
          </h2>

          {/* ✅ Form */}
          <form className="b-form" onSubmit={handleSubmit}>
            {/* Hidden customer info */}
            <input type="hidden" name="customerName" value={customerInfo.name} />
            <input type="hidden" name="customerEmail" value={customerInfo.email} />
            <input type="hidden" name="customerPhone" value={customerInfo.phone} />

            {/* Grid Layout */}
            <div className="b-form-grid">
              <div className="b-form-field">
                <label><Calendar /> Booking Date</label>
                <input type="date" name="bookingDate" value={formData.bookingDate} onChange={handleChange} required />
              </div>

              <div className="b-form-field">
                <label><Clock /> Booking Time</label>
                <input type="time" name="bookingTime" value={formData.bookingTime} onChange={handleChange} required />
              </div>

              <div className="b-form-field">
                <label><DollarSign /> Payment Type</label>
                <select name="paymentType" value={formData.paymentType} onChange={handleChange}>
                  <option value="Hourly">Hourly</option>
                  <option value="Daily">Daily</option>
                </select>
              </div>

              {formData.paymentType === "Hourly" && (
                <div className="b-form-field">
                  <label><Timer /> Hours</label>
                  <input type="number" name="hours" min="1" value={formData.hours} onChange={handleChange} required />
                </div>
              )}
              {formData.paymentType === "Daily" && (
                <div className="b-form-field">
                  <label><Calendar /> Days</label>
                  <input type="number" name="days" min="1" value={formData.days} onChange={handleChange} required />
                </div>
              )}
            </div>

            <div className="b-form-field">
              <label><MapPin /> Location</label>
              <input type="text" name="locationAddress" value={formData.locationAddress} placeholder="Select location on map" readOnly required />
              <div id="map" ref={mapRef}></div>
              {formData.city && formData.district && (
                <p className="map-info">Selected: {formData.district}, {formData.city}</p>
              )}
            </div>

            <div className="b-form-field">
              <label><FileText /> Notes (Optional)</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Additional info for labor" />
            </div>

            <div className="b-form-total">
              Total Amount: <strong>Rs.{totalAmount}</strong>
            </div>

            <button type="submit" className="b-form-submit">Confirm Booking</button>
          </form>
        </div>
      </section>

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
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon"><FaFacebookF /></a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon"><FaTwitter /></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon"><FaInstagram /></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon"><FaLinkedinIn /></a>
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
    </>
  );
};

export default BookingForm;
