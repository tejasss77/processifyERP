import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Package,
  AlertTriangle,
  FileText,
  DollarSign,
  Plus,
  ArrowUpRight,
  Calendar,
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardMetrics } from '../types';
import { useAuth } from '../context/AuthContext';

export const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, isSales, isWarehouse, isAdmin } = useAuth();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await api.getDashboardMetrics();
        setMetrics(res.data);
      } catch (err) {
        console.error('Error loading dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'chip-confirmed';
      case 'CANCELLED': return 'chip-cancelled';
      default: return 'chip-draft';
    }
  };

  if (loading) {
    return (
      <div>
        <div className="section-banner">
          <h2>Operations Dashboard</h2>
        </div>
        <div className="skeleton-row" style={{ height: '120px' }} />
        <div className="skeleton-row" style={{ height: '300px', marginTop: '20px' }} />
      </div>
    );
  }

  return (
    <div>
      {/* Banner */}
      <div className="section-banner">
        <div>
          <h2 style={{ fontSize: '1.25rem' }}>Welcome back, {user?.name}</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            ProcessifyERP Wholesale Operations & CRM Status Overview
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {(isSales || isAdmin) && (
            <Link to="/challans" className="btn btn-accent btn-sm">
              <Plus size={16} />
              <span>Create Challan</span>
            </Link>
          )}
          {(isWarehouse || isAdmin) && (
            <Link to="/products" className="btn btn-primary btn-sm">
              <Package size={16} />
              <span>Manage Products</span>
            </Link>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-metrics">
        <div className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="metric-label">Total CRM Customers</span>
            <Users size={20} style={{ color: 'var(--accent)' }} />
          </div>
          <span className="metric-value">{metrics?.totalCustomers || 0}</span>
          <div className="metric-footer" style={{ color: 'var(--text-secondary)' }}>
            Active leads & business accounts
          </div>
        </div>

        <div className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="metric-label">Product Master SKU Count</span>
            <Package size={20} style={{ color: '#0284C7' }} />
          </div>
          <span className="metric-value">{metrics?.totalProducts || 0}</span>
          <div className="metric-footer" style={{ color: 'var(--text-secondary)' }}>
            Catalog inventory items
          </div>
        </div>

        <div className="metric-card" style={{ borderColor: metrics?.lowStockCount ? '#FCD34D' : 'var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="metric-label">Low Stock Alerts</span>
            <AlertTriangle size={20} style={{ color: metrics?.lowStockCount ? 'var(--warning)' : 'var(--text-secondary)' }} />
          </div>
          <span className="metric-value" style={{ color: metrics?.lowStockCount ? 'var(--warning)' : 'var(--primary)' }}>
            {metrics?.lowStockCount || 0}
          </span>
          <div className="metric-footer" style={{ color: metrics?.lowStockCount ? 'var(--warning)' : 'var(--text-secondary)' }}>
            {metrics?.lowStockCount ? 'Requires immediate reorder' : 'All stock above min threshold'}
          </div>
        </div>

        <div className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="metric-label">Today's Challans</span>
            <FileText size={20} style={{ color: 'var(--warning)' }} />
          </div>
          <span className="metric-value">{metrics?.todayChallansCount || 0}</span>
          <div className="metric-footer" style={{ color: 'var(--text-secondary)' }}>
            Issued sales documents
          </div>
        </div>

        <div className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="metric-label">Confirmed Sales Revenue</span>
            <DollarSign size={20} style={{ color: 'var(--success)' }} />
          </div>
          <span className="metric-value" style={{ color: 'var(--success)', fontSize: '1.5rem' }}>
            ₹{(metrics?.totalRevenue || 0).toLocaleString('en-IN')}
          </span>
          <div className="metric-footer" style={{ color: 'var(--success)' }}>
            Finalized sales challans
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Challans & Follow-ups */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Recent Sales Challans */}
        <div className="table-container">
          <div className="table-toolbar">
            <h3 style={{ fontSize: '1rem' }}>Recent Sales Challans</h3>
            <Link to="/challans" className="btn btn-outline btn-sm" style={{ fontSize: '0.8rem' }}>
              <span>View All</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Challan #</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Total Items</th>
                <th>Grand Total</th>
              </tr>
            </thead>
            <tbody>
              {metrics?.recentChallans && metrics.recentChallans.length > 0 ? (
                metrics.recentChallans.map((challan) => (
                  <tr key={challan.id}>
                    <td>
                      <Link
                        to={`/challans`}
                        style={{ fontWeight: 600, color: 'var(--accent)', textDecoration: 'none' }}
                      >
                        {challan.challanNumber}
                      </Link>
                    </td>
                    <td>
                      <div>
                        <strong>{challan.customer?.businessName}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {challan.customer?.name}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-chip ${getStatusChip(challan.status)}`}>
                        {challan.status}
                      </span>
                    </td>
                    <td>{challan.totalQuantity} pcs</td>
                    <td style={{ fontWeight: 600 }}>₹{challan.totalAmount.toLocaleString('en-IN')}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '24px' }}>
                    No sales challans recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Upcoming CRM Follow-ups Widget */}
        <div className="table-container">
          <div className="table-toolbar">
            <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} style={{ color: 'var(--accent)' }} />
              <span>Upcoming CRM Follow-ups</span>
            </h3>
          </div>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {metrics?.upcomingFollowUps && metrics.upcomingFollowUps.length > 0 ? (
              metrics.upcomingFollowUps.map((c) => (
                <div
                  key={c.id}
                  style={{
                    padding: '12px',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    backgroundColor: 'var(--bg-main)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <strong style={{ fontSize: '0.9rem' }}>{c.businessName}</strong>
                    <span className="status-chip chip-lead" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                      {c.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Contact: {c.name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 600, marginTop: '6px' }}>
                    Follow-up: {new Date(c.followUpDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '16px' }}>
                No scheduled follow-up dates pending.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
