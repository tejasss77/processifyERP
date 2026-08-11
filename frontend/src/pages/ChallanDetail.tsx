import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Building2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Printer,
  Receipt,
  Download,
} from 'lucide-react';
import { api } from '../services/api';
import { Challan } from '../types';
import { useAuth } from '../context/AuthContext';

export const ChallanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [challan, setChallan] = useState<Challan | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorBanner, setErrorBanner] = useState<{ message: string; details?: any } | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [docType, setDocType] = useState<'challan' | 'invoice'>('challan');

  const { isSales, isAdmin } = useAuth();

  const fetchChallan = async () => {
    if (!id) return;
    setLoading(true);
    setErrorBanner(null);
    try {
      const res = await api.getChallanById(id);
      setChallan(res.data);
    } catch (err) {
      console.error('Error fetching challan details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallan();
  }, [id]);

  const handleConfirmChallan = async () => {
    if (!id || !window.confirm('Are you sure you want to CONFIRM this sales challan? This action will validate available inventory and permanently reduce product stock.')) {
      return;
    }

    setIsActionLoading(true);
    setErrorBanner(null);

    try {
      await api.confirmChallan(id);
      alert('Sales Challan confirmed successfully! Inventory updated and Tax Invoice generated.');
      fetchChallan();
    } catch (err: any) {
      console.error('Challan confirmation error:', err);
      setErrorBanner({
        message: err.message || 'Stock confirmation failed',
        details: err.details,
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCancelChallan = async () => {
    if (!id || !window.confirm('Are you sure you want to CANCEL this draft sales challan?')) {
      return;
    }

    setIsActionLoading(true);
    setErrorBanner(null);

    try {
      await api.cancelChallan(id);
      alert('Challan has been cancelled.');
      fetchChallan();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel challan');
    } finally {
      setIsActionLoading(false);
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'chip-confirmed';
      case 'CANCELLED': return 'chip-cancelled';
      default: return 'chip-draft';
    }
  };

  if (loading || !challan) {
    return (
      <div>
        <div className="skeleton-row" style={{ height: '60px' }} />
        <div className="skeleton-row" style={{ height: '300px', marginTop: '20px' }} />
      </div>
    );
  }

  const isDraft = challan.status === 'DRAFT';
  const isConfirmed = challan.status === 'CONFIRMED';
  const isCancelled = challan.status === 'CANCELLED';

  const invoiceNumber = `INV-2026-${challan.challanNumber.replace('CH-2026-', '')}`;
  const taxableAmount = challan.totalAmount;
  const cgstAmount = Math.round(taxableAmount * 0.09);
  const sgstAmount = Math.round(taxableAmount * 0.09);
  const totalInvoiceAmount = taxableAmount + cgstAmount + sgstAmount;

  return (
    <div>
      {/* Back Button & Print Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Link to="/challans" className="btn btn-outline btn-sm">
          <ArrowLeft size={16} />
          <span>Back to Sales Challans</span>
        </Link>

        {/* View Mode Toggle */}
        <div style={{ display: 'flex', gap: '8px', background: 'var(--surface)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <button
            onClick={() => setDocType('challan')}
            className={`btn btn-sm ${docType === 'challan' ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: 'none' }}
          >
            <FileText size={15} />
            <span>Delivery Challan</span>
          </button>

          <button
            onClick={() => setDocType('invoice')}
            className={`btn btn-sm ${docType === 'invoice' ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: 'none' }}
          >
            <Receipt size={15} />
            <span>Tax Invoice ({invoiceNumber})</span>
          </button>
        </div>

        <button onClick={() => window.print()} className="btn btn-outline btn-sm">
          <Printer size={16} />
          <span>Print {docType === 'invoice' ? 'Tax Invoice' : 'Delivery Challan'}</span>
        </button>
      </div>

      {/* Insufficient Stock 409 Error Alert Banner */}
      {errorBanner && (
        <div
          style={{
            backgroundColor: '#FEE2E2',
            border: '2px solid #EF4444',
            borderRadius: '8px',
            padding: '16px 20px',
            marginBottom: '24px',
            color: '#991B1B',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.05rem', fontWeight: 700 }}>
            <AlertTriangle size={24} style={{ color: '#DC2626' }} />
            <span>HTTP 409 Conflict — Transaction Aborted</span>
          </div>
          <p style={{ marginTop: '6px', fontSize: '0.9rem', fontWeight: 600 }}>
            {errorBanner.message}
          </p>
          {errorBanner.details && (
            <div style={{ marginTop: '8px', fontSize: '0.85rem', backgroundColor: '#FFFFFF', padding: '10px', borderRadius: '6px', border: '1px solid #FCA5A5' }}>
              <div>Product ID: <code>{errorBanner.details.productId}</code></div>
              <div>Available Warehouse Stock: <strong>{errorBanner.details.available} pcs</strong></div>
              <div>Requested Order Quantity: <strong>{errorBanner.details.requested} pcs</strong></div>
            </div>
          )}
        </div>
      )}

      {/* DOCUMENT TYPE 1: DELIVERY CHALLAN */}
      {docType === 'challan' && (
        <>
          <div className="table-container" style={{ padding: '28px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '20px', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.05em' }}>
                  OFFICIAL DELIVERY DOCUMENT
                </span>
                <h1 style={{ fontSize: '1.75rem', marginTop: '2px' }}>Challan #{challan.challanNumber}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                  <span className={`status-chip ${getStatusChip(challan.status)}`} style={{ fontSize: '0.85rem' }}>
                    STATUS: {challan.status}
                  </span>
                  {isDraft && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--warning)', fontWeight: 600 }}>
                      (Stock NOT reduced yet)
                    </span>
                  )}
                </div>
              </div>

              <div style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <div>Issued Date: <strong>{new Date(challan.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></div>
                <div>Prepared By: <strong>{challan.user?.name}</strong> ({challan.user?.role})</div>
                {isConfirmed && (
                  <div style={{ marginTop: '4px', color: 'var(--success)', fontWeight: 600 }}>
                    Tax Invoice Ref: <strong>#{invoiceNumber}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Customer & Business Context */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', backgroundColor: 'var(--bg-main)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Billed To Customer:
                </span>
                <h3 style={{ fontSize: '1.1rem', marginTop: '2px' }}>{challan.customer?.businessName}</h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '4px' }}>
                  Contact: {challan.customer?.name} ({challan.customer?.mobile})
                </div>
                {challan.customer?.address && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Address: {challan.customer.address}
                  </div>
                )}
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Tax & Business Details:
                </span>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, marginTop: '4px' }}>
                  GSTIN: {challan.customer?.gstNumber || 'Unregistered / Exempt'}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Customer Segment: {challan.customer?.customerType}
                </div>
              </div>
            </div>
          </div>

          {/* Snapshot Line Items Table */}
          <div className="table-container" style={{ marginBottom: '24px' }}>
            <div className="table-toolbar">
              <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} style={{ color: 'var(--accent)' }} />
                <span>Product Line Items & Historical Price Snapshots</span>
              </h3>
            </div>

            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product SKU (Snapshot)</th>
                  <th>Product Name (Snapshot)</th>
                  <th>Quantity</th>
                  <th>Unit Price (Snapshot)</th>
                  <th style={{ textAlign: 'right' }}>Line Total</th>
                </tr>
              </thead>
              <tbody>
                {challan.items && challan.items.length > 0 ? (
                  challan.items.map((item, idx) => (
                    <tr key={item.id}>
                      <td style={{ color: 'var(--text-secondary)' }}>{idx + 1}</td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{item.sku}</td>
                      <td>
                        <strong>{item.productName}</strong>
                        {isDraft && item.product && (
                          <div style={{ fontSize: '0.75rem', color: item.product.currentStock < item.quantity ? 'var(--error)' : 'var(--text-secondary)' }}>
                            Available Stock: {item.product.currentStock} pcs
                          </div>
                        )}
                      </td>
                      <td>{item.quantity} pcs</td>
                      <td>₹{item.unitPrice.toLocaleString('en-IN')}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>
                        ₹{item.lineTotal.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No items recorded on this challan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Grand Total Footer */}
            <div
              style={{
                padding: '20px',
                backgroundColor: 'var(--bg-main)',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Total Quantity: <strong>{challan.totalQuantity} units</strong> across <strong>{challan.items?.length || 0} product lines</strong>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--secondary)' }}>Challan Grand Total:</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--primary)' }}>
                  ₹{challan.totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* DOCUMENT TYPE 2: B2B TAX INVOICE */}
      {docType === 'invoice' && (
        <div className="table-container" style={{ padding: '32px', marginBottom: '24px', backgroundColor: '#FFFFFF', color: '#0F172A', border: '1px solid #CBD5E1' }}>
          {/* Printable Invoice Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0F172A', paddingBottom: '20px', marginBottom: '24px' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0F766E', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                TAX INVOICE (Rules 46 - CGST Rules 2017)
              </span>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>Invoice #{invoiceNumber}</h1>
              <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px' }}>
                Delivery Challan Ref: <strong>#{challan.challanNumber}</strong>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', color: '#475569' }}>Invoice Date: <strong>{new Date(challan.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></div>
              <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '2px' }}>Payment Terms: <strong>Net 30 Days</strong></div>
              <div style={{ marginTop: '8px' }}>
                <span style={{ background: '#DCFCE7', color: '#166534', padding: '4px 12px', borderRadius: '4px', fontWeight: 700, fontSize: '0.8rem' }}>
                  PAYMENT STATUS: {isConfirmed ? 'CONFIRMED & INVOICED' : 'DRAFT INVOICE'}
                </span>
              </div>
            </div>
          </div>

          {/* Supplier & Customer Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '28px', background: '#F8FAFC', padding: '20px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            {/* Supplier / Seller */}
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                SUPPLIER (SELLER DETAILS):
              </span>
              <h3 style={{ fontSize: '1.1rem', color: '#0F172A', marginTop: '4px', fontWeight: 700 }}>ProcessifyERP Commercial Center</h3>
              <div style={{ fontSize: '0.85rem', color: '#334155', marginTop: '4px' }}>Plot 42, GIDC Industrial Estate, Vadodara, Gujarat 390010</div>
              <div style={{ fontSize: '0.85rem', color: '#0F766E', fontWeight: 700, marginTop: '4px' }}>GSTIN: 24AAAAA0000A1Z5</div>
              <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '2px' }}>State Code: 24 (Gujarat)</div>
            </div>

            {/* Buyer / Customer */}
            <div style={{ borderLeft: '1px solid #E2E8F0', paddingLeft: '24px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                BUYER (BILLED TO):
              </span>
              <h3 style={{ fontSize: '1.1rem', color: '#0F172A', marginTop: '4px', fontWeight: 700 }}>{challan.customer?.businessName}</h3>
              <div style={{ fontSize: '0.85rem', color: '#334155', marginTop: '4px' }}>Contact: {challan.customer?.name} ({challan.customer?.mobile})</div>
              {challan.customer?.address && (
                <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '2px' }}>{challan.customer.address}</div>
              )}
              <div style={{ fontSize: '0.85rem', color: '#0F766E', fontWeight: 700, marginTop: '4px' }}>
                GSTIN: {challan.customer?.gstNumber || 'Unregistered / Retail'}
              </div>
            </div>
          </div>

          {/* Tax Invoice Item Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
            <thead>
              <tr style={{ background: '#F1F5F9', borderBottom: '2px solid #CBD5E1', textAlign: 'left', fontSize: '0.82rem', color: '#475569' }}>
                <th style={{ padding: '10px' }}>#</th>
                <th style={{ padding: '10px' }}>HSN / SKU</th>
                <th style={{ padding: '10px' }}>Description of Goods</th>
                <th style={{ padding: '10px' }}>Qty</th>
                <th style={{ padding: '10px' }}>Unit Rate</th>
                <th style={{ padding: '10px' }}>Taxable Value</th>
                <th style={{ padding: '10px' }}>CGST (9%)</th>
                <th style={{ padding: '10px' }}>SGST (9%)</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Total (INR)</th>
              </tr>
            </thead>
            <tbody>
              {challan.items?.map((item, idx) => {
                const lineTaxable = item.lineTotal;
                const cgst = Math.round(lineTaxable * 0.09);
                const sgst = Math.round(lineTaxable * 0.09);
                const lineTotal = lineTaxable + cgst + sgst;

                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #E2E8F0', fontSize: '0.85rem', color: '#1E293B' }}>
                    <td style={{ padding: '10px' }}>{idx + 1}</td>
                    <td style={{ padding: '10px', fontFamily: 'monospace', fontWeight: 600 }}>{item.sku}</td>
                    <td style={{ padding: '10px', fontWeight: 600 }}>{item.productName}</td>
                    <td style={{ padding: '10px' }}>{item.quantity} pcs</td>
                    <td style={{ padding: '10px' }}>₹{item.unitPrice.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '10px', fontWeight: 600 }}>₹{lineTaxable.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '10px', color: '#475569' }}>₹{cgst.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '10px', color: '#475569' }}>₹{sgst.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700 }}>₹{lineTotal.toLocaleString('en-IN')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Tax Summary Totals Grid */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: '#F8FAFC', padding: '20px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.82rem', color: '#475569' }}>
              <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>Bank & Remittance Details:</div>
              <div>Bank Name: <strong>HDFC Bank Ltd</strong></div>
              <div>Account No: <strong>50200012345678</strong></div>
              <div>IFSC Code: <strong>HDFC0000123</strong></div>
            </div>

            <div style={{ width: '280px', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#475569' }}>
                <span>Total Taxable Amount:</span>
                <span style={{ fontWeight: 600 }}>₹{taxableAmount.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#475569' }}>
                <span>CGST (9%):</span>
                <span style={{ fontWeight: 600 }}>₹{cgstAmount.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#475569' }}>
                <span>SGST (9%):</span>
                <span style={{ fontWeight: 600 }}>₹{sgstAmount.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', marginTop: '6px', borderTop: '2px solid #0F172A', fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                <span>Grand Total:</span>
                <span style={{ color: '#0F766E' }}>₹{totalInvoiceAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Footer for Workflow Confirmation / Cancellation */}
      <div
        className="table-container"
        style={{
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--surface)',
        }}
      >
        <div>
          {isDraft && (
            <span style={{ fontSize: '0.85rem', color: 'var(--warning)', fontWeight: 600 }}>
              ⚠️ Ready for confirmation. Click "Confirm & Reduce Stock" to trigger backend database transaction.
            </span>
          )}
          {isConfirmed && (
            <span style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={18} />
              <span>Order Confirmed & Invoiced. Product stock was reduced and OUT audit entries logged.</span>
            </span>
          )}
          {isCancelled && (
            <span style={{ fontSize: '0.85rem', color: 'var(--error)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <XCircle size={18} />
              <span>This draft sales challan has been cancelled.</span>
            </span>
          )}
        </div>

        {isDraft && (isSales || isAdmin) && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleCancelChallan}
              className="btn btn-outline"
              style={{ color: 'var(--error)', borderColor: 'var(--error)' }}
              disabled={isActionLoading}
            >
              <XCircle size={16} />
              <span>Cancel Draft</span>
            </button>

            <button
              onClick={handleConfirmChallan}
              className="btn btn-accent"
              style={{ padding: '10px 24px', fontSize: '0.95rem' }}
              disabled={isActionLoading}
            >
              <CheckCircle size={18} />
              <span>{isActionLoading ? 'Validating Stock...' : 'Confirm & Generate Tax Invoice'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
