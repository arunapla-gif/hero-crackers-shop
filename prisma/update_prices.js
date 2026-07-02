const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const cheerio = require('cheerio');

let dbUrl = process.env.DATABASE_URL;
if (dbUrl && dbUrl.startsWith('prisma+postgres://')) {
  dbUrl = 'postgres://postgres:postgres@localhost:51214/template1?sslmode=disable';
}
const pool = new Pool({ connectionString: dbUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function updatePrices() {
  console.log('Fetching herocrackers.com/Order.php...');
  const res = await fetch('https://herocrackers.com/Order.php');
  const html = await res.text();
  const $ = cheerio.load(html);

  const priceMap = {};

  // Extract products and their prices
  // The structure is roughly:
  // <h6><b>PRODUCT NAME</b>...</h6>
  // ... <b>₹40.00</b>
  
  $('h6 b').each((i, el) => {
    const productName = $(el).text().trim();
    if (!productName) return;
    
    // Find the next table, and the b tag containing the price inside it
    // The price is usually in a <b> tag with the ₹ symbol, inside the table following the h6
    const table = $(el).closest('h6').nextAll('table').first();
    const priceText = table.find('b').text().trim(); // e.g. "₹40.00"
    
    if (priceText && priceText.includes('₹')) {
      const priceVal = parseFloat(priceText.replace('₹', '').trim());
      if (!isNaN(priceVal)) {
        priceMap[productName.toUpperCase()] = priceVal;
      }
    }
  });
  
  console.log(`Found ${Object.keys(priceMap).length} prices to update.`);

  const products = await prisma.product.findMany();
  let updatedCount = 0;

  for (const product of products) {
    const key = product.name.toUpperCase().trim();
    if (priceMap[key] !== undefined) {
      await prisma.product.update({
        where: { id: product.id },
        data: { price: priceMap[key] }
      });
      updatedCount++;
      console.log(`Updated ${product.name} to ₹${priceMap[key]}`);
    } else {
      console.log(`Warning: Could not find price for ${product.name}`);
    }
  }

  console.log(`Successfully updated ${updatedCount} products.`);
}

updatePrices()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
