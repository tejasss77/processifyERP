import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Building2,
  Phone,
  Mail,
  Calendar,
  Plus,
  Clock,
  MessageSquare,
  FileText,
} from 'lucide-react';
import { api } from '../services/api';
import { Customer } from '../types';
import { useAuth } from '../context/AuthContext';

export const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');

  const { isSales, isAdmin } = useAuth();

  const fetchCustomer = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.getCustomerById(id);
      setCustomer(res.data);
      if (res.data.followUpDate) {
        setFollowUpDate(new Date(res.data.followUpDate).toISOString().split('T')[0]);
      }
    } catch (err) {
      console.error('Error fetching customer detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !noteText.trim()) return;

    setIsSubmittingNote(true);
    try {
      await api.addCustomerNote(id, noteText);
      setNoteText('');
      fetchCustomer();
    } catch (err: any) {
      alert(err.message || 'Failed to add note');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleUpdateFollowUpDate = async () => {
    if (!id) return;
    try {
      await api.updateCustomer(id, { followUpDate: followUpDate || null });
      alert('Follow-up date updated successfully');
      fetchCustomer();
    } catch (err: any) {
      alert(err.message || 'Failed to update follow-up date');
    }
  };

  if (loading || !customer) {
    return (
      <div>
        <div className="skeleton-row" style={{ height: '60px' }} />
        <div className="skeleton-row" style={{ height: '240px', marginTop: '20px' }} />
      </div>
    );
  }

  return (
    <div>
      {/* Back Header */}
      <div style={{ marginBottom: '20px' }}>
        <Link to="/customers" className="btn btn-outline btn-sm">
          <ArrowLeft size={16} />
          <span>Back to Customers CRM</span>
        </Link>
      </div>

      {/* Main Grid: Profile Left, Timeline Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        {/* Profile Card */}
        <div className="table-container" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '8px',
                backgroundColor: 'var(--accent-light)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: 700,
              }}
            >
              {customer.businessName.charAt(0)}
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem' }}>{customer.businessName}</h2>
              <span className="user-role-badge role-admin" style={{ fontSize: '0.7rem' }}>
                {customer.customerType}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <User size={16} style={{ color: 'var(--text-secondary)' }} />
              <span>Contact Person: <strong>{customer.name}</strong></span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Phone size={16} style={{ color: 'var(--text-secondary)' }} />
              <span>Mobile: <strong>{customer.mobile}</strong></span>
            </div>

            {customer.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail size={16} style={{ color: 'var(--text-secondary)' }} />
                <span>Email: {customer.email}</span>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Building2 size={16} style={{ color: 'var(--text-secondary)' }} />
              <span>GSTIN: <strong style={{ fontFamily: 'monospace' }}>{customer.gstNumber || 'Not provided'}</strong></span>
            </div>

            {customer.address && (
              <div style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px solid var(--border)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <strong>Address:</strong>
                <p style={{ marginTop: '4px' }}>{customer.address}</p>
              </div>
            )}
          </div>

          {/* Follow-up Date Editor */}
          {(isSales || isAdmin) && (
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
              <label className="form-label" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} style={{ color: 'var(--accent)' }} />
                <span>Set Next Follow-up Date</span>
              </label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <input
                  type="date"
                  className="form-control"
                  style={{ fontSize: '0.8rem' }}
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleUpdateFollowUpDate}
                  className="btn btn-accent btn-sm"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>

        {/* CRM Follow-up Timeline & Notes */}
        <div>
          {/* Add Note Form */}
          {(isSales || isAdmin) && (
            <div className="table-container" style={{ padding: '20px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '0.95rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={18} style={{ color: 'var(--accent)' }} />
                <span>Log Sales Conversation / Follow-up Note</span>
              </h3>
              <form onSubmit={handleAddNote}>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Record call summary, pricing negotiation, requirement details, or action items..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  required
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button
                    type="submit"
                    className="btn btn-accent btn-sm"
                    disabled={isSubmittingNote}
                  >
                    <Plus size={16} />
                    <span>{isSubmittingNote ? 'Saving Note...' : 'Add Follow-up Note'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Timeline */}
          <div className="table-container">
            <div className="table-toolbar">
              <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} style={{ color: 'var(--accent)' }} />
                <span>Interaction & Conversation History ({customer.notes?.length || 0})</span>
              </h3>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {customer.notes && customer.notes.length > 0 ? (
                customer.notes.map((note) => (
                  <div
                    key={note.id}
                    style={{
                      borderLeft: '3px solid var(--accent)',
                      backgroundColor: 'var(--bg-main)',
                      padding: '14px 16px',
                      borderRadius: '0 8px 8px 0',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>
                        {note.user?.name || 'Sales User'} ({note.user?.role})
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {new Date(note.createdAt).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'pre-line' }}>
                      {note.note}
                    </p>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-secondary)' }}>
                  <MessageSquare size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                  <p style={{ fontSize: '0.9rem' }}>No follow-up notes logged for this customer yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
