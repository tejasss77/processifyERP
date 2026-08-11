# ProcessifyERP — Mini ERP + CRM Operations Portal

ProcessifyERP is an enterprise-grade B2B Mini ERP + CRM Operations Portal designed for wholesale and distribution businesses. It unifies customer relationship management (CRM), product inventory master, stock audit logging, and transactional sales challan workflows into a centralized internal application.

![ProcessifyERP Logo](./details/logo.svg)

---

## 🚀 Key Business Modules & Rules

1. **Authentication & Role-Based Access Control (RBAC)**:
   - **Admin**: Full access across users, customers, products, inventory, challans, and metrics.
   - **Sales**: Manage customer accounts, record follow-up conversation notes, set follow-up dates, create draft sales challans, and finalize/cancel challans.
   - **Warehouse**: Manage product master catalog, perform manual stock adjustments (IN/OUT), monitor low-stock alerts, and inspect audit trails.
   - **Accounts**: Access confirmed sales documents, customer account details, and financial revenue summaries.

2. **Customer CRM Module**:
   - Profile tracking (Name, Mobile, Email, Business Name, GST Number, Address, Type: Lead/Retail/Wholesale/Distributor, Status: Lead/Active/Inactive/Converted).
   - Interaction Timeline: Append conversation notes with author role & timestamp.
   - Follow-up Date Reminders: Schedule next contact dates with dashboard alert widgets.

3. **Product & Inventory Management**:
   - Product Master (SKU, Name, Category, Unit Price, Current Stock, Min Stock Threshold, Warehouse Location).
   - Low-Stock Indicator: Automatic alerts when `currentStock <= minStock`.

4. **Stock Movement Audit Log**:
   - Immutable audit trail tracking every inventory modification (`IN` / `OUT`, quantity, reason, created by user, timestamp).

5. **Sales Challan Core Workflow**:
   - **Draft Stage**: Sales user selects customer and product items. Saved with status `DRAFT`. Unit prices are captured as snapshots. **Product stock is NOT reduced during draft creation**.
   - **Confirmation Stage & Database Transaction**: When user clicks **Confirm Challan**, backend executes inside an atomic database transaction (`prisma.$transaction`):
     1. Verifies challan is in `DRAFT` state.
     2. Locks product records and checks available stock for every line item.
     3. **No Negative Stock Enforcement**: If `currentStock < requestedQuantity` for any product, the transaction automatically **rolls back** and returns HTTP `409 Conflict` with detailed stock availability info.
     4. If stock is sufficient across all items, reduces `currentStock`, creates `StockMovement` `OUT` entries, and sets status to `CONFIRMED`.
   - **Product Snapshot Data**: Line items store snapshot `productName`, `sku`, and `unitPrice` at time of creation so historical sales records remain accurate even if product master details change later.

---

## 🎨 UI Design System & Color Palette

Built with modern B2B enterprise design standards featuring clean rectangular tables, slightly rounded containers (`8px`), oval status chips, subtle shadows, and visual section duality:

- **Primary (Deep Navy)**: `#0F172A`
- **Secondary (Slate Blue)**: `#334155`
- **Accent (Teal)**: `#0F766E`
- **Soft Teal**: `#CCFBF1`
- **Background**: `#F8FAFC`
- **Surface**: `#FFFFFF`
- **Border**: `#E2E8F0`
- **Status Indicators**: Emerald `#059669` (Success/Confirmed), Amber `#D97706` (Warning/Draft), Red `#DC2626` (Error/Cancelled).

### Visual Duality Rules:
- **CRM Section**: Deep Navy + Soft Teal highlights
- **Inventory Section**: Slate Blue + Teal highlights
- **Sales Challans**: Deep Navy + Amber highlights
- **Accounts Section**: Slate Blue + Emerald highlights
- **Admin Section**: Deep Navy + Slate Gray

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Lucide Icons, Custom CSS Theme Variables.
- **Backend**: Node.js, Express.js, TypeScript, Zod Validation, JWT Auth, Bcrypt.
- **Database & ORM**: PostgreSQL / SQLite, Prisma ORM.

---

## 🔑 Test Seed Credentials

The database is pre-populated with test accounts for all 4 roles:

| Role | Email | Password | Allowed Access |
|---|---|---|---|
| **Admin** | `admin@processify.com` | `admin123` | Full System Access & User Administration |
| **Sales** | `sales@processify.com` | `sales123` | Customers CRM, Notes, Challan Creation & Confirmation |
| **Warehouse** | `warehouse@processify.com` | `warehouse123` | Products, Stock Adjustments, Movement Logs |
| **Accounts** | `accounts@processify.com` | `accounts123` | Confirmed Sales Challans & Account Revenue Summaries |

---

## 📋 REST API Specification

