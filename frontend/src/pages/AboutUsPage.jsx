import React, { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser } from "react-icons/fi";
import logo from "./logo.png";
import "./AboutUsPage.css";

const AboutUsPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const handleUserIconClick = () => {
    if (!token) navigate("/login");
    else if (role === "Customer") navigate("/customer/dashboard");
    else if (role === "Labor") navigate("/labor/dashboard");
    else if (role === "Admin") navigate("/admin/dashboard");
    else navigate("/login");
  };

  // Number reveal animation
  const milestonesRef = useRef([]);
  useEffect(() => {
    milestonesRef.current.forEach((el) => {
      const target = +el.dataset.target;
      let count = 0;
      const increment = target / 100;
      const updateCounter = () => {
        count += increment;
        if (count < target) {
          el.innerText = Math.floor(count);
          requestAnimationFrame(updateCounter);
        } else {
          el.innerText = target;
        }
      };
      updateCounter();
    });
  }, []);

  const missionValues = [
    {
      icon: "/mission.png",
      title: "Our Mission",
      desc: "Connect workers, contractors, and site managers through a seamless platform promoting productivity, trust, and fair opportunities.",
    },
    {
      icon: "/vision.png",
      title: "Our Vision",
      desc: "To become the leading labor management solution in Sri Lanka and beyond, making workforce management efficient, transparent, and stress-free.",
    },
  ];

  const coreValues = [
    {
      icon: "/in.png",
      title: "Integrity",
      desc: "Honesty, fairness, and transparency in all our dealings.",
    },
    {
      icon: "/uu.png",
      title: "Innovation",
      desc: "We embrace technology to solve real-world workforce challenges.",
    },
    {
      icon: "/co.png",
      title: "Community",
      desc: "Empowering local workers and contractors to thrive together.",
    },
    {
      icon: "/ex.png",
      title: "Excellence",
      desc: "Delivering the highest standards in service and reliability.",
    },
  ];

  const teamMembers = [
    { name: "Shasmitha", role: "Documentation & Reports", initials: "SR" },
    { name: "Ravindu", role: "Development & QA", initials: "RA" },
    { name: "Himath", role: "Development & QA", initials: "HI" },
    { name: "Achintha", role: "User Stories & UML Diagrams", initials: "AC" },
  ];

  const milestones = [
    { label: "Projects Completed", value: 150 },
    { label: "Active Users", value: 1200 },
    { label: "Years of Experience", value: 3 },
    { label: "Trusted Clients", value: 80 },
  ];

  return (
    <div className="aboutus-page">
      {/* Header */}
      <header className="header">
        <div className="header-container">
          <div className="logo-section">
            <img src={logo} alt="Logo" className="logo" />
            <span className="brand-name">LaborLink</span>
          </div>
          <nav className="nav-menu">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/about" className="nav-link active">About Us</Link>
            <Link to="/find-worker" className="nav-link">Find a Worker</Link>
            <Link to="/subscriptions" className="nav-link">Subscriptions</Link>
            <Link to="/contact" className="nav-link">Contact Us</Link>
          </nav>
          <div className="user-icon-link" onClick={handleUserIconClick}>
            <div className="user-icon"><FiUser size={26} /></div>
          </div>
        </div>
      </header>

      {/* Mission & Vision */}
      <section className="mission-values-section">
        <div className="mv-grid">
          {missionValues.map((item, i) => (
            <div className="mv-card" key={i}>
              <img src={item.icon} alt={item.title} className="mv-img" />
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Core Values */}
      <section className="core-values-section">
        <h2 className="section-heading">Our Core Values</h2>
        <div className="values-grid">
          {coreValues.map((value, i) => (
            <div className="value-card" key={i}>
              <img src={value.icon} alt={value.title} className="value-img" />
              <h3>{value.title}</h3>
              <p>{value.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Milestones with number reveal */}
      <section className="milestones-section">
        <div className="milestones-grid">
          {milestones.map((m, i) => (
            <div className="milestone-card" key={i}>
              <h2 ref={el => milestonesRef.current[i] = el} data-target={m.value}>0</h2>
              <p>{m.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <h2 className="section-heading">Meet Our Team</h2>
        <div className="team-grid">
          {teamMembers.map((member, i) => (
            <div className="team-card" key={i}>
              <div className="team-avatar">{member.initials}</div>
              <h3>{member.name}</h3>
              <p>{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-section">
            <h3>About Us</h3>
            <p>
              We bridge the gap between workers, contractors, and site managers,
              making labor management easier and more effective.
            </p>
          </div>

          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/find-worker">Find a Worker</Link></li>
              <li><Link to="/subscriptions">Subscriptions</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Contact Info</h3>
            <p>Email: info@lms.com</p>
            <p>Phone: +94 11 234 5678</p>
            <p>Address: Colombo, Sri Lanka</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} LaborLink. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default AboutUsPage;
