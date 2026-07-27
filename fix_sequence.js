require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
