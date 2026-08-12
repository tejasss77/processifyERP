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
  console.log('Seeding ProcessifyERP database with enterprise operations data...');

  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log(`Database already has ${existingUsers} users. Skipping initial seed.`);
    return;
  }

  // Hash default passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const salesPassword = await bcrypt.hash('sales123', 10);
  const warehousePassword = await bcrypt.hash('warehouse123', 10);
  const accountsPassword = await bcrypt.hash('accounts123', 10);

  // Create Users for all 4 required roles
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

  // Create B2B Customers
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

  // Customer Notes
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
    ],
  });

  // Seed Products
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
      currentStock: 4,
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
      currentStock: 3,
      minStock: 5,
      warehouseLocation: 'Vadodara WH-Vault-1',
    },
  });

  // Seed Challan
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

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
