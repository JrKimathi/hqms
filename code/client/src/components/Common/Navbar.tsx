import React from 'react';
import '../../styles/Navbar.css';

interface NavbarProps {
  currentPage: string;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage }) => {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="navbar-logo">
          <div className="logo-icon">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="10" stroke="var(--accent-cyan)" strokeWidth="1.5" />
              <path d="M11 5 L11 11 L15 13" stroke="var(--accent-cyan)" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="11" cy="11" r="2" fill="var(--accent-cyan)" />
            </svg>
          </div>
          <span className="logo-text">QueueSim<span className="logo-accent">MD</span></span>
        </div>
        <div className="navbar-breadcrumb">
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-page">{currentPage}</span>
        </div>
      </div>
      <div className="navbar-right">
        <div className="navbar-status">
          <span className="status-dot status-dot--active" />
          <span className="status-text">System Online</span>
        </div>
        <div className="navbar-divider" />
        <div className="navbar-meta">
          <span className="meta-id">CIT-223-050</span>
        </div>
        <div className="navbar-avatar">
          <span>KN</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;