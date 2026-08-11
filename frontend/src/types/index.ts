export type Role = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';
export type CustomerType = 'LEAD' | 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE' | 'CONVERTED';
export type MovementType = 'IN' | 'OUT';
export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
}

export interface CustomerNote {
  id: string;
  customerId: string;
  note: string;
  createdBy: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    role: Role;
  };
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email?: string | null;
  businessName: string;
  gstNumber?: string | null;
  customerType: CustomerType;
  address?: string | null;
  status: CustomerStatus;
  followUpDate?: string | null;
  createdAt: string;
  updatedAt: string;
  notes?: CustomerNote[];
  challans?: Challan[];
  _count?: {
    notes: number;
    challans: number;
  };
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minStock: number;
  warehouseLocation: string;
  createdAt: string;
  updatedAt: string;
  stockMovements?: StockMovement[];
}

export interface StockMovement {
  id: string;
  productId: string;
  quantity: number;
  movementType: MovementType;
  reason: string;
  createdBy: string;
  createdAt: string;
  product?: {
    id: string;
    name: string;
    sku: string;
    category: string;
  };
  user?: {
    id: string;
    name: string;
    role: Role;
  };
}

export interface ChallanItem {
  id: string;
  challanId: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  product?: {
    id: string;
    name: string;
    currentStock: number;
    minStock: number;
  };
}

export interface Challan {
  id: string;
  challanNumber: string;
  customerId: string;
  status: ChallanStatus;
  totalQuantity: number;
  totalAmount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  customer: Customer;
  user: {
    id: string;
    name: string;
    role: Role;
  };
  items?: ChallanItem[];
}

export interface DashboardMetrics {
  totalCustomers: number;
  totalProducts: number;
  lowStockCount: number;
  todayChallansCount: number;
  totalRevenue: number;
  recentChallans: Challan[];
  upcomingFollowUps: Array<{
    id: string;
    name: string;
    businessName: string;
    followUpDate: string;
    status: CustomerStatus;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  details?: any;
}
