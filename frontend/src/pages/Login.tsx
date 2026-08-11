import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ShieldAlert, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoTransparent from '../assets/logo-transparent.png';
import logoJpg from '../assets/logo.jpg';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillCredentials = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setError(null);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: 'var(--surface)',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '36px 32px 24px',
            textAlign: 'center',
            backgroundColor: '#0F172A',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <img
            src={logoTransparent}
            alt="ProcessifyERP Logo"
            style={{
              height: '56px',
              width: 'auto',
              maxWidth: '280px',
              marginBottom: '14px',
              objectFit: 'contain',
              filter: 'brightness(0) invert(1) drop-shadow(0 2px 12px rgba(255, 255, 255, 0.4))',
            }}
          />
          <h1 style={{ fontSize: '1.65rem', color: '#FFFFFF', fontWeight: 700, marginBottom: '6px', letterSpacing: '-0.02em' }}>
            ProcessifyERP
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#94A3B8' }}>
            B2B Mini ERP + CRM Operations Portal
          </p>
        </div>

        {/* Form Body */}
        <div style={{ padding: '32px' }}>
          {error && (
            <div
              style={{
                backgroundColor: 'var(--error-light)',
                border: '1px solid #FCA5A5',
                color: 'var(--error)',
                padding: '12px 14px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '20px',
              }}
            >
              <ShieldAlert size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Work Email</label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-secondary)',
                  }}
                />
                <input
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '38px' }}
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-secondary)',
                  }}
                />
                <input
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: '38px' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-accent"
              style={{ width: '100%', marginTop: '8px', padding: '10px' }}
              disabled={isSubmitting}
            >
              <span>{isSubmitting ? 'Signing in...' : 'Sign In to Portal'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Role Quick Selector */}
          <div
            style={{
              marginTop: '28px',
              paddingTop: '20px',
              borderTop: '1px solid var(--border)',
            }}
          >
            <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>
              DEMO CREDENTIALS (CLICK TO PREFILL):
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => fillCredentials('admin@processify.com', 'admin123')}
                style={{ fontSize: '0.75rem', justifyContent: 'flex-start' }}
              >
                <span className="user-role-badge role-admin" style={{ margin: 0 }}>Admin</span>
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => fillCredentials('sales@processify.com', 'sales123')}
                style={{ fontSize: '0.75rem', justifyContent: 'flex-start' }}
              >
                <span className="user-role-badge role-sales" style={{ margin: 0 }}>Sales</span>
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => fillCredentials('warehouse@processify.com', 'warehouse123')}
                style={{ fontSize: '0.75rem', justifyContent: 'flex-start' }}
              >
                <span className="user-role-badge role-warehouse" style={{ margin: 0 }}>Warehouse</span>
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => fillCredentials('accounts@processify.com', 'accounts123')}
                style={{ fontSize: '0.75rem', justifyContent: 'flex-start' }}
              >
                <span className="user-role-badge role-accounts" style={{ margin: 0 }}>Accounts</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
