import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const Role = {
  ADMIN: 'ADMIN',
  SALES: 'SALES',
  WAREHOUSE: 'WAREHOUSE',
  ACCOUNTS: 'ACCOUNTS',
} as const;

export const CustomerType = {
  LEAD: 'LEAD',
  RETAIL: 'RETAIL',
  WHOLESALE: 'WHOLESALE',
  DISTRIBUTOR: 'DISTRIBUTOR',
} as const;

export const CustomerStatus = {
  LEAD: 'LEAD',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  CONVERTED: 'CONVERTED',
} as const;

export const MovementType = {
  IN: 'IN',
  OUT: 'OUT',
} as const;

export const ChallanStatus = {
  DRAFT: 'DRAFT',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
} as const;

async function main() {
  console.log('Seeding ProcessifyERP database with comprehensive enterprise operations data...');

  // 1. Clear existing data
  await prisma.challanItem.deleteMany();
  await prisma.challan.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.customerNote.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // 2. Hash default passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const salesPassword = await bcrypt.hash('sales123', 10);
  const warehousePassword = await bcrypt.hash('warehouse123', 10);
  const accountsPassword = await bcrypt.hash('accounts123', 10);

  // 3. Create Users for all 4 required roles
  const adminUser = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@processify.com',
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  });

  const salesUser = await prisma.user.create({
    data: {
      name: 'Sales Manager (Rahul)',
      email: 'sales@processify.com',
      passwordHash: salesPassword,
      role: Role.SALES,
    },
  });

  const warehouseUser = await prisma.user.create({
    data: {
      name: 'Warehouse Lead (Vikram)',
      email: 'warehouse@processify.com',
      passwordHash: warehousePassword,
      role: Role.WAREHOUSE,
    },
  });

  const accountsUser = await prisma.user.create({
    data: {
      name: 'Accounts Specialist (Priya)',
      email: 'accounts@processify.com',
      passwordHash: accountsPassword,
      role: Role.ACCOUNTS,
    },
  });

  console.log('Users seeded: Admin, Sales, Warehouse, Accounts.');

  // 4. Create 10 B2B Customers
  const customer1 = await prisma.customer.create({
    data: {
      name: 'Rahul Sharma',
      mobile: '+91 9876543210',
      email: 'rahul@abctraders.com',
      businessName: 'ABC Traders Pvt Ltd',
      gstNumber: '24AAAAA0000A1Z5',
      customerType: CustomerType.WHOLESALE,
      address: 'Plot 42, GIDC Industrial Estate, Vadodara, Gujarat 390010',
      status: CustomerStatus.ACTIVE,
      followUpDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Amit Patel',
      mobile: '+91 9823456789',
      email: 'amit@xyzstore.in',
      businessName: 'XYZ Electronics Store',
      gstNumber: '24BBBBB1111B2Z4',
      customerType: CustomerType.RETAIL,
      address: 'Shop 12, Sunrise Complex, C.G. Road, Ahmedabad, Gujarat 380009',
      status: CustomerStatus.LEAD,
      followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      name: 'Neha Gupta',
      mobile: '+91 9911223344',
      email: 'neha@pqrtech.com',
      businessName: 'PQR Tech Solutions Ltd',
      gstNumber: '27CCCCC2222C3Z3',
      customerType: CustomerType.DISTRIBUTOR,
      address: 'Suite 304, IT Park, Hinjewadi, Pune, Maharashtra 411057',
      status: CustomerStatus.CONVERTED,
      followUpDate: null,
    },
  });

  const customer4 = await prisma.customer.create({
    data: {
      name: 'Vikramaditya Rao',
      mobile: '+91 9765432109',
      email: 'contact@apexglobal.com',
      businessName: 'Apex Global Enterprises',
      gstNumber: '29DDDDD3333D4Z2',
      customerType: CustomerType.WHOLESALE,
      address: 'Industrial Suburb, Peenya 2nd Stage, Bengaluru, Karnataka 560058',
      status: CustomerStatus.ACTIVE,
      followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  });

  const customer5 = await prisma.customer.create({
    data: {
      name: 'Sanjay Mehta',
      mobile: '+91 9812345678',
      email: 'sanjay@zenithsystems.com',
      businessName: 'Zenith Systems & Peripherals',
      gstNumber: '27EEEEE4444E5Z1',
      customerType: CustomerType.DISTRIBUTOR,
      address: 'Lamington Road, Grant Road East, Mumbai, Maharashtra 400007',
      status: CustomerStatus.ACTIVE,
      followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const customer6 = await prisma.customer.create({
    data: {
      name: 'Pooja Verma',
      mobile: '+91 9988776655',
      email: 'pooja@horizonretail.in',
      businessName: 'Horizon Retail Outlets',
      gstNumber: '07FFFFF5555F6Z0',
      customerType: CustomerType.RETAIL,
      address: 'Nehru Place Commercial Complex, New Delhi 110019',
      status: CustomerStatus.LEAD,
      followUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    },
  });

  const customer7 = await prisma.customer.create({
    data: {
      name: 'Anish Deshmukh',
      mobile: '+91 9845012345',
      email: 'anish@techhub.co.in',
      businessName: 'TechHub Distribution Pvt Ltd',
      gstNumber: '27GGGGG6666G7ZY',
      customerType: CustomerType.DISTRIBUTOR,
      address: 'MIDC Phase 2, Thane Belapur Road, Navi Mumbai 400705',
      status: CustomerStatus.ACTIVE,
      followUpDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    },
  });

  const customer8 = await prisma.customer.create({
    data: {
      name: 'Karan Singhania',
      mobile: '+91 9711009988',
      email: 'karan@metrocommercial.com',
      businessName: 'Metro Commercial Supplies',
      gstNumber: '19HHHHH7777H8ZX',
      customerType: CustomerType.WHOLESALE,
      address: 'Park Street Extension, Kolkata, West Bengal 700016',
      status: CustomerStatus.ACTIVE,
      followUpDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    },
  });

  // 5. Create Follow-up Notes
  await prisma.customerNote.createMany({
    data: [
      {
        customerId: customer1.id,
        note: 'Customer requested quotation for 50 monitors and 100 keyboards. Follow up next week.',
        createdBy: salesUser.id,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        customerId: customer1.id,
        note: 'Discussed wholesale discount tiers. Customer agreed to 5% bulk rebate on orders over ₹2,000,000.',
        createdBy: salesUser.id,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        customerId: customer2.id,
        note: 'Initial phone call. Store owner interested in gaming peripherals. Sent product catalog.',
        createdBy: salesUser.id,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        customerId: customer4.id,
        note: 'Apex requested urgent delivery of 10 HP ProBooks for corporate client project.',
        createdBy: salesUser.id,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        customerId: customer5.id,
        note: 'Zenith Systems reviewed Q3 contract. Renewal scheduled for end of month.',
        createdBy: salesUser.id,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  // 6. Create Seed Products (12 Products across categories)
  const product1 = await prisma.product.create({
    data: {
      name: 'Dell UltraSharp 27" 4K Monitor',
      sku: 'MON-DELL-27U',
      category: 'Monitors',
      unitPrice: 32500,
      currentStock: 25,
      minStock: 10,
      warehouseLocation: 'Vadodara WH-Rack-A1',
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: 'Logitech MX Master 3S Wireless Mouse',
      sku: 'ACC-LOGI-MX3S',
      category: 'Accessories',
      unitPrice: 8990,
      currentStock: 4, // LOW STOCK ALERT! (4 <= 15)
      minStock: 15,
      warehouseLocation: 'Vadodara WH-Rack-B3',
    },
  });

  const product3 = await prisma.product.create({
    data: {
      name: 'Keychron K2 Mechanical Keyboard',
      sku: 'ACC-KEY-K2',
      category: 'Accessories',
      unitPrice: 7490,
      currentStock: 50,
      minStock: 20,
      warehouseLocation: 'Vadodara WH-Rack-B4',
    },
  });

  const product4 = await prisma.product.create({
    data: {
      name: 'HP ProBook 450 G10 i7 16GB/512GB',
      sku: 'LAP-HP-450G10',
      category: 'Laptops',
      unitPrice: 78500,
      currentStock: 3, // LOW STOCK ALERT! (3 <= 5)
      minStock: 5,
      warehouseLocation: 'Vadodara WH-Vault-1',
    },
  });

  const product5 = await prisma.product.create({
    data: {
      name: 'Samsung Odyssey G7 32" Curved Gaming Monitor',
      sku: 'MON-SAMS-G7',
      category: 'Monitors',
      unitPrice: 49900,
      currentStock: 12,
      minStock: 5,
      warehouseLocation: 'Vadodara WH-Rack-A3',
    },
  });

  const product6 = await prisma.product.create({
    data: {
      name: 'Lenovo ThinkPad E14 Gen 5 i5 16GB/1TB',
      sku: 'LAP-LEN-E14G5',
      category: 'Laptops',
      unitPrice: 64500,
      currentStock: 18,
      minStock: 8,
      warehouseLocation: 'Vadodara WH-Vault-2',
    },
  });

  const product7 = await prisma.product.create({
    data: {
      name: 'SanDisk Extreme PRO 2TB NVMe SSD',
      sku: 'STO-SAND-2TB',
      category: 'Storage',
      unitPrice: 16990,
      currentStock: 2, // LOW STOCK ALERT!
      minStock: 10,
      warehouseLocation: 'Vadodara WH-Rack-C1',
    },
  });

  const product8 = await prisma.product.create({
    data: {
      name: 'Cisco 24-Port Gigabit Managed Switch',
      sku: 'NET-CIS-24G',
      category: 'Networking',
      unitPrice: 28400,
      currentStock: 15,
      minStock: 6,
      warehouseLocation: 'Vadodara WH-Rack-D2',
    },
  });

  const product9 = await prisma.product.create({
    data: {
      name: 'TP-Link Archer AX6000 Wi-Fi 6 Router',
      sku: 'NET-TPL-AX6000',
      category: 'Networking',
      unitPrice: 19500,
      currentStock: 22,
      minStock: 8,
      warehouseLocation: 'Vadodara WH-Rack-D4',
    },
  });

  const product10 = await prisma.product.create({
    data: {
      name: 'Canon imageCLASS MF244dw Laser Printer',
      sku: 'PRN-CAN-244DW',
      category: 'Printers',
      unitPrice: 22900,
      currentStock: 7,
      minStock: 5,
      warehouseLocation: 'Vadodara WH-Rack-E1',
    },
  });

  // 7. Create Initial & Recent Stock Movement Audit Logs (IN & OUT)
  await prisma.stockMovement.createMany({
    data: [
      {
        productId: product1.id,
        quantity: 30,
        movementType: MovementType.IN,
        reason: 'PO Purchase Receipt #PO-2026-001',
        createdBy: warehouseUser.id,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      },
      {
        productId: product2.id,
        quantity: 20,
        movementType: MovementType.IN,
        reason: 'PO Purchase Receipt #PO-2026-002',
        createdBy: warehouseUser.id,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      },
      {
        productId: product3.id,
        quantity: 60,
        movementType: MovementType.IN,
        reason: 'PO Purchase Receipt #PO-2026-003',
        createdBy: warehouseUser.id,
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      },
      {
        productId: product4.id,
        quantity: 15,
        movementType: MovementType.IN,
        reason: 'PO Purchase Receipt #PO-2026-004',
        createdBy: warehouseUser.id,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        productId: product5.id,
        quantity: 15,
        movementType: MovementType.IN,
        reason: 'PO Purchase Receipt #PO-2026-005',
        createdBy: warehouseUser.id,
        createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      },
      {
        productId: product6.id,
        quantity: 20,
        movementType: MovementType.IN,
        reason: 'PO Purchase Receipt #PO-2026-006',
        createdBy: warehouseUser.id,
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      },
      {
        productId: product7.id,
        quantity: 10,
        movementType: MovementType.IN,
        reason: 'PO Purchase Receipt #PO-2026-007',
        createdBy: warehouseUser.id,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        productId: product8.id,
        quantity: 18,
        movementType: MovementType.IN,
        reason: 'PO Purchase Receipt #PO-2026-008',
        createdBy: warehouseUser.id,
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      },
      {
        productId: product1.id,
        quantity: 5,
        movementType: MovementType.OUT,
        reason: 'Sales Delivery Challan #CH-2026-0002',
        createdBy: salesUser.id,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        productId: product2.id,
        quantity: 16,
        movementType: MovementType.OUT,
        reason: 'Sales Delivery Challan #CH-2026-0003',
        createdBy: salesUser.id,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        productId: product4.id,
        quantity: 12,
        movementType: MovementType.OUT,
        reason: 'Sales Delivery Challan #CH-2026-0004',
        createdBy: salesUser.id,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        productId: product7.id,
        quantity: 8,
        movementType: MovementType.OUT,
        reason: 'Sales Delivery Challan #CH-2026-0005',
        createdBy: salesUser.id,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  // 8. Create Sample Sales Challans
  // Challan 1: Draft
  await prisma.challan.create({
    data: {
      challanNumber: 'CH-2026-0001',
      customerId: customer1.id,
      status: ChallanStatus.DRAFT,
      totalQuantity: 3,
      totalAmount: 106470,
      createdBy: salesUser.id,
      items: {
        create: [
          {
            productId: product1.id,
            productName: product1.name,
            sku: product1.sku,
            quantity: 2,
            unitPrice: product1.unitPrice,
            lineTotal: product1.unitPrice * 2,
          },
          {
            productId: product2.id,
            productName: product2.name,
            sku: product2.sku,
            quantity: 1,
            unitPrice: product2.unitPrice,
            lineTotal: product2.unitPrice * 1,
          },
        ],
      },
    },
  });

  // Challan 2: Confirmed
  await prisma.challan.create({
    data: {
      challanNumber: 'CH-2026-0002',
      customerId: customer3.id,
      status: ChallanStatus.CONFIRMED,
      totalQuantity: 5,
      totalAmount: 162500,
      createdBy: salesUser.id,
      items: {
        create: [
          {
            productId: product1.id,
            productName: product1.name,
            sku: product1.sku,
            quantity: 5,
            unitPrice: product1.unitPrice,
            lineTotal: product1.unitPrice * 5,
          },
        ],
      },
    },
  });

  // Challan 3: Confirmed
  await prisma.challan.create({
    data: {
      challanNumber: 'CH-2026-0003',
      customerId: customer4.id,
      status: ChallanStatus.CONFIRMED,
      totalQuantity: 16,
      totalAmount: 143840,
      createdBy: salesUser.id,
      items: {
        create: [
          {
            productId: product2.id,
            productName: product2.name,
            sku: product2.sku,
            quantity: 16,
            unitPrice: product2.unitPrice,
            lineTotal: product2.unitPrice * 16,
          },
        ],
      },
    },
  });

  // Challan 4: Confirmed
  await prisma.challan.create({
    data: {
      challanNumber: 'CH-2026-0004',
      customerId: customer5.id,
      status: ChallanStatus.CONFIRMED,
      totalQuantity: 12,
      totalAmount: 942000,
      createdBy: salesUser.id,
      items: {
        create: [
          {
            productId: product4.id,
            productName: product4.name,
            sku: product4.sku,
            quantity: 12,
            unitPrice: product4.unitPrice,
            lineTotal: product4.unitPrice * 12,
          },
        ],
      },
    },
  });

  // Challan 5: Draft
  await prisma.challan.create({
    data: {
      challanNumber: 'CH-2026-0005',
      customerId: customer7.id,
      status: ChallanStatus.DRAFT,
      totalQuantity: 5,
      totalAmount: 142000,
      createdBy: salesUser.id,
      items: {
        create: [
          {
            productId: product8.id,
            productName: product8.name,
            sku: product8.sku,
            quantity: 5,
            unitPrice: product8.unitPrice,
            lineTotal: product8.unitPrice * 5,
          },
        ],
      },
    },
  });

  console.log('Database seeding completed cleanly!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
