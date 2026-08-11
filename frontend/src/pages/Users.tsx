import React, { useState, useEffect } from 'react';
import { UserCheck, Search, Plus, User as UserIcon, Shield, X } from 'lucide-react';
import { api } from '../services/api';
import { User, Role } from '../types';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'SALES' as Role,
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getUsers({ search });
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createUser(form);
      setShowModal(false);
      setForm({ name: '', email: '', password: '', role: 'SALES' });
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to create user');
    }
  };

  const getRoleClass = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'role-admin';
      case 'SALES': return 'role-sales';
      case 'WAREHOUSE': return 'role-warehouse';
      case 'ACCOUNTS': return 'role-accounts';
      default: return 'role-admin';
    }
  };

  return (
    <div>
      {/* Banner */}
      <div className="section-banner" style={{ borderLeftColor: 'var(--secondary)' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={22} style={{ color: 'var(--secondary)' }} />
            <span>System Users & Role Administration</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Manage employee access, authentication credentials, and permission roles
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={18} />
          <span>Add System User</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="table-container">
        <div className="table-toolbar">
          <div className="search-input-wrapper">
            <Search />
            <input
              type="text"
              className="search-input"
              placeholder="Search user name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '20px' }}>
            <div className="skeleton-row" />
            <div className="skeleton-row" />
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>User Account Name</th>
                <th>Work Email</th>
                <th>Assigned Access Role</th>
                <th>Created Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--bg-main)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--primary)',
                            fontWeight: 600,
                          }}
                        >
                          {u.name.charAt(0)}
                        </div>
                        <strong>{u.name}</strong>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-primary)' }}>{u.email}</td>
                    <td>
                      <span className={`user-role-badge ${getRoleClass(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '28px' }}>
                    No users match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '460px' }}>
            <div className="modal-header">
              <h3>Create System User Account</h3>
              <button onClick={() => setShowModal(false)} className="btn btn-outline btn-sm" style={{ border: 'none' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Employee Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Anand Kumar"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Work Email Address *</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="anand@processify.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Initial Password *</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Minimum 6 characters"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Access Role *</label>
                  <select
                    className="form-control"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
                  >
                    <option value="SALES">Sales (Customers & Challan Creation)</option>
                    <option value="WAREHOUSE">Warehouse (Products, Stock & Movements)</option>
                    <option value="ACCOUNTS">Accounts (Financial Visibility)</option>
                    <option value="ADMIN">Admin (Full Control)</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
