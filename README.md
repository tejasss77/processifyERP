# ProcessifyERP — B2B Wholesale Operations & CRM Portal

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![React](https://img.shields.io/badge/React-18.0-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=nodedotjs)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express)
![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748?logo=prisma)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite)
![AWS](https://img.shields.io/badge/AWS-EC2%20Ubuntu-232F3E?logo=amazon-aws)
![Nginx](https://img.shields.io/badge/Nginx-1.28-009639?logo=nginx)
![PM2](https://img.shields.io/badge/PM2-Daemon-2B037A?logo=pm2)

ProcessifyERP is an enterprise-grade, full-stack **B2B Wholesale Operations & CRM Portal** designed to manage customer relationships, product catalog inventory, transactional sales delivery challans, GST tax invoicing, commercial analytics, and multi-tier administrative governance workflows.

---

## 🌐 Live AWS Production Server & Demo

- **Live Platform URL**: [http://13.48.149.82](http://13.48.149.82)
- **GitHub Repository**: [https://github.com/tejasss77/processifyERP](https://github.com/tejasss77/processifyERP)
- **Deployment Infrastructure**: AWS EC2 (Ubuntu 22.04 LTS) + Nginx Reverse Proxy + PM2 Process Manager + Prisma SQLite DB

### 🔑 Demo Login Credentials (Click & Test Any Role)

| Role | Work Email | Password | Access & Capabilities |
|---|---|---|---|
| 👑 **System Admin** | `admin@processify.com` | `admin123` | Full Access, Admin Approvals Queue, User Management, Reports |
| 💼 **Sales Manager** | `sales@processify.com` | `sales123` | Customer CRM, Challan Creation, Lead Follow-up Notes, Reports |
| 📦 **Warehouse Spec** | `warehouse@processify.com` | `warehouse123` | Products Catalog, Stock IN/OUT Adjustments, Movement Audit Logs |
| 📑 **Accounts Manager** | `accounts@processify.com` | `accounts123` | Confirmed Sales Invoices, GST Tax Breakdown, Financial Reports |

---

## 🌟 Key Platform Features

### 1. 🏢 B2B Customer CRM & Relationship Center
- **B2B Directory**: Filter customer accounts by status (`LEAD`, `ACTIVE`, `INACTIVE`, `CONVERTED`) and business classification (`WHOLESALE`, `DISTRIBUTOR`, `RETAIL`, `LEAD`).
- **Follow-up Scheduler**: Track upcoming customer sales follow-up dates.
- **Interaction History**: Log persistent sales interaction notes (`CustomerNote` table).

### 2. 📦 Product Master Catalog & Stock Audit
- **Stock Tracking**: Live physical inventory quantities, warehouse rack locations, and selling unit prices.
- **Low Stock Reorder Alerts**: Visual reorder warnings when `currentStock <= minStock`.
- **Immutable Movement Audit Log**: Transactional logging of Stock IN (purchases) and Stock OUT (sales delivery dispatches) with user attribution.

### 3. 📄 Sales Delivery Challan Workflow
- **Draft Orders**: Create delivery orders with multiple line items without locking stock.
- **Snapshot Price Locking**: Captures historical unit price, product name, and SKU snapshots at order creation time to protect against future catalog price edits.
- **Atomic Stock Reduction**: Confirming a sales challan executes an atomic database transaction that validates available stock, decrements inventory, and logs Stock OUT audit records.

### 4. 🧾 B2B Tax Invoicing (GST Rule 46 Compliant)
- **Dual Document Switcher**: Seamlessly toggle between **Delivery Challan** (`#CH-2026-XXXX`) and **B2B Tax Invoice** (`#INV-2026-XXXX`).
- **GST Calculations**: Automated 18% GST calculation (CGST 9% + SGST 9%) with taxable amount, line totals, and grand total.
- **Printable Tax Invoice**: High-contrast, printable B2B tax invoice template complete with Supplier GSTIN (`24AAAAA0000A1Z5`), Buyer GSTIN, HSN/SKU line items, HDFC remittance bank details, and authorized signature area.

### 5. 📊 Reports & Audits Center
- **Executive KPI Cards**: Total Gross Revenue, Warehouse Asset Valuation, Stock Movement Velocity, Low Stock Alerts.
- **Categorized Inventory Valuation**: Breakdown of asset value across product categories (Monitors, Laptops, Accessories, Networking, Storage, Printers).
- **Customer Segmentation**: Customer classification breakdown & lead conversion metrics.
- **One-Click Export**: Export comprehensive business analytics report to CSV.

### 6. 🛡️ Admin Approvals & Governance Queue (Maker-Checker)
- **High-Value Governance Rule**: Sales Orders with total amount `≥ ₹1,00,000` created by non-Admin staff automatically enter `PENDING_APPROVAL` status when submitted for confirmation.
- **Maker-Checker Control Room**: Dedicated `/approvals` dashboard displaying pending requests, requesting user details, and requested order totals.
- **Admin Decision Actions**:
  - **Approve (Green)**: Triggers atomic database transaction confirming order, reducing stock, logging audit trail, and generating Tax Invoice.
  - **Reject (Red)**: Opens modal to input mandatory rejection reason note, cancelling the order and notifying staff.

### 7. 🎨 Premium UI/UX & Brand Aesthetics
- Dark mode slate glassmorphism theme (`#0F172A`).
- Transparent background brand logo with white contrast filter styling (`brightness(0) invert(1)`).
- Human-styled, concise B2B Landing Page (`/`).

---

## 📐 System Architecture & Technology Stack

```
                                  USER BROWSER / CLIENT
                                            │
                                            ▼
                             ┌──────────────────────────────┐
                             │    AWS EC2 (Ubuntu Server)   │
                             │                              │
                             │      Nginx Web Server        │
                             │     (Port 80 / Port 443)     │
                             └──────────────┬───────────────┘
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    ▼                                               ▼
     ┌─────────────────────────────┐                 ┌─────────────────────────────┐
     │  Static Frontend Asset Host │                 │    Reverse Proxy (/api)     │
     │  (Vite React Production)    │                 │   http://localhost:5001     │
     └─────────────────────────────┘                 └──────────────┬──────────────┘
                                                                    │
                                                                    ▼
                                                     ┌─────────────────────────────┐
                                                     │    PM2 Process Manager      │
                                                     │  Node.js / Express Backend  │
                                                     └──────────────┬──────────────┘
                                                                    │
                                                                    ▼
                                                     ┌─────────────────────────────┐
                                                     │    Prisma ORM Data Layer    │
                                                     └──────────────┬──────────────┘
                                                                    │
                                                                    ▼
                                                     ┌─────────────────────────────┐
                                                     │ SQLite Database (dev.db)    │
                                                     └─────────────────────────────┘
```

---

## 🗄️ Database Schema & Data Models

The database schema is defined in [backend/prisma/schema.prisma](file:///Users/tejas/Desktop/processifyERP/backend/prisma/schema.prisma):

```prisma
model User {
  id                 String            @id @default(uuid())
  name               String
  email              String            @unique
  passwordHash       String
  role               String            @default("SALES") // ADMIN, SALES, WAREHOUSE, ACCOUNTS
  createdAt          DateTime          @default(now())
  updatedAt          DateTime          @updatedAt
  customerNotes      CustomerNote[]
  stockMovements     StockMovement[]
  challans           Challan[]
  requestedApprovals ApprovalRequest[] @relation("RequestedApprovals")
  approvedApprovals  ApprovalRequest[] @relation("ApprovedApprovals")
}

model Customer {
  id           String         @id @default(uuid())
  name         String
  mobile       String
  email        String?
  businessName String
  gstNumber    String?
  customerType String         @default("LEAD")
  address      String?
  status       String         @default("LEAD")
  followUpDate DateTime?
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
  notes        CustomerNote[]
  challans     Challan[]
}

model Product {
  id                String          @id @default(uuid())
  name              String
  sku               String          @unique
  category          String
  unitPrice         Float
  currentStock      Int             @default(0)
  minStock          Int             @default(0)
  warehouseLocation String
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  stockMovements    StockMovement[]
  challanItems      ChallanItem[]
}

model StockMovement {
  id           String   @id @default(uuid())
  productId    String
  quantity     Int
  movementType String   // IN, OUT
  reason       String
  createdBy    String
  createdAt    DateTime @default(now())
  product      Product  @relation(fields: [productId], references: [id])
  user         User     @relation(fields: [createdBy], references: [id])
}

model Challan {
  id            String        @id @default(uuid())
  challanNumber String        @unique
  customerId    String
  status        String        @default("DRAFT") // DRAFT, PENDING_APPROVAL, CONFIRMED, CANCELLED
  totalQuantity Int           @default(0)
  totalAmount   Float         @default(0.0)
  createdBy     String
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  customer      Customer      @relation(fields: [customerId], references: [id])
  user          User          @relation(fields: [createdBy], references: [id])
  items         ChallanItem[]
}

model ChallanItem {
  id          String   @id @default(uuid())
  challanId   String
  productId   String
  productName String
  sku         String
  quantity    Int
  unitPrice   Float
  lineTotal   Float
  challan     Challan  @relation(fields: [challanId], references: [id])
  product     Product  @relation(fields: [productId], references: [id])
}

model ApprovalRequest {
  id              String   @id @default(uuid())
  requestType     String   // HIGH_VALUE_CHALLAN, STOCK_ADJUSTMENT
  entityId        String
  title           String
  description     String
  amount          Float?
  status          String   @default("PENDING") // PENDING, APPROVED, REJECTED
  requestedBy     String
  approvedBy      String?
  rejectionReason String?
  createdAt       DateTime @default(now())
  user            User     @relation("RequestedApprovals", fields: [requestedBy], references: [id])
  approver        User?    @relation("ApprovedApprovals", fields: [approvedBy], references: [id])
}
```

---

## 📡 REST API Reference

| Endpoint | Method | Role Access | Description |
|---|---|---|---|
| `/api/auth/login` | `POST` | Public | Authenticate user & issue JWT token |
| `/api/auth/me` | `GET` | Authenticated | Get currently logged-in user profile |
| `/api/customers` | `GET`, `POST` | All Roles | List B2B customers or create new customer account |
| `/api/customers/:id` | `GET`, `PUT` | All Roles | Get customer details or update profile |
| `/api/customers/:id/notes` | `POST` | All Roles | Add interaction follow-up note for customer |
| `/api/products` | `GET`, `POST` | All Roles | List catalog products or add new SKU |
| `/api/products/:id/stock` | `PATCH` | Warehouse, Admin | Perform Stock IN purchase receipt or manual adjustment |
| `/api/stock-movements` | `GET` | All Roles | Filterable Stock IN & Stock OUT audit trail |
| `/api/challans` | `GET`, `POST` | Sales, Admin | List sales challans or create new draft challan |
| `/api/challans/:id` | `GET` | All Roles | Get challan details, snapshot items, and tax invoice |
| `/api/challans/:id/confirm` | `POST` | Sales, Admin | Confirm sales order (triggers stock deduction or approval) |
| `/api/challans/:id/cancel` | `POST` | Sales, Admin | Cancel draft sales order |
| `/api/reports/analytics` | `GET` | All Roles | Executive KPIs, inventory asset valuation & analytics |
| `/api/approvals` | `GET` | Admin | List pending, approved, and rejected governance requests |
| `/api/approvals/:id/approve` | `POST` | Admin | Approve pending governance request |
| `/api/approvals/:id/reject` | `POST` | Admin | Reject governance request with audit note |
| `/api/users` | `GET`, `POST` | Admin Only | List system staff accounts or onboard new user |

---

## 💻 Local Installation & Setup

### Prerequisites
- Node.js 18+ or 20+
- npm or yarn

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/tejasss77/processifyERP.git
cd processifyERP

# Install Backend Dependencies
cd backend
npm install

# Install Frontend Dependencies
cd ../frontend
npm install
```

### 2. Setup Environment Variables
Create `.env` inside `backend/`:
```env
PORT=5001
DATABASE_URL="file:./dev.db"
JWT_SECRET="processify_development_jwt_secret_key_2026"
CORS_ORIGIN="http://localhost:5173"
```

### 3. Initialize Database & Seed Data
```bash
cd backend
npx prisma db push
npm run seed
```

### 4. Run Development Servers
```bash
# Terminal 1: Backend Server (Port 5001)
cd backend
npm run dev

# Terminal 2: Frontend Vite Dev Server (Port 5173)
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🚢 AWS Production Deployment Guide

Deploying to an **AWS EC2 Ubuntu 22.04 LTS** instance:

```bash
# 1. Update system & install Node 20, Git, Nginx, PM2
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx
sudo npm install -g pm2

# 2. Clone Repository & Setup Backend
git clone https://github.com/tejasss77/processifyERP.git
cd processifyERP/backend
npm install
npx prisma db push
npm run seed
npm run build
pm2 start dist/server.js --name "processify-backend"
pm2 startup
pm2 save

# 3. Build Frontend Application
cd ../frontend
npm install
npm run build

# 4. Configure Nginx Server
sudo tee /etc/nginx/sites-available/processifyerp > /dev/null << 'EOF'
server {
    listen 80 default_server;
    server_name _;

    location / {
        root /home/ubuntu/processifyERP/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOF

# 5. Fix Nginx Directory Permissions & Restart
chmod 755 /home/ubuntu
chmod -R 755 /home/ubuntu/processifyERP/frontend/dist
sudo ln -sf /etc/nginx/sites-available/processifyerp /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo systemctl restart nginx
```

---

## 🎯 Recruiter & Evaluation Q&A Guide

When presenting ProcessifyERP to technical recruiters, team leads, or evaluators:

### Q1: Why use Snapshot Line Items in Sales Delivery Challans?
> *"If a product's price or name is updated in the master product catalog in the future, past sales orders and tax invoices must not change retroactively. We record `productName`, `sku`, and `unitPrice` as immutable snapshot fields in `ChallanItem` at the exact moment of order creation, protecting legal and financial data integrity."*

### Q2: How is race condition/stock overselling prevented?
> *"Stock validation and deduction are wrapped inside an atomic Prisma database transaction (`prisma.$transaction`). Before decrementing inventory, available stock is checked against requested quantity inside the transaction context. If available stock is insufficient, an HTTP 409 Conflict error is returned and the entire transaction rolls back."*

### Q3: What is the Maker-Checker governance pattern?
> *"It separates creation from authorization. Operational staff (Sales, Warehouse) create transactions, but sensitive actions (such as Sales Orders ≥ ₹1,00,000) enter `PENDING_APPROVAL` status and require explicit sign-off from an Administrator in the `/approvals` dashboard before inventory is modified."*

---

## 📝 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
