import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Search,
  Plus,
  Eye,
  Trash2,
  X,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { Challan, Customer, Product } from '../types';
import { useAuth } from '../context/AuthContext';

export const Challans: React.FC = () => {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State for Create Draft Challan
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [items, setItems] = useState<Array<{ productId: string; quantity: number }>>([
    { productId: '', quantity: 1 },
  ]);

  const { isSales, isAdmin } = useAuth();

  const fetchChallans = async () => {
    setLoading(true);
    try {
      const res = await api.getChallans({
        search,
        status: statusFilter || undefined,
      });
      setChallans(res.data);
    } catch (err) {
      console.error('Error fetching challans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, [search, statusFilter]);

  const handleOpenCreateModal = async () => {
    try {
      const [custRes, prodRes] = await Promise.all([
        api.getCustomers({ limit: 100 }),
        api.getProducts({ limit: 100 }),
      ]);
      setCustomers(custRes.data);
      setProducts(prodRes.data);

      if (custRes.data.length > 0) setSelectedCustomerId(custRes.data[0].id);
      if (prodRes.data.length > 0) {
        setItems([{ productId: prodRes.data[0].id, quantity: 1 }]);
      }
      setShowCreateModal(true);
    } catch (err) {
      alert('Failed to load customer or product catalogs for challan creation');
    }
  };

  const handleAddItemRow = () => {
    if (products.length > 0) {
      setItems([...items, { productId: products[0].id, quantity: 1 }]);
    }
  };

  const handleRemoveItemRow = (index: number) => {
    if (items.length <= 1) return;
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  const handleItemChange = (index: number, field: 'productId' | 'quantity', value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const calculateGrandTotal = () => {
    return items.reduce((sum, item) => {
      const p = products.find((prod) => prod.id === item.productId);
      return sum + (p ? p.unitPrice * (item.quantity || 1) : 0);
    }, 0);
  };

  const handleCreateDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      alert('Please select a customer');
      return;
    }

    try {
      await api.createDraftChallan({
        customerId: selectedCustomerId,
        items,
      });
      setShowCreateModal(false);
      fetchChallans();
    } catch (err: any) {
      alert(err.message || 'Failed to create draft challan');
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'chip-confirmed';
      case 'CANCELLED': return 'chip-cancelled';
      default: return 'chip-draft';
    }
  };

  return (
    <div>
      {/* Banner */}
      <div className="section-banner" style={{ borderLeftColor: 'var(--warning)' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={22} style={{ color: 'var(--warning)' }} />
            <span>Sales Challan Workflow</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Draft orders, snapshot line items, and transaction-based inventory deduction
          </p>
        </div>
        {(isSales || isAdmin) && (
          <button onClick={handleOpenCreateModal} className="btn btn-accent">
            <Plus size={18} />
            <span>Create Draft Challan</span>
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
              placeholder="Search challan #, customer business name, or salesperson..."
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
              <option value="">All Challan Statuses</option>
              <option value="DRAFT">Draft (No Stock Reduction)</option>
              <option value="CONFIRMED">Confirmed (Stock Reduced)</option>
              <option value="CANCELLED">Cancelled</option>
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
                <th>Challan #</th>
                <th>Tax Invoice #</th>
                <th>Customer Name</th>
                <th>Status</th>
                <th>Total Line Items</th>
                <th>Grand Total</th>
                <th>Issued Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {challans.length > 0 ? (
                challans.map((c) => {
                  const isConfirmed = c.status === 'CONFIRMED';
                  const invNum = `INV-2026-${c.challanNumber.replace('CH-2026-', '')}`;

                  return (
                    <tr key={c.id}>
                      <td>
                        <Link
                          to={`/challans/${c.id}`}
                          style={{ fontWeight: 700, color: 'var(--accent)', textDecoration: 'none' }}
                        >
                          {c.challanNumber}
                        </Link>
                      </td>
                      <td>
                        {isConfirmed ? (
                          <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#6EE7B7', padding: '3px 8px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 700, fontFamily: 'monospace' }}>
                            #{invNum}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Draft (Uninvoiced)</span>
                        )}
                      </td>
                      <td>
                        <div>
                          <strong>{c.customer?.businessName}</strong>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            {c.customer?.name}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`status-chip ${getStatusChip(c.status)}`}>
                          {c.status}
                        </span>
                      </td>
                      <td>{c.totalQuantity} pcs ({c.items?.length || 0} SKUs)</td>
                      <td style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                        ₹{c.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td style={{ fontSize: '0.82rem' }}>
                        {new Date(c.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <Link to={`/challans/${c.id}`} className="btn btn-outline btn-sm">
                            <Eye size={14} />
                            <span>View Challan</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '28px' }}>
                    No sales challans found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Draft Challan Modal */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '720px' }}>
            <div className="modal-header">
              <h3>Create New Draft Sales Challan</h3>
              <button onClick={() => setShowCreateModal(false)} className="btn btn-outline btn-sm" style={{ border: 'none' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateDraft}>
              <div className="modal-body">
                <div style={{ backgroundColor: 'var(--warning-light)', border: '1px solid #FCD34D', padding: '10px 14px', borderRadius: '6px', marginBottom: '20px', fontSize: '0.82rem', color: 'var(--warning)' }}>
                  <AlertCircle size={16} style={{ display: 'inline', marginRight: '6px' }} />
                  Saving as <strong>DRAFT</strong> preserves unit price snapshots without altering warehouse inventory. Stock will only be validated and reduced when confirmed.
                </div>

                <div className="form-group">
                  <label className="form-label">Select Customer Account *</label>
                  <select
                    className="form-control"
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    required
                  >
                    {customers.map((cust) => (
                      <option key={cust.id} value={cust.id}>
                        {cust.businessName} — {cust.name} ({cust.customerType})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginTop: '20px' }}>
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Challan Line Items (Products & Quantities)</span>
                    <button type="button" onClick={handleAddItemRow} className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem' }}>
                      <Plus size={14} />
                      <span>Add Product Line</span>
                    </button>
                  </label>

                  {items.map((item, index) => {
                    const selectedProd = products.find((p) => p.id === item.productId);
                    const lineTotal = selectedProd ? selectedProd.unitPrice * (item.quantity || 1) : 0;

                    return (
                      <div
                        key={index}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '3fr 1fr 1.5fr 40px',
                          gap: '12px',
                          alignItems: 'center',
                          marginBottom: '12px',
                          padding: '10px',
                          backgroundColor: 'var(--bg-main)',
                          borderRadius: '6px',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <div>
                          <select
                            className="form-control"
                            value={item.productId}
                            onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                            required
                          >
                            {products.map((prod) => (
                              <option key={prod.id} value={prod.id}>
                                {prod.name} (SKU: {prod.sku}) — Stock: {prod.currentStock} pcs @ ₹{prod.unitPrice}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <input
                            type="number"
                            className="form-control"
                            min="1"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                            required
                          />
                        </div>

                        <div style={{ fontSize: '0.85rem', fontWeight: 600, textAlign: 'right' }}>
                          Line Total: ₹{lineTotal.toLocaleString('en-IN')}
                        </div>

                        <div>
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(index)}
                            disabled={items.length <= 1}
                            className="btn btn-outline btn-sm"
                            style={{ border: 'none', color: 'var(--error)', justifyContent: 'center' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div
                  style={{
                    marginTop: '20px',
                    padding: '16px',
                    backgroundColor: 'var(--primary)',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Calculated Challan Grand Total:</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--accent-light)' }}>
                    ₹{calculateGrandTotal().toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-accent">
                  Save as Draft Challan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
