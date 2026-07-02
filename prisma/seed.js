const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const fs = require('fs');

let dbUrl = process.env.DATABASE_URL;
if (dbUrl && dbUrl.startsWith('prisma+postgres://')) {
  dbUrl = 'postgres://postgres:postgres@localhost:51214/template1?sslmode=disable';
}
const pool = new Pool({ connectionString: dbUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear existing items if any
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});

  const catalogText = fs.readFileSync(path.join(__dirname, '../catalog.txt'), 'utf8');
  const lines = catalogText.split('\n');

  let currentCategory = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('## ')) {
      // It's a category
      const categoryName = trimmed.replace('## ', '').trim();
      const slug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      // Skip unwanted text block from bottom of page
      if (categoryName.includes('தரமான பட்டாசுகளை')) continue;

      currentCategory = await prisma.category.create({
        data: {
          name: categoryName,
          slug: slug
        }
      });
      console.log(`Created Category: ${categoryName}`);
    } else if (trimmed.startsWith('##### ')) {
      // It's a product under the current category
      const productName = trimmed.replace('##### ', '').trim();
      if (currentCategory && !productName.includes('தரமான பட்டாசுகளை')) {
        await prisma.product.create({
          data: {
            name: productName,
            description: `Premium ${productName} from Hero Crackers.`,
            price: 99.99, // Dummy price for demo
            stock: 1000,
            categoryId: currentCategory.id,
            imageUrls: ['/chakkar.png'] // Fallback premium image
          }
        });
        console.log(`  Created Product: ${productName}`);
      }
    }
  }

  console.log('Database seeding successfully completed with Hero Crackers catalog!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
