import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Boxes,
  Package,
  FileText,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import logoTransparent from '../../assets/brand-logo.png';
import './LandingPage.css';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-page">
      {/* Top Navbar */}
      <header className="landing-header">
        <div className="landing-container">
          <nav className="landing-nav">
            <Link to="/" className="landing-brand">
              <img src={logoTransparent} alt="ProcessifyERP Logo" className="landing-brand-logo" />
              <span className="landing-brand-title">ProcessifyERP</span>
            </Link>

            <ul className="landing-nav-links">
              <li>
                <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }} className="landing-nav-link">
                  Features
                </a>
              </li>
              <li>
                <a href="#workflow" onClick={(e) => { e.preventDefault(); scrollToSection('workflow'); }} className="landing-nav-link">
                  Workflow
                </a>
              </li>
            </ul>

            <Link to="/login" className="landing-btn-login">
              <span>Sign In to Portal</span>
              <ArrowRight size={16} />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-container">
          <div className="hero-grid">
            {/* Left Column */}
            <div>
              <div className="hero-badge">
                <ShieldCheck size={15} />
                <span>Mini ERP + CRM Operations Portal</span>
              </div>
              <h1 className="hero-title">
                Run Your Business. <br />
                <span className="hero-title-accent">One Powerful Platform.</span>
              </h1>
              <p className="hero-subtitle">
                Manage customers, inventory, products and sales operations from one centralized B2B platform built for modern wholesale and distribution operations.
              </p>
              <div className="hero-ctas">
                <Link to="/login" className="hero-primary-btn">
                  <span>Sign In to Portal</span>
                  <ArrowRight size={18} />
                </Link>
                <button
                  onClick={() => scrollToSection('features')}
                  className="hero-secondary-btn"
                >
                  <span>Explore Features</span>
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Right Column: Clean ERP Dashboard Mockup */}
            <div>
              <div className="hero-visual-card">
                <div className="mockup-header">
                  <div className="mockup-dot" style={{ backgroundColor: '#FF5F56' }} />
                  <div className="mockup-dot" style={{ backgroundColor: '#FFBD2E' }} />
                  <div className="mockup-dot" style={{ backgroundColor: '#27C93F' }} />
                  <span style={{ marginLeft: '10px', fontSize: '0.75rem', color: '#64748B', fontFamily: 'monospace' }}>
                    ProcessifyERP Operations Dashboard
                  </span>
                </div>

                <div className="mockup-body">
                  <div className="mockup-kpi-grid">
                    <div className="mockup-kpi">
                      <div className="mockup-kpi-val">120</div>
                      <div className="mockup-kpi-lbl">Total Products</div>
                    </div>
                    <div className="mockup-kpi" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                      <div className="mockup-kpi-val" style={{ color: '#FCA5A5' }}>08</div>
                      <div className="mockup-kpi-lbl">Low Stock Alerts</div>
                    </div>
                    <div className="mockup-kpi">
                      <div className="mockup-kpi-val" style={{ color: '#2DD4BF' }}>24</div>
                      <div className="mockup-kpi-lbl">Stock Movements</div>
                    </div>
                  </div>

                  <div className="mockup-table-preview">
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94A3B8', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>RECENT TRANSACTIONS AUDIT</span>
                      <span style={{ fontSize: '0.7rem', color: '#2DD4BF', background: 'rgba(45, 212, 191, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>LIVE</span>
                    </div>

                    <div className="mockup-row">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#6EE7B7', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                          #CH-2026-0002
                        </span>
                        <span>ABC Traders</span>
                      </div>
                      <span style={{ color: '#6EE7B7', fontWeight: 600 }}>Confirmed (₹1,62,500)</span>
                    </div>

                    <div className="mockup-row">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ArrowUpRight size={14} style={{ color: '#2DD4BF' }} />
                        <span>Dell UltraSharp 27" Monitor</span>
                      </div>
                      <span style={{ color: '#2DD4BF', fontWeight: 600 }}>+30 Stock IN</span>
                    </div>

                    <div className="mockup-row">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ArrowDownRight size={14} style={{ color: '#FCA5A5' }} />
                        <span>Logitech MX Master 3S</span>
                      </div>
                      <span style={{ color: '#FCA5A5', fontWeight: 600 }}>-5 Stock OUT</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="landing-section">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-tag">CORE CAPABILITIES</span>
            <h2 className="section-title">Everything Your Operations Need</h2>
            <p className="section-desc">
              Essential B2B operational tools built for wholesale, distribution, and commercial trading teams.
            </p>
          </div>

          <div className="features-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <div className="feature-card">
              <div className="feature-icon-box">
                <Users size={24} />
              </div>
              <h3 className="feature-title">Customer CRM</h3>
              <p className="feature-desc">
                Organize B2B customer profiles, contact info, GST details, lead statuses, and scheduled follow-up interaction notes.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <Boxes size={24} />
              </div>
              <h3 className="feature-title">Inventory & Stock Audit</h3>
              <p className="feature-desc">
                Track real-time product stock levels, warehouse rack locations, and immutable Stock IN/OUT audit movement logs.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <Package size={24} />
              </div>
              <h3 className="feature-title">Product Catalog</h3>
              <p className="feature-desc">
                Maintain product SKUs, categories, wholesale selling prices, warehouse locations, and minimum threshold alerts.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <FileText size={24} />
              </div>
              <h3 className="feature-title">Sales Delivery Challans</h3>
              <p className="feature-desc">
                Create, manage, and confirm sales challans with automatic inventory deduction and stock availability validation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Business Workflow */}
      <section id="workflow" className="landing-section">
        <div className="landing-container">
          <div className="section-header">
            <span className="section-tag">OPERATIONAL FLOW</span>
            <h2 className="section-title">From Order Request to Inventory Update</h2>
          </div>

          <div className="workflow-flow">
            <div className="workflow-step">
              <div className="step-num">1</div>
              <h4 className="step-title">Customer Inquiry</h4>
              <p className="step-desc">Order request logged in CRM</p>
            </div>

            <ChevronRight className="workflow-arrow" size={20} />

            <div className="workflow-step">
              <div className="step-num">2</div>
              <h4 className="step-title">Sales Challan</h4>
              <p className="step-desc">Sales delivery challan drafted</p>
            </div>

            <ChevronRight className="workflow-arrow" size={20} />

            <div className="workflow-step">
              <div className="step-num">3</div>
              <h4 className="step-title">Stock Validation</h4>
              <p className="step-desc">Warehouse stock threshold verified</p>
            </div>

            <ChevronRight className="workflow-arrow" size={20} />

            <div className="workflow-step">
              <div className="step-num">4</div>
              <h4 className="step-title">Inventory Deduction</h4>
              <p className="step-desc">Challan confirmed & stock OUT logged</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Action Banner */}
      <section className="landing-section">
        <div className="landing-container">
          <div className="final-cta-box">
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '14px' }}>
              Ready to simplify your business operations?
            </h2>
            <p style={{ fontSize: '1.05rem', color: '#CBD5E1', maxWidth: '520px', margin: '0 auto 28px' }}>
              Centralize your customers, products, stock movements, and sales challans in one place.
            </p>
            <Link to="/login" className="hero-primary-btn">
              <span>Sign In to Portal</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="footer-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src={logoTransparent} alt="ProcessifyERP Logo" style={{ height: '30px' }} />
              <span style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF' }}>
                ProcessifyERP Operations Portal
              </span>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
              © {new Date().getFullYear()} ProcessifyERP. All rights reserved.
            </div>

            <div>
              <Link to="/login" style={{ color: '#38BDF8', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
                Login to Application →
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
