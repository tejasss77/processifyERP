import {
  ApiResponse,
  User,
  Customer,
  CustomerNote,
  Product,
  StockMovement,
  Challan,
  DashboardMetrics,
} from '../types';

const API_BASE_URL = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    const error: any = new Error(data.message || 'An API error occurred');
    error.status = response.status;
    error.details = data.details;
    throw error;
  }

  return data;
}

function buildQueryString(params?: Record<string, any>): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '' && val !== 'undefined') {
      searchParams.append(key, String(val));
    }
  });
  return searchParams.toString();
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    request<ApiResponse<{ token: string; user: User }>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getMe: () => request<ApiResponse<User>>('/auth/me'),

  // Customers
  getCustomers: (params?: { search?: string; status?: string; type?: string; page?: number; limit?: number }) => {
    const query = buildQueryString(params);
    return request<ApiResponse<Customer[]>>(`/customers?${query}`);
  },

  getCustomerById: (id: string) => request<ApiResponse<Customer>>(`/customers/${id}`),

  createCustomer: (data: Partial<Customer>) =>
    request<ApiResponse<Customer>>('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCustomer: (id: string, data: Partial<Customer>) =>
    request<ApiResponse<Customer>>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  addCustomerNote: (id: string, note: string) =>
    request<ApiResponse<CustomerNote>>(`/customers/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    }),

  // Products & Inventory
  getProducts: (params?: { search?: string; category?: string; lowStock?: boolean; page?: number; limit?: number }) => {
    const queryParams: any = { ...params };
    if (params?.lowStock) queryParams.lowStock = 'true';
    const query = buildQueryString(queryParams);
    return request<ApiResponse<Product[]>>(`/products?${query}`);
  },

  getProductById: (id: string) => request<ApiResponse<Product>>(`/products/${id}`),

  createProduct: (data: Partial<Product>) =>
    request<ApiResponse<Product>>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateProduct: (id: string, data: Partial<Product>) =>
    request<ApiResponse<Product>>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  adjustStock: (id: string, data: { movementType: 'IN' | 'OUT'; quantity: number; reason: string }) =>
    request<ApiResponse<{ product: Product; movement: StockMovement }>>(`/products/${id}/stock`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Stock Movements
  getStockMovements: (params?: { search?: string; type?: string; page?: number; limit?: number }) => {
    const query = buildQueryString(params);
    return request<ApiResponse<StockMovement[]>>(`/stock-movements?${query}`);
  },

  // Challans
  getChallans: (params?: { search?: string; status?: string; page?: number; limit?: number }) => {
    const query = buildQueryString(params);
    return request<ApiResponse<Challan[]>>(`/challans?${query}`);
  },

  getChallanById: (id: string) => request<ApiResponse<Challan>>(`/challans/${id}`),

  createDraftChallan: (data: { customerId: string; items: Array<{ productId: string; quantity: number }> }) =>
    request<ApiResponse<Challan>>('/challans', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  confirmChallan: (id: string) =>
    request<ApiResponse<Challan>>(`/challans/${id}/confirm`, {
      method: 'POST',
    }),

  cancelChallan: (id: string) =>
    request<ApiResponse<Challan>>(`/challans/${id}/cancel`, {
      method: 'POST',
    }),

  // Users (Admin)
  getUsers: (params?: { search?: string; page?: number; limit?: number }) => {
    const query = buildQueryString(params);
    return request<ApiResponse<User[]>>(`/users?${query}`);
  },

  createUser: (data: Partial<User> & { password: string }) =>
    request<ApiResponse<User>>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Dashboard Metrics
  getDashboardMetrics: () => request<ApiResponse<DashboardMetrics>>('/dashboard/metrics'),

  // Reports & Analytics
  getReportAnalytics: () => request<ApiResponse<any>>('/reports/analytics'),

  // Admin Governance & Approvals
  getApprovals: (status?: string) => {
    const query = buildQueryString({ status });
    return request<ApiResponse<{ requests: any[]; pendingCount: number }>>(`/approvals?${query}`);
  },

  approveRequest: (id: string) =>
    request<ApiResponse<any>>(`/approvals/${id}/approve`, {
      method: 'POST',
    }),

  rejectRequest: (id: string, rejectionReason?: string) =>
    request<ApiResponse<any>>(`/approvals/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejectionReason }),
    }),
};
