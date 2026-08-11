import React from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  History,
  FileText,
  UserCheck,
  LogOut,
  Building2,
  BarChart3,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logoTransparent from '../../assets/logo-transparent.png';

export const AppLayout: React.FC = () => {
  const { user, logout, isAdmin, isSales, isWarehouse, isAccounts } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Determine visual duality class based on route path
  const getDualityClass = () => {
    const path = location.pathname;
    if (path.startsWith('/customers')) return 'duality-crm';
    if (path.startsWith('/products')) return 'duality-inventory';
    if (path.startsWith('/challans')) return 'duality-challans';
    if (path.startsWith('/stock-movements')) return 'duality-inventory';
    if (path.startsWith('/users')) return 'duality-admin';
    return 'duality-crm';
  };

  // Helper for role badge styling
  const getRoleClass = (role?: string) => {
    switch (role) {
      case 'ADMIN': return 'role-admin';
      case 'SALES': return 'role-sales';
      case 'WAREHOUSE': return 'role-warehouse';
      case 'ACCOUNTS': return 'role-accounts';
      default: return 'role-admin';
    }
  };

  return (
    <div className={`app-container ${getDualityClass()}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header" style={{ gap: '10px' }}>
          <img
            src={logoTransparent}
            alt="ProcessifyERP Logo"
            className="sidebar-logo"
            style={{ height: '36px', width: 'auto', maxWidth: '120px', objectFit: 'contain', filter: 'brightness(1.1)' }}
          />
          <span className="sidebar-brand-name">ProcessifyERP</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          {(isAdmin || isSales || isAccounts || isWarehouse) && (
            <NavLink
              to="/customers"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Users size={18} />
              <span>Customer CRM</span>
            </NavLink>
          )}

          {(isAdmin || isWarehouse || isSales || isAccounts) && (
            <NavLink
              to="/products"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Package size={18} />
              <span>Products & Stock</span>
            </NavLink>
          )}

          {(isAdmin || isWarehouse || isSales || isAccounts) && (
            <NavLink
              to="/stock-movements"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <History size={18} />
              <span>Stock Movement Log</span>
            </NavLink>
          )}

          {(isAdmin || isSales || isAccounts || isWarehouse) && (
            <NavLink
              to="/challans"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <FileText size={18} />
              <span>Sales Challans</span>
            </NavLink>
          )}

          {(isAdmin || isSales || isAccounts || isWarehouse) && (
            <NavLink
              to="/reports"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <BarChart3 size={18} />
              <span>Reports & Audits</span>
            </NavLink>
          )}

          {isAdmin && (
            <NavLink
              to="/approvals"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <ShieldAlert size={18} />
              <span>Admin Approvals</span>
            </NavLink>
          )}

          {isAdmin && (
            <NavLink
              to="/users"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <UserCheck size={18} />
              <span>System Users</span>
            </NavLink>
          )}
        </nav>

        <div className="sidebar-user">
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className={`user-role-badge ${getRoleClass(user?.role)}`}>
              {user?.role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-outline btn-sm"
            style={{ color: '#94A3B8', borderColor: 'rgba(255,255,255,0.15)' }}
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="main-wrapper">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building2 size={20} style={{ color: 'var(--accent)' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              ProcessifyERP Operations Center
            </span>
          </div>

          <div className="topbar-actions">
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Logged in as <strong>{user?.name}</strong> ({user?.email})
            </span>
            <button onClick={handleLogout} className="btn btn-outline btn-sm">
              <LogOut size={14} />
              <span>Log Out</span>
            </button>
          </div>
        </header>

        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
