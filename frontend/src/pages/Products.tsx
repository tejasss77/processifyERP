import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Plus,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Edit2,
  X,
} from 'lucide-react';
import { api } from '../services/api';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProductForStock, setSelectedProductForStock] = useState<Product | null>(null);

  // Product Form State
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    category: 'Accessories',
    unitPrice: 0,
    currentStock: 0,
    minStock: 5,
    warehouseLocation: 'Vadodara WH-Rack-A1',
  });

  // Stock Adjustment Form State
  const [stockForm, setStockForm] = useState({
    movementType: 'IN' as 'IN' | 'OUT',
    quantity: 1,
    reason: '',
  });

  const { isWarehouse, isAdmin } = useAuth();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.getProducts({
        search,
        category: categoryFilter || undefined,
        lowStock: lowStockFilter,
      });
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, categoryFilter, lowStockFilter]);

  const handleOpenProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        sku: product.sku,
        category: product.category,
        unitPrice: product.unitPrice,
        currentStock: product.currentStock,
        minStock: product.minStock,
        warehouseLocation: product.warehouseLocation,
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        sku: '',
        category: 'Monitors',
        unitPrice: 0,
        currentStock: 0,
        minStock: 5,
        warehouseLocation: 'Vadodara WH-Rack-A1',
      });
    }
    setShowProductModal(true);
  };

  const handleOpenStockModal = (product: Product) => {
    setSelectedProductForStock(product);
    setStockForm({
      movementType: 'IN',
      quantity: 5,
      reason: 'PO Stock Replenishment',
    });
    setShowStockModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, productForm);
      } else {
        await api.createProduct(productForm);
      }
      setShowProductModal(false);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Failed to save product master');
    }
  };

  const handleSaveStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForStock) return;

    try {
      await api.adjustStock(selectedProductForStock.id, stockForm);
      setShowStockModal(false);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Stock adjustment failed');
    }
  };

  return (
    <div>
      {/* Banner */}
      <div className="section-banner" style={{ borderLeftColor: '#0284C7' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={22} style={{ color: '#0284C7' }} />
            <span>Product Master & Inventory Levels</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Real-time stock counts, reorder thresholds, and warehouse rack locations
          </p>
        </div>
        {(isWarehouse || isAdmin) && (
          <button onClick={() => handleOpenProductModal()} className="btn btn-primary">
            <Plus size={18} />
            <span>Add New Product</span>
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
              placeholder="Search product name, SKU, category, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <select
              className="pill-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Monitors">Monitors</option>
              <option value="Accessories">Accessories</option>
              <option value="Laptops">Laptops</option>
              <option value="Networking">Networking</option>
            </select>

            <button
              onClick={() => setLowStockFilter(!lowStockFilter)}
              className={`pill-select ${lowStockFilter ? 'chip-draft' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <AlertTriangle size={14} style={{ color: lowStockFilter ? 'var(--warning)' : 'inherit' }} />
              <span>{lowStockFilter ? 'Showing Low Stock Only' : 'Filter Low Stock'}</span>
            </button>
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
                <th>Product SKU & Name</th>
                <th>Category</th>
                <th>Unit Price (Selling)</th>
                <th>Current Stock</th>
                <th>Min Stock Threshold</th>
                <th>Warehouse Location</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((p) => {
                  const isLowStock = p.currentStock <= p.minStock;
                  return (
                    <tr key={p.id} style={{ backgroundColor: isLowStock ? '#FFFBEB' : 'transparent' }}>
                      <td>
                        <div>
                          <strong style={{ color: 'var(--primary)' }}>{p.name}</strong>
                          <div style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                            SKU: {p.sku}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="user-role-badge role-admin" style={{ fontSize: '0.7rem' }}>
                          {p.category}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>₹{p.unitPrice.toLocaleString('en-IN')}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1rem', fontWeight: 700, color: isLowStock ? 'var(--warning)' : 'var(--primary)' }}>
                            {p.currentStock} pcs
                          </span>
                          {isLowStock && (
                            <span className="status-chip chip-draft" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                              <AlertTriangle size={12} />
                              LOW STOCK
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{p.minStock} pcs</td>
                      <td style={{ fontSize: '0.82rem' }}>{p.warehouseLocation}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          {(isWarehouse || isAdmin) && (
                            <>
                              <button
                                onClick={() => handleOpenStockModal(p)}
                                className="btn btn-outline btn-sm"
                                style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
                                title="Adjust Stock (IN / OUT)"
                              >
                                <ArrowUpRight size={14} />
                                <span>Adjust Stock</span>
                              </button>

                              <button
                                onClick={() => handleOpenProductModal(p)}
                                className="btn btn-outline btn-sm"
                                title="Edit Product Info"
                              >
                                <Edit2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '28px' }}>
                    No products found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {showProductModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingProduct ? 'Edit Product Master' : 'Add New Product Master'}</h3>
              <button onClick={() => setShowProductModal(false)} className="btn btn-outline btn-sm" style={{ border: 'none' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveProduct}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">SKU Code *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. MON-DELL-27"
                      value={productForm.sku}
                      onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Unit Price (₹) *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={productForm.unitPrice}
                      onChange={(e) => setProductForm({ ...productForm, unitPrice: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>

                  {!editingProduct && (
                    <div className="form-group">
                      <label className="form-label">Initial Stock *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={productForm.currentStock}
                        onChange={(e) => setProductForm({ ...productForm, currentStock: parseInt(e.target.value) || 0 })}
                        required
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Min Stock Threshold *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={productForm.minStock}
                      onChange={(e) => setProductForm({ ...productForm, minStock: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Warehouse Location / Rack *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Vadodara WH-Rack-A1"
                    value={productForm.warehouseLocation}
                    onChange={(e) => setProductForm({ ...productForm, warehouseLocation: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowProductModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {showStockModal && selectedProductForStock && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3>Adjust Product Stock</h3>
              <button onClick={() => setShowStockModal(false)} className="btn btn-outline btn-sm" style={{ border: 'none' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveStockAdjustment}>
              <div className="modal-body">
                <div style={{ backgroundColor: 'var(--bg-main)', padding: '12px', borderRadius: '6px', marginBottom: '16px' }}>
                  <strong>{selectedProductForStock.name}</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Current Available Stock: <strong>{selectedProductForStock.currentStock} pcs</strong>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Movement Direction</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <button
                      type="button"
                      className={`btn ${stockForm.movementType === 'IN' ? 'btn-accent' : 'btn-outline'}`}
                      onClick={() => setStockForm({ ...stockForm, movementType: 'IN' })}
                    >
                      <ArrowUpRight size={16} />
                      <span>IN (Stock Increase)</span>
                    </button>
                    <button
                      type="button"
                      className={`btn ${stockForm.movementType === 'OUT' ? 'btn-danger' : 'btn-outline'}`}
                      onClick={() => setStockForm({ ...stockForm, movementType: 'OUT' })}
                    >
                      <ArrowDownRight size={16} />
                      <span>OUT (Stock Decrease)</span>
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Quantity *</label>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    value={stockForm.quantity}
                    onChange={(e) => setStockForm({ ...stockForm, quantity: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Audit Trail Reason *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Purchase order arrival, Damaged unit return..."
                    value={stockForm.reason}
                    onChange={(e) => setStockForm({ ...stockForm, reason: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowStockModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-accent">
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
