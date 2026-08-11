import React, { useState, useEffect } from 'react';
import { History, Search, ArrowUpRight, ArrowDownRight, User } from 'lucide-react';
import { api } from '../services/api';
import { StockMovement } from '../types';

export const StockMovements: React.FC = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const res = await api.getStockMovements({
        search,
        type: typeFilter || undefined,
      });
      setMovements(res.data);
    } catch (err) {
      console.error('Error fetching stock movements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [search, typeFilter]);

  return (
    <div>
      {/* Banner */}
      <div className="section-banner" style={{ borderLeftColor: '#0284C7' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={22} style={{ color: '#0284C7' }} />
            <span>Stock Movement Audit Log</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Immutable record of all stock increases (IN), sales reductions (OUT), and warehouse adjustments
          </p>
        </div>
      </div>

      {/* Table Container */}
      <div className="table-container">
        <div className="table-toolbar">
          <div className="search-input-wrapper">
            <Search />
            <input
              type="text"
              className="search-input"
              placeholder="Search product name, SKU, reason, or user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <select
              className="pill-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Movement Types</option>
              <option value="IN">Stock IN (+)</option>
              <option value="OUT">Stock OUT (-)</option>
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
                <th>Timestamp</th>
                <th>Product SKU & Name</th>
                <th>Movement Type</th>
                <th>Quantity</th>
                <th>Reason / Transaction</th>
                <th>Recorded By</th>
              </tr>
            </thead>
            <tbody>
              {movements.length > 0 ? (
                movements.map((m) => {
                  const isIN = m.movementType === 'IN';
                  return (
                    <tr key={m.id}>
                      <td style={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                        {new Date(m.createdAt).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td>
                        <div>
                          <strong>{m.product?.name}</strong>
                          <div style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                            SKU: {m.product?.sku}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`status-chip ${isIN ? 'chip-confirmed' : 'chip-cancelled'}`}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          {isIN ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                          <span>{m.movementType}</span>
                        </span>
                      </td>
                      <td>
                        <strong style={{ fontSize: '0.95rem', color: isIN ? 'var(--success)' : 'var(--error)' }}>
                          {isIN ? `+${m.quantity}` : `-${m.quantity}`} pcs
                        </strong>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{m.reason}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
                          <User size={14} style={{ color: 'var(--text-secondary)' }} />
                          <span>{m.user?.name || 'System'}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '28px' }}>
                    No stock movements recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
