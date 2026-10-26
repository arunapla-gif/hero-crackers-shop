require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function fix() {
  const products = await prisma.product.findMany({
    orderBy: [
      { sequence: 'asc' },
      { name: 'asc' }
    ]
  });

  console.log(`Found ${products.length} products`);
  
  for (let i = 0; i < products.length; i++) {
    await prisma.product.update({
      where: { id: products[i].id },
      data: { sequence: i + 1 }
    });
  }
  
  console.log('Fixed sequences successfully.');
}

fix()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
