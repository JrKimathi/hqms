import React from 'react';
import { useThemeStore } from '../../store/themeStore';
import '../../styles/Navbar.css';

interface NavbarProps {
  currentPage: string;
  toggleSidebar: () => void; // NEW
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, toggleSidebar }) => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <header className="navbar">
      <div className="navbar-left">
        {/* NEW: Hamburger Menu Button */}
        <button className="menu-toggle" onClick={toggleSidebar} aria-label="Toggle menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

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
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'light' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
};

export default Navbar;