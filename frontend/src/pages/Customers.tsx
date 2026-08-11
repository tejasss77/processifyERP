import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  Calendar,
  Eye,
  Edit2,
  X,
} from 'lucide-react';
import { api } from '../services/api';
import { Customer, CustomerStatus, CustomerType } from '../types';
import { useAuth } from '../context/AuthContext';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    businessName: '',
    gstNumber: '',
    customerType: 'WHOLESALE' as CustomerType,
    address: '',
    status: 'ACTIVE' as CustomerStatus,
    followUpDate: '',
  });

  const { isSales, isAdmin } = useAuth();

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.getCustomers({
        search,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
      });
      setCustomers(res.data);
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search, statusFilter, typeFilter]);

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        mobile: customer.mobile,
        email: customer.email || '',
        businessName: customer.businessName,
        gstNumber: customer.gstNumber || '',
        customerType: customer.customerType,
        address: customer.address || '',
        status: customer.status,
        followUpDate: customer.followUpDate ? new Date(customer.followUpDate).toISOString().split('T')[0] : '',
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        name: '',
        mobile: '',
        email: '',
        businessName: '',
        gstNumber: '',
        customerType: 'WHOLESALE',
        address: '',
        status: 'LEAD',
        followUpDate: '',
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await api.updateCustomer(editingCustomer.id, formData);
      } else {
        await api.createCustomer(formData);
      }
      setShowModal(false);
      fetchCustomers();
    } catch (err: any) {
      alert(err.message || 'Failed to save customer');
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'chip-active';
      case 'CONVERTED': return 'chip-confirmed';
      case 'INACTIVE': return 'chip-inactive';
      default: return 'chip-lead';
    }
  };

  return (
    <div>
      {/* Banner */}
      <div className="section-banner" style={{ borderLeftColor: 'var(--accent)' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={22} style={{ color: 'var(--accent)' }} />
            <span>Customer CRM & Relationships</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Manage B2B customer accounts, follow-up dates, and sales interaction history
          </p>
        </div>
        {(isSales || isAdmin) && (
          <button onClick={() => handleOpenModal()} className="btn btn-accent">
            <Plus size={18} />
            <span>Add New Customer</span>
          </button>
        )}
      </div>

      {/* Table Container */}
      <div className="table-container">
        <div className="table-toolbar">
          <div className="search-input-wrapper">
            <Search />
            <input
              type="text"
              className="search-input"
              placeholder="Search by customer name, business, mobile, or GST..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <select
              className="pill-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="LEAD">Lead</option>
              <option value="ACTIVE">Active</option>
              <option value="CONVERTED">Converted</option>
              <option value="INACTIVE">Inactive</option>
            </select>

            <select
              className="pill-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="WHOLESALE">Wholesale</option>
              <option value="RETAIL">Retail</option>
              <option value="DISTRIBUTOR">Distributor</option>
              <option value="LEAD">Lead</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '20px' }}>
            <div className="skeleton-row" />
            <div className="skeleton-row" />
            <div className="skeleton-row" />
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Customer & Business</th>
                <th>Contact</th>
                <th>Type</th>
                <th>Status</th>
                <th>Next Follow-up</th>
                <th>GST Number</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.length > 0 ? (
                customers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div>
                        <strong>{c.businessName}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {c.name}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.82rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={12} style={{ color: 'var(--text-secondary)' }} />
                          <span>{c.mobile}</span>
                        </div>
                        {c.email && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                            <Mail size={12} />
                            <span>{c.email}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="user-role-badge role-admin" style={{ fontSize: '0.7rem' }}>
                        {c.customerType}
                      </span>
                    </td>
                    <td>
                      <span className={`status-chip ${getStatusChip(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      {c.followUpDate ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent)' }}>
                          <Calendar size={13} />
                          <span>{new Date(c.followUpDate).toLocaleDateString('en-IN')}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>None</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>
                      {c.gstNumber || 'N/A'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <Link
                          to={`/customers/${c.id}`}
                          className="btn btn-outline btn-sm"
                          title="View Profile & Follow-up Notes"
                        >
                          <Eye size={14} />
                          <span>Notes</span>
                        </Link>

                        {(isSales || isAdmin) && (
                          <button
                            onClick={() => handleOpenModal(c)}
                            className="btn btn-outline btn-sm"
                            title="Edit Customer"
                          >
                            <Edit2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '28px' }}>
                    No customers match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Customer Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingCustomer ? 'Edit Customer Profile' : 'Add New Customer'}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-outline btn-sm"
                style={{ border: 'none' }}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Contact Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Business Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Mobile Number *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Customer Type</label>
                    <select
                      className="form-control"
                      value={formData.customerType}
                      onChange={(e) => setFormData({ ...formData, customerType: e.target.value as CustomerType })}
                    >
                      <option value="WHOLESALE">Wholesale</option>
                      <option value="RETAIL">Retail</option>
                      <option value="DISTRIBUTOR">Distributor</option>
                      <option value="LEAD">Lead</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Pipeline Status</label>
                    <select
                      className="form-control"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as CustomerStatus })}
                    >
                      <option value="LEAD">Lead</option>
                      <option value="ACTIVE">Active</option>
                      <option value="CONVERTED">Converted</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">GST Number</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 24AAAAA0000A1Z5"
                      value={formData.gstNumber}
                      onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Next Follow-up Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.followUpDate}
                      onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Billing/Shipping Address</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-accent">
                  {editingCustomer ? 'Save Changes' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
