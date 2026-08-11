import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  Clock,
  User,
  DollarSign,
  AlertTriangle,
  FileText,
  Filter,
  Check,
  X,
  MessageSquare,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ApprovalsPage: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [rejectModalId, setRejectModalId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const { isAdmin } = useAuth();

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const res = await api.getApprovals(statusFilter);
      setRequests(res.data.requests || []);
      setPendingCount(res.data.pendingCount || 0);
    } catch (err) {
      console.error('Error fetching approval requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, [statusFilter]);

  const handleApprove = async (id: string) => {
    if (!window.confirm('Are you sure you want to APPROVE this request? Associated database transactions (stock reduction & invoice confirmation) will be executed immediately.')) {
      return;
    }

    setActionLoadingId(id);
    try {
      await api.approveRequest(id);
      alert('Request approved successfully!');
      fetchApprovals();
    } catch (err: any) {
      alert(err.message || 'Failed to approve request');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectModalId) return;

    setActionLoadingId(rejectModalId);
    try {
      await api.rejectRequest(rejectModalId, rejectionReason);
      alert('Request rejected.');
      setRejectModalId(null);
      setRejectionReason('');
      fetchApprovals();
    } catch (err: any) {
      alert(err.message || 'Failed to reject request');
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="status-chip chip-confirmed">APPROVED</span>;
      case 'REJECTED':
        return <span className="status-chip chip-cancelled">REJECTED</span>;
      default:
        return <span className="status-chip chip-draft" style={{ background: '#FEF3C7', color: '#92400E' }}>PENDING ADMIN APPROVAL</span>;
    }
  };

  return (
    <div>
      {/* Header Banner */}
      <div className="section-banner" style={{ borderLeftColor: '#A855F7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldAlert size={24} style={{ color: '#A855F7' }} />
            <span>Admin Approvals & Governance Center</span>
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Maker-Checker authorization queue for high-value sales orders, stock adjustments, and administrative requests.
          </p>
        </div>
        {pendingCount > 0 && (
          <div style={{ background: '#FEF3C7', color: '#92400E', padding: '6px 14px', borderRadius: '20px', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={16} />
            <span>{pendingCount} Request(s) Pending Action</span>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
        <button
          onClick={() => setStatusFilter('PENDING')}
          className={`btn ${statusFilter === 'PENDING' ? 'btn-primary' : 'btn-outline'}`}
          style={{ borderRadius: '20px', fontSize: '0.85rem' }}
        >
          <span>Pending Approvals</span>
          {pendingCount > 0 && (
            <span style={{ background: 'rgba(255,255,255,0.3)', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', marginLeft: '6px' }}>
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setStatusFilter('APPROVED')}
          className={`btn ${statusFilter === 'APPROVED' ? 'btn-primary' : 'btn-outline'}`}
          style={{ borderRadius: '20px', fontSize: '0.85rem' }}
        >
          <span>Approved History</span>
        </button>

        <button
          onClick={() => setStatusFilter('REJECTED')}
          className={`btn ${statusFilter === 'REJECTED' ? 'btn-primary' : 'btn-outline'}`}
          style={{ borderRadius: '20px', fontSize: '0.85rem' }}
        >
          <span>Rejected Requests</span>
        </button>

        <button
          onClick={() => setStatusFilter('ALL')}
          className={`btn ${statusFilter === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
          style={{ borderRadius: '20px', fontSize: '0.85rem' }}
        >
          <span>All Requests</span>
        </button>
      </div>

      {/* Requests List Table */}
      <div className="table-container">
        {loading ? (
          <div style={{ padding: '24px' }}>
            <div className="skeleton-row" />
            <div className="skeleton-row" />
            <div className="skeleton-row" />
          </div>
        ) : requests.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Request Type & Title</th>
                <th>Requested Amount</th>
                <th>Requested By</th>
                <th>Timestamp</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Admin Governance Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id}>
                  <td style={{ maxWidth: '320px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {req.requestType.replace(/_/g, ' ')}
                    </div>
                    <strong style={{ fontSize: '0.95rem', display: 'block', marginTop: '2px' }}>{req.title}</strong>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {req.description}
                    </div>
                    {req.rejectionReason && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--error)', background: '#FEE2E2', padding: '6px 10px', borderRadius: '4px', marginTop: '6px' }}>
                        Rejection Note: <em>"{req.rejectionReason}"</em>
                      </div>
                    )}
                  </td>
                  <td>
                    {req.amount ? (
                      <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>
                        ₹{req.amount.toLocaleString('en-IN')}
                      </strong>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)' }}>N/A</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User size={14} style={{ color: 'var(--text-secondary)' }} />
                      <div>
                        <strong>{req.user?.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{req.user?.role}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                    {new Date(req.createdAt).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td>{getStatusBadge(req.status)}</td>
                  <td style={{ textAlign: 'right' }}>
                    {req.status === 'PENDING' ? (
                      isAdmin ? (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => {
                              setRejectModalId(req.id);
                              setRejectionReason('');
                            }}
                            className="btn btn-outline btn-sm"
                            style={{ color: 'var(--error)', borderColor: 'var(--error)' }}
                            disabled={actionLoadingId === req.id}
                          >
                            <X size={14} />
                            <span>Reject</span>
                          </button>

                          <button
                            onClick={() => handleApprove(req.id)}
                            className="btn btn-primary btn-sm"
                            style={{ backgroundColor: 'var(--success)', borderColor: 'var(--success)' }}
                            disabled={actionLoadingId === req.id}
                          >
                            <Check size={14} />
                            <span>{actionLoadingId === req.id ? 'Approving...' : 'Approve'}</span>
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--warning)' }}>Awaiting Admin Sign-off</span>
                      )
                    ) : (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {req.status === 'APPROVED' ? `Approved by ${req.approver?.name || 'Admin'}` : `Rejected by ${req.approver?.name || 'Admin'}`}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            <CheckCircle size={40} style={{ color: 'var(--success)', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>No Approval Requests Found</h3>
            <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
              {statusFilter === 'PENDING' ? 'All governance queues are currently clear. No pending approvals.' : 'No requests match the selected status filter.'}
            </p>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModalId && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--error)', margin: 0, fontWeight: 700 }}>
                <XCircle size={20} />
                <span>Reject Governance Request</span>
              </h3>
              <button
                onClick={() => setRejectModalId(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
                Please provide an official reason for rejecting this transaction. The requesting staff member will be notified with this audit note.
              </p>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '6px', display: 'block', color: 'var(--text-main)' }}>
                  Rejection Reason / Audit Note:
                </label>
                <textarea
                  rows={4}
                  className="form-input"
                  style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit', fontSize: '0.88rem' }}
                  placeholder="e.g. Invalid discount pricing, insufficient credit authorization, or reorder required..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setRejectModalId(null)} className="btn btn-outline">
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                className="btn btn-primary"
                style={{ backgroundColor: 'var(--error)', borderColor: 'var(--error)', color: '#FFFFFF', padding: '8px 20px' }}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
