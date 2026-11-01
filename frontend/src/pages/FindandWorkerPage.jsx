import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiSearch } from "react-icons/fi";
import {
  GiElectric, GiHammerNails, GiPaintBrush, GiPlunger, GiGardeningShears,
  GiBrickWall, GiBroom, GiSteelClaws, GiGears, GiMove,
  GiHammerDrop, GiHandSaw, GiWrench, GiScrewdriver
} from "react-icons/gi";
import logo from "./logo.png";
import "./FindandWorkerPage.css";

const workersData = [
  { id: 1, initials: "SE", name: "Skilled Electrician", location: "Colombo", rate: "LKR 3,500/day", description: "Reliable and experienced in large-scale projects.", rating: 5, experience: "5+ yrs", skill: "Electrician" },
  { id: 2, initials: "MS", name: "Mason Specialist", location: "Kandy", rate: "LKR 2,800/day", description: "Fast, efficient, and detail-oriented mason work.", rating: 4, experience: "7 yrs", skill: "Mason" },
  { id: 3, initials: "SP", name: "Skilled Plumber", location: "Galle", rate: "LKR 4,000/day", description: "10+ years of plumbing experience with major contractors.", rating: 5, experience: "10+ yrs", skill: "Plumber" },
  { id: 4, initials: "CP", name: "Carpenter Pro", location: "Negombo", rate: "LKR 3,200/day", description: "Specialist in furniture & woodwork with custom designs.", rating: 4, experience: "8 yrs", skill: "Carpenter" },
  { id: 5, initials: "HP", name: "House Painter", location: "Colombo", rate: "LKR 2,500/day", description: "Experienced in both residential and commercial painting.", rating: 4, experience: "6 yrs", skill: "Painter" },
  { id: 6, initials: "GC", name: "Gardening Consultant", location: "Kandy", rate: "LKR 2,200/day", description: "Expert in landscaping and plant maintenance.", rating: 5, experience: "5+ yrs", skill: "Gardener" },
];

const FindWorkerPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const handleUserIconClick = () => {
    if (!token) navigate("/login");
    else if (role === "Customer") navigate("/customer/dashboard");
    else if (role === "Labor") navigate("/labor/dashboard");
    else if (role === "Admin") navigate("/admin/dashboard");
    else navigate("/login");
  };

  const filteredWorkers = workersData.filter(worker => {
    const matchesSearch =
      worker.name.toLowerCase().includes(search.toLowerCase()) ||
      worker.location.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "All" || worker.skill.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const skills = [...new Set(workersData.map(w => w.skill))];

  const categories = [
    { icon: <GiElectric size={36} />, title: "Electricians" },
    { icon: <GiPlunger size={36} />, title: "Plumbers" },
    { icon: <GiHammerNails size={36} />, title: "Carpenters" },
    { icon: <GiPaintBrush size={36} />, title: "Painters" },
    { icon: <GiGardeningShears size={36} />, title: "Gardeners" },
    { icon: <GiBrickWall size={36} />, title: "Masons" },
    { icon: <GiBroom size={36} />, title: "Cleaners" },
    { icon: <GiSteelClaws size={36} />, title: "Welders" },
    { icon: <GiGears size={36} />, title: "Technicians" },
    { icon: <GiMove size={36} />, title: "Movers" },
    { icon: <GiHammerDrop size={36} />, title: "Demolition" },
    { icon: <GiHandSaw size={36} />, title: "Woodwork" },
    { icon: <GiWrench size={36} />, title: "Mechanical" },
    { icon: <GiScrewdriver size={36} />, title: "Repair" },
  ];

  const featuredWorks = [
    { id: 1, image: "/homeremovation.png", title: "Home Renovation", desc: "Complete home makeover services." },
    { id: 2, image: "/wallpainting.png", title: "Wall Painting", desc: "Expert painting for residential & commercial." },
    { id: 3, image: "/plumber.png", title: "Plumbing Works", desc: "Professional plumbing services at best rates." },
  ];

  return (
    <div className="findworker-page">
      {/* Navbar */}
      <header className="header">
        <div className="header-container">
          <div className="logo-section">
            <img src={logo} alt="Logo" className="logo" />
          </div>
          <nav className="nav-menu">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/about" className="nav-link">About Us</Link>
            <Link to="/find-worker" className="nav-link active">Find a Worker</Link>
            <Link to="/subscriptions" className="nav-link">Subscriptions</Link>
            <Link to="/contact" className="nav-link">Contact Us</Link>
          </nav>
          <div className="user-icon-link" onClick={handleUserIconClick}>
            <div className="user-icon"><FiUser size={24} /></div>
          </div>
        </div>
      </header>

      {/* Category Banners */}
      <section className="fw-hero-banners">
        {categories.map((cat, idx) => (
          <div key={idx} className="fw-banner-card">
            <div className="fw-banner-icon">{cat.icon}</div>
            <h3>{cat.title}</h3>
          </div>
        ))}
      </section>

      {/* Featured Works */}
      <section className="featured-works">
        {featuredWorks.map(work => (
          <div key={work.id} className="work-card">
            <img src={work.image} alt={work.title} />
            <h4>{work.title}</h4>
            <p>{work.desc}</p>
          </div>
        ))}
      </section>

      {/* Search Section */}
      <section className="search-section">
        <div className="search-box">
          <FiSearch size={20} color="#6b52ff" />
          <input
            type="text"
            placeholder="Search by name or location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </section>

      {/* Filter Badges */}
      <section className="filters-section">
        <div className="filter-group">
          <h4>Filter by Skill:</h4>
          {skills.map(skill => (
            <span
              key={skill}
              className={`filter-badge ${filter === skill ? "active" : ""}`}
              onClick={() => setFilter(skill)}
            >
              {skill}
            </span>
          ))}
          <span
            className={`filter-badge ${filter === "All" ? "active" : ""}`}
            onClick={() => setFilter("All")}
          >
            All
          </span>
        </div>
      </section>

      {/* Workers Slider */}
      <section className="workers-slider">
        <div className="slider-container">
          {filteredWorkers.length > 0 ? (
            filteredWorkers.map(worker => (
              <div key={worker.id} className="worker-card slide-in">
                <div className="avatar">{worker.initials}</div>
                <h3 className="worker-name">{worker.name}</h3>
                <p className="worker-location">📍 {worker.location}</p>
                <p className="worker-rate">{worker.rate}</p>
                <p className="worker-description">{worker.description}</p>
                <p className="worker-experience">Experience: {worker.experience}</p>
                <div className="worker-rating">
                  {"★".repeat(worker.rating)}
                  {"☆".repeat(5 - worker.rating)}
                </div>
                <button className="worker-btn">View Profile</button>
              </div>
            ))
          ) : (
            <p className="no-results">No workers found.</p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-section">
            <h3>About Us</h3>
            <p>Connecting skilled workers with contractors efficiently.</p>
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
          © {new Date().getFullYear()} LaborLink. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default FindWorkerPage;
