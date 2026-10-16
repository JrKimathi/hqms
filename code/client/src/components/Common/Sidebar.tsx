import React from 'react';
import '../../styles/Sidebar.css';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

const DashboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="11" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="1" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="11" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const UploadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M3 12v2a2 2 0 002 2h8a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M9 1v10M6 4l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SimIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M9 5v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const ResultsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M3 14 L6 9 L9 11 L12 6 L15 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="1" y="1" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const InsightsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M9 12v4M7 15h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M4.5 3.5 L3 2M13.5 3.5 L15 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const navItems: NavItem[] = [
  { id: 'dashboard',   label: 'Dashboard',   icon: <DashboardIcon /> },
  { id: 'upload',      label: 'Upload Data', icon: <UploadIcon />    },
  { id: 'simulation',  label: 'Simulation',  icon: <SimIcon />,       badge: 'Run' },
  { id: 'results',     label: 'Results',     icon: <ResultsIcon />   },
  { id: 'insights',    label: 'Insights',    icon: <InsightsIcon />  },
];

const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  isOpen,
  toggleSidebar,
}) => {
  return (
    <>
      {/* Mobile backdrop overlay — clicking it closes the drawer */}
      {isOpen && <div className="sidebar-backdrop" onClick={toggleSidebar} />}

      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Navigation</div>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-item ${activePage === item.id ? 'sidebar-item--active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="sidebar-item-icon">{item.icon}</span>
              <span className="sidebar-item-label">{item.label}</span>
              {item.badge && <span className="sidebar-item-badge">{item.badge}</span>}
              {activePage === item.id && <span className="sidebar-item-indicator" />}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;