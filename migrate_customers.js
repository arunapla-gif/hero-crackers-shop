const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

async function main() {
  console.log('Starting CustomerMaster migration...');

  const dbUrl = "postgresql://postgres.gqfpfnqepdkletbbhwcx:IevuJqEtZ8V1eKhz@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?schema=shop"
  const pool = new Pool({ 
    connectionString: dbUrl,
    max: 1,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 15000,
    allowExitOnIdle: true
  })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  const orders = await prisma.order.findMany({
    where: {
      customerPhone: { not: null }
    },
    include: {
      user: true
    },
    orderBy: { createdAt: 'asc' }
  });

  console.log(`Found ${orders.length} orders with phone numbers.`);

  let created = 0;
  let updated = 0;

  for (const order of orders) {
    if (!order.customerPhone) continue;

    const phone = order.customerPhone.replace(/[^0-9]/g, '').slice(-10); // Standardize to 10 digits
    if (phone.length !== 10) continue;

    const name = order.user?.name || 'Walk-in Customer';
    
    // Check if customer exists
    const existing = await prisma.customerMaster.findUnique({
      where: { primaryPhone: phone }
    });

    if (existing) {
      // Update with latest address
      await prisma.customerMaster.update({
        where: { primaryPhone: phone },
        data: {
          name: name !== 'Walk-in Customer' ? name : existing.name, // Prefer real names
          fullAddress: order.shippingAddress
        }
      });
      updated++;
    } else {
      // Create new customer
      await prisma.customerMaster.create({
        data: {
          primaryPhone: phone,
          name: name,
          fullAddress: order.shippingAddress
        }
      });
      created++;
    }
  }

  console.log(`Migration complete! Created: ${created}, Updated: ${updated}`);
  await prisma.$disconnect();
}

main().catch(e => console.error(e));
