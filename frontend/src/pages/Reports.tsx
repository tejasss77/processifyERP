import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Boxes,
  Users,
  ShieldCheck,
  Download,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  PieChart,
  FileSpreadsheet,
  Layers,
  Clock,
  User,
} from 'lucide-react';
import { api } from '../services/api';

export const Reports: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sales' | 'inventory' | 'customers' | 'audit'>('sales');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.getReportAnalytics();
      setData(res.data);
    } catch (err) {
      console.error('Error fetching reports analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExportCSV = () => {
    if (!data) return;

    const rows = [
      ['ProcessifyERP Operations Report'],
      ['Generated Date', new Date().toLocaleString()],
      [''],
      ['EXECUTIVE SUMMARY METRICS'],
      ['Total Gross Revenue', `INR ${data.executive.totalGrossRevenue}`],
      ['Inventory Asset Valuation', `INR ${data.executive.inventoryValuation}`],
      ['Total Products', data.executive.totalProducts],
      ['Total Customers', data.executive.totalCustomers],
      ['Low Stock Alert Items', data.executive.lowStockCount],
      ['Total Stock Movements', data.executive.totalStockMovements],
      ['Confirmed Sales Challans', data.executive.confirmedChallansCount],
      [''],
      ['CATEGORY INVENTORY BREAKDOWN'],
      ['Category', 'Product Count', 'Total Stock', 'Asset Valuation (INR)', 'Low Stock Alerts'],
      ...data.categoryBreakdown.map((cat: any) => [
        cat.category,
        cat.count,
        cat.totalStock,
        cat.totalValue,
        cat.lowStockCount,
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ProcessifyERP_Audit_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  if (loading) {
    return (
      <div style={{ padding: '24px' }}>
        <div className="skeleton-row" style={{ height: '40px', marginBottom: '16px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div className="skeleton-row" style={{ height: '100px' }} />
          <div className="skeleton-row" style={{ height: '100px' }} />
          <div className="skeleton-row" style={{ height: '100px' }} />
          <div className="skeleton-row" style={{ height: '100px' }} />
        </div>
      </div>
    );
  }

  const { executive, categoryBreakdown, customerSegmentation, challanBreakdown, stockVelocity, lowStockRiskList, recentAuditLogs } = data || {};

  return (
    <div>
      {/* Page Header */}
      <div className="section-banner" style={{ borderLeftColor: 'var(--accent)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart3 size={24} style={{ color: 'var(--accent)' }} />
            <span>Reports & Audits Center</span>
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Centralized business analytics, inventory asset valuation, customer CRM metrics, and operational audit trail.
          </p>
        </div>
        <button onClick={handleExportCSV} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Download size={16} />
          <span>Export Summary (CSV)</span>
        </button>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid-metrics" style={{ marginBottom: '24px' }}>
        <div className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="metric-label">Gross Sales Revenue</span>
            <TrendingUp size={20} style={{ color: 'var(--success)' }} />
          </div>
          <span className="metric-value">{formatCurrency(executive?.totalGrossRevenue || 0)}</span>
          <div className="metric-footer" style={{ color: 'var(--text-secondary)' }}>
            Total confirmed sales delivery challans
          </div>
        </div>

        <div className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="metric-label">Warehouse Asset Valuation</span>
            <Boxes size={20} style={{ color: '#0284C7' }} />
          </div>
          <span className="metric-value">{formatCurrency(executive?.inventoryValuation || 0)}</span>
          <div className="metric-footer" style={{ color: 'var(--text-secondary)' }}>
            Total physical inventory asset value
          </div>
        </div>

        <div className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="metric-label">Stock Movement Velocity</span>
            <Layers size={20} style={{ color: '#A855F7' }} />
          </div>
          <span className="metric-value">{executive?.totalStockMovements || 0} Logs</span>
          <div className="metric-footer" style={{ color: 'var(--text-secondary)' }}>
            Immutable Stock IN & OUT audit logs
          </div>
        </div>

        <div className="metric-card" style={{ borderColor: executive?.lowStockCount > 0 ? '#FCA5A5' : 'var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="metric-label">Low Stock Risk Alerts</span>
            <AlertTriangle size={20} style={{ color: executive?.lowStockCount > 0 ? 'var(--error)' : 'var(--text-secondary)' }} />
          </div>
          <span className="metric-value" style={{ color: executive?.lowStockCount > 0 ? 'var(--error)' : 'var(--text-main)' }}>
            {executive?.lowStockCount || 0} Items
          </span>
          <div className="metric-footer" style={{ color: executive?.lowStockCount > 0 ? 'var(--error)' : 'var(--text-secondary)' }}>
            Products at or below min threshold limit
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('sales')}
          className={`btn ${activeTab === 'sales' ? 'btn-primary' : 'btn-outline'}`}
          style={{ borderRadius: '8px 8px 0 0', borderBottom: 'none' }}
        >
          <TrendingUp size={16} />
          <span>Sales & Revenue</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`btn ${activeTab === 'inventory' ? 'btn-primary' : 'btn-outline'}`}
          style={{ borderRadius: '8px 8px 0 0', borderBottom: 'none' }}
        >
          <Boxes size={16} />
          <span>Inventory Valuation</span>
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`btn ${activeTab === 'customers' ? 'btn-primary' : 'btn-outline'}`}
          style={{ borderRadius: '8px 8px 0 0', borderBottom: 'none' }}
        >
          <Users size={16} />
          <span>Customer CRM Metrics</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`btn ${activeTab === 'audit' ? 'btn-primary' : 'btn-outline'}`}
          style={{ borderRadius: '8px 8px 0 0', borderBottom: 'none' }}
        >
          <ShieldCheck size={16} />
          <span>Audit Log Trail</span>
        </button>
      </div>

      {/* Tab 1: Sales & Revenue */}
      {activeTab === 'sales' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileSpreadsheet size={18} style={{ color: 'var(--accent)' }} />
              <span>Sales Challan Pipeline Status</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--surface-hover)', borderRadius: '8px' }}>
                <div>
                  <span className="status-chip chip-confirmed">CONFIRMED</span>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {challanBreakdown?.CONFIRMED?.count || 0} Delivery Challans
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>
                  {formatCurrency(challanBreakdown?.CONFIRMED?.totalValue || 0)}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--surface-hover)', borderRadius: '8px' }}>
                <div>
                  <span className="status-chip chip-draft">DRAFT</span>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {challanBreakdown?.DRAFT?.count || 0} Pending Orders
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontWeight: 700, color: '#0284C7' }}>
                  {formatCurrency(challanBreakdown?.DRAFT?.totalValue || 0)}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--surface-hover)', borderRadius: '8px' }}>
                <div>
                  <span className="status-chip chip-cancelled">CANCELLED</span>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {challanBreakdown?.CANCELLED?.count || 0} Voided Orders
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontWeight: 700, color: 'var(--error)' }}>
                  {formatCurrency(challanBreakdown?.CANCELLED?.totalValue || 0)}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.05rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} style={{ color: 'var(--accent)' }} />
              <span>Commercial Summary</span>
            </h3>

            <div style={{ padding: '16px', background: 'var(--surface-hover)', borderRadius: '8px', marginBottom: '12px' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Confirmed Sales</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
                {formatCurrency(executive?.totalGrossRevenue || 0)}
              </div>
            </div>

            <div style={{ padding: '16px', background: 'var(--surface-hover)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Average Confirmed Order Value</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent)', marginTop: '4px' }}>
                {executive?.confirmedChallansCount > 0
                  ? formatCurrency(executive.totalGrossRevenue / executive.confirmedChallansCount)
                  : formatCurrency(0)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Inventory Valuation */}
      {activeTab === 'inventory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="table-container">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Boxes size={18} style={{ color: 'var(--accent)' }} />
              <span>Inventory Asset Breakdown by Category</span>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Product Count</th>
                  <th>Total Units in Stock</th>
                  <th>Total Asset Valuation</th>
                  <th>Low Stock Risk</th>
                </tr>
              </thead>
              <tbody>
                {categoryBreakdown?.map((cat: any) => (
                  <tr key={cat.category}>
                    <td><strong>{cat.category}</strong></td>
                    <td>{cat.count} Products</td>
                    <td>{cat.totalStock} pcs</td>
                    <td><strong style={{ color: 'var(--accent)' }}>{formatCurrency(cat.totalValue)}</strong></td>
                    <td>
                      {cat.lowStockCount > 0 ? (
                        <span className="status-chip chip-cancelled">{cat.lowStockCount} Alert(s)</span>
                      ) : (
                        <span className="status-chip chip-confirmed">Normal</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Low Stock Audit Table */}
          <div className="table-container">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--error)' }}>
              <AlertTriangle size={18} />
              <span>Low Stock Reorder Risk Audit Table</span>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Product SKU & Name</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                  <th>Min Threshold</th>
                  <th>Warehouse Rack</th>
                  <th>Unit Selling Price</th>
                </tr>
              </thead>
              <tbody>
                {lowStockRiskList?.length > 0 ? (
                  lowStockRiskList.map((p: any) => (
                    <tr key={p.id}>
                      <td>
                        <strong>{p.name}</strong>
                        <div style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{p.sku}</div>
                      </td>
                      <td>{p.category}</td>
                      <td><strong style={{ color: 'var(--error)' }}>{p.currentStock} pcs</strong></td>
                      <td>{p.minStock} pcs</td>
                      <td>{p.warehouseLocation}</td>
                      <td>{formatCurrency(p.unitPrice)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
                      All stock levels are above threshold limits. No reorder risks detected.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Customer CRM */}
      {activeTab === 'customers' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} style={{ color: 'var(--accent)' }} />
              <span>Customer Classification Breakdown</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(customerSegmentation?.byType || {}).map(([type, count]: [string, any]) => (
                <div key={type} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--surface-hover)', borderRadius: '8px' }}>
                  <span style={{ fontWeight: 600 }}>{type} Customers</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{count} Accounts</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.05rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PieChart size={18} style={{ color: 'var(--accent)' }} />
              <span>Customer Status Distribution</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(customerSegmentation?.byStatus || {}).map(([status, count]: [string, any]) => (
                <div key={status} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--surface-hover)', borderRadius: '8px' }}>
                  <span style={{ fontWeight: 600 }}>{status}</span>
                  <span style={{ fontWeight: 700, color: status === 'ACTIVE' || status === 'CONVERTED' ? 'var(--success)' : 'var(--text-secondary)' }}>
                    {count} Accounts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Audit Log Trail */}
      {activeTab === 'audit' && (
        <div className="table-container">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} style={{ color: 'var(--accent)' }} />
            <span>Immutable Operational Audit Trail</span>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Product Name & SKU</th>
                <th>Movement Type</th>
                <th>Quantity</th>
                <th>Reason / Transaction</th>
                <th>Executed By</th>
              </tr>
            </thead>
            <tbody>
              {recentAuditLogs?.map((m: any) => {
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
                      <strong>{m.product?.name}</strong>
                      <div style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>SKU: {m.product?.sku}</div>
                    </td>
                    <td>
                      <span className={`status-chip ${isIN ? 'chip-confirmed' : 'chip-cancelled'}`}>
                        {isIN ? '+' : '-'}{m.movementType}
                      </span>
                    </td>
                    <td><strong>{isIN ? `+${m.quantity}` : `-${m.quantity}`} pcs</strong></td>
                    <td style={{ fontSize: '0.85rem' }}>{m.reason}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
                        <User size={14} style={{ color: 'var(--text-secondary)' }} />
                        <span>{m.user?.name || 'System'}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