| Module | Endpoint | Method | Allowed Roles | Purpose | HTTP Status |
|---|---|---|---|---|---|
| **Auth** | `/api/auth/login` | `POST` | Public | Login & receive JWT token | 200, 401 |
| **Auth** | `/api/auth/me` | `GET` | All Authenticated | Get current user profile | 200, 401 |
| **CRM** | `/api/customers` | `GET` | All Authenticated | List customers with search/filter | 200 |
| **CRM** | `/api/customers` | `POST` | Admin, Sales | Create customer account | 201, 400 |
| **CRM** | `/api/customers/:id` | `GET` | All Authenticated | Get customer details & notes | 200, 404 |
| **CRM** | `/api/customers/:id` | `PUT` | Admin, Sales | Update customer profile & follow-up | 200, 404 |
| **CRM** | `/api/customers/:id/notes` | `POST` | Admin, Sales | Append follow-up conversation note | 201, 400 |
| **Inventory** | `/api/products` | `GET` | All Authenticated | List products with low-stock filter | 200 |
| **Inventory** | `/api/products` | `POST` | Admin, Warehouse | Create product master | 201, 409 |
| **Inventory** | `/api/products/:id` | `PUT` | Admin, Warehouse | Update product details | 200, 404 |
| **Inventory** | `/api/products/:id/stock` | `POST` | Admin, Warehouse | Manual IN/OUT stock adjustment | 200, 409 |
| **Audit Log**| `/api/stock-movements` | `GET` | All Authenticated | Fetch stock movement audit trail | 200 |
| **Challans** | `/api/challans` | `GET` | All Authenticated | List sales challans | 200 |
| **Challans** | `/api/challans` | `POST` | Admin, Sales | Create draft challan & snapshots | 201, 400 |
| **Challans** | `/api/challans/:id` | `GET` | All Authenticated | Fetch challan details & line items | 200, 404 |
| **Challans** | `/api/challans/:id/confirm` | `POST` | Admin, Sales | Transaction stock deduction & confirm | 200, 409 |
| **Challans** | `/api/challans/:id/cancel` | `POST` | Admin, Sales | Cancel draft challan | 200, 400 |
| **Admin** | `/api/users` | `GET` | Admin | List system users | 200, 403 |
| **Admin** | `/api/users` | `POST` | Admin | Create new system user account | 201, 409 |
| **Dashboard**| `/api/dashboard/metrics` | `GET` | All Authenticated | Fetch summary stats & metrics | 200 |

---

## 💻 Local Quickstart Setup

### Prerequisites
- Node.js (v18+) & npm

### 1. Clone Repository & Install Dependencies
```bash
# Navigate to project root
cd processifyERP

# Setup Backend
cd backend
npm install

# Setup Frontend
cd ../frontend
npm install
```

### 2. Configure Environment Variables
- **Backend** (`backend/.env`):
  ```env
  PORT=5001
  DATABASE_URL="file:./dev.db"
  JWT_SECRET="processify_erp_super_secret_jwt_key_2026"
  CORS_ORIGIN="http://localhost:5173"
  ```
- **Frontend** (`frontend/.env`):
  ```env
  VITE_API_BASE_URL=http://localhost:5001/api
  ```

### 3. Initialize Database Schema & Seed Data
```bash
cd backend
npx prisma db push
npx prisma db seed
```

### 4. Run Application Servers
- **Start Backend API Server**:
  ```bash
  cd backend
  npm run dev
  # Server running at http://localhost:5001
  ```
- **Start Frontend Dev Server**:
  ```bash
  cd frontend
  npm run dev
  # Frontend running at http://localhost:5173
  ```

---

## 🌐 Production Deployment Guide (PostgreSQL)

To deploy for production hosting:

1. **Database (Supabase / Neon PostgreSQL)**:
   - Update `backend/prisma/schema.prisma` datasource provider to `postgresql`:
     ```prisma
     datasource db {
       provider = "postgresql"
       url      = env("DATABASE_URL")
     }
     ```
   - Set `DATABASE_URL` in environment to your PostgreSQL connection string.
   - Run `npx prisma db push && npx prisma db seed`.

2. **Backend (Render / Railway / Fly.io)**:
   - Build command: `npm run build`
   - Start command: `npm start`
   - Set environment variables: `PORT`, `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`.

3. **Frontend (Vercel / Netlify / Render)**:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Environment variable: `VITE_API_BASE_URL=https://your-backend-api.onrender.com/api`

---

## 📝 Assumptions & Known Limitations

- **Tax Calculation**: Default unit prices are exclusive of GST.
- **Stock Movement Deletions**: Stock movements are immutable audit records and cannot be deleted or retroactively edited via the API.
- **Offline Cache**: User sessions require an active internet connection to communicate with the REST API.
